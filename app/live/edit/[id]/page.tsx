'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { 
  Loader2, X, ImagePlus, AlertCircle, Copy, Eye, EyeOff, Camera, Mic, MicOff, Video, 
  VideoOff, Play, Square, RefreshCw, Wifi, CameraOff, Radio, ExternalLink, MonitorPlay
} from 'lucide-react'

type StreamTab = 'browser' | 'external'
type ConnStatus = 'offline' | 'connecting' | 'live'

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function EditLiveStreamPage() {
  const params = useParams()
  const router = useRouter()
  const streamId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: '',
    semester: '',
    module_name: '',
    scheduled_start_time: '',
  })

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Streaming state ─────────────────────────────────────────────────────────
  const [streamData, setStreamData] = useState({
    videoId: '',
    streamKey: '',
    streamUrl: 'rtmp://a.rtmp.youtube.com/live2',
    thumbnailUrl: '',
  })
  const [activeTab, setActiveTab] = useState<StreamTab>('browser')
  const [connStatus, setConnStatus] = useState<ConnStatus>('offline')
  const [keyVisible, setKeyVisible] = useState(false)
  const [streamError, setStreamError] = useState('')

  // ── Browser streaming state ────────────────────────────────────────────────
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCamOff, setIsCamOff] = useState(false)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)

  // Fetch stream data
  useEffect(() => {
    const userId = localStorage.getItem('studentId')
    setCurrentUserId(userId)

    const fetchStream = async () => {
      try {
        const res = await fetch(`/api/live/streams/${streamId}`)
        if (!res.ok) {
          throw new Error('Failed to load stream')
        }

        const stream = await res.json()

        // Check ownership
        if (stream.creator_id !== userId) {
          setError('You can only edit your own streams')
          return
        }

        setFormData({
          title: stream.title || '',
          description: stream.description || '',
          year: stream.year || '',
          semester: stream.semester || '',
          module_name: stream.module_name || '',
          scheduled_start_time: stream.scheduled_start_time
            ? new Date(stream.scheduled_start_time).toISOString().slice(0, 16)
            : '',
        })

        if (stream.thumbnail_url) {
          setCurrentThumbnail(stream.thumbnail_url)
        }

        // Load streaming data
        setStreamData({
          videoId: stream.video_id || '',
          streamKey: stream.stream_key || '',
          streamUrl: stream.stream_url || 'rtmp://a.rtmp.youtube.com/live2',
          thumbnailUrl: stream.thumbnail_url || '',
        })

        setLoading(false)
      } catch (err: any) {
        console.error('Error loading stream:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    if (streamId) {
      fetchStream()
    }
  }, [streamId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      setError('You must be logged in')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let thumbnailUrl = currentThumbnail

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        const base64 = await toBase64(thumbnailFile)
        thumbnailUrl = `data:${thumbnailFile.type};base64,${base64}`
      }

      const res = await fetch(`/api/live/streams/${streamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: currentUserId,
          title: formData.title,
          description: formData.description,
          year: formData.year,
          semester: formData.semester,
          module_name: formData.module_name,
          scheduled_start_time: formData.scheduled_start_time
            ? new Date(formData.scheduled_start_time).toISOString()
            : null,
          thumbnail_url: thumbnailUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update stream')
      }

      setSuccess('Stream updated successfully!')
      setThumbnailFile(null)
      setThumbnailPreview(null)

      setTimeout(() => {
        router.push('/live')
      }, 2000)
    } catch (err: any) {
      console.error('Error updating stream:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Camera controls ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    setStreamError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: true,
      })
      setCameraStream(stream)
    } catch (err: any) {
      setStreamError('Camera access denied: ' + err.message)
    }
  }

  const toggleMute = () => {
    if (!cameraStream) return
    cameraStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setIsMuted(m => !m)
  }

  const toggleCam = () => {
    if (!cameraStream) return
    cameraStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setIsCamOff(c => !c)
  }

  // ── WHIP – Go Live ───────────────────────────────────────────────────────────
  const goLive = async () => {
    if (!cameraStream) return
    setConnStatus('connecting')
    setStreamError('')

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })
    peerConnectionRef.current = pc

    cameraStream.getTracks().forEach(track => pc.addTrack(track, cameraStream))

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') setConnStatus('live')
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setConnStatus('offline')
        setStreamError('WebRTC connection lost.')
      }
    }

    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      await new Promise<void>(resolve => {
        if (pc.iceGatheringState === 'complete') return resolve()
        const check = () => {
          if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', check); resolve() }
        }
        pc.addEventListener('icegatheringstatechange', check)
        setTimeout(resolve, 6000)
      })

      const whipUrl = `https://whip.youtube.com/whip/${streamData.streamKey}`
      const response = await fetch(whipUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription!.sdp,
      })

      if (!response.ok) throw new Error(`WHIP ${response.status}: ${await response.text()}`)

      await pc.setRemoteDescription({ type: 'answer', sdp: await response.text() })
      setConnStatus('live')
    } catch (err: any) {
      pc.close()
      setConnStatus('offline')
      setStreamError('Failed to go live: ' + err.message)
    }
  }

  // ── End stream ───────────────────────────────────────────────────────────────
  const endStream = async () => {
    peerConnectionRef.current?.close()
    peerConnectionRef.current = null
    cameraStream?.getTracks().forEach(t => t.stop())
    setCameraStream(null)
    setConnStatus('offline')
    try {
      await fetch('/api/live/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: streamData.videoId }),
      })
    } catch {}
  }

  // ── Check live ───────────────────────────────────────────────────────────────
  const checkIfLive = async () => {
    if (!streamData.videoId) return
    setConnStatus('connecting')
    setStreamError('')
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${streamData.videoId}&key=AIzaSyDB9WvHrAVJdWL6lFMJejW2gBP9SoMzsTk`
      )
      const data = await res.json()
      const liveStatus = data.items?.[0]?.snippet?.liveBroadcastContent
      if (liveStatus === 'live') {
        setConnStatus('live')
      } else {
        setConnStatus('offline')
        setStreamError('Not live yet. Start OBS then check again.')
      }
    } catch {
      setConnStatus('offline')
    }
  }

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach(t => t.stop())
      peerConnectionRef.current?.close()
    }
  }, [cameraStream])

  // ── Sync camera stream → video element ────────────────────────────────────
  useEffect(() => {
    if (cameraStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit & Go Live</h1>
          <p className="text-muted-foreground">Update your stream details or start broadcasting</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN — EDIT FORM */}
          <div className="space-y-6">
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-600">
                <span>✅ {success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Stream Thumbnail</label>
                <div>
                  {thumbnailPreview || currentThumbnail ? (
                    <div className="relative mb-4 rounded-lg overflow-hidden border border-border">
                      <img
                        src={thumbnailPreview || currentThumbnail || ''}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover"
                      />
                      {(thumbnailPreview || !currentThumbnail) && (
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : null}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-border rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ImagePlus className="w-5 h-5" />
                    Change Thumbnail
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Stream Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter stream title"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter stream description"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Academic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g., Year 1"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Semester</label>
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    placeholder="e.g., Semester 1"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Module Name</label>
                  <input
                    type="text"
                    name="module_name"
                    value={formData.module_name}
                    onChange={handleChange}
                    placeholder="e.g., Web Development"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Scheduled Start Time */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Scheduled Start Time</label>
                <input
                  type="datetime-local"
                  name="scheduled_start_time"
                  value={formData.scheduled_start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/live')}
                  className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Back to Streams
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN — STREAMING TABS */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
              {(['browser', 'external'] as StreamTab[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                  {tab === 'browser' ? '🎥 Browser' : '📡 OBS/External'}
                </button>
              ))}
            </div>

            {/* BROWSER STREAMING */}
            {activeTab === 'browser' && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Browser Stream</h3>
                
                <div className="bg-black rounded-lg overflow-hidden border border-border" style={{ aspectRatio: '16/9' }}>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video ref={videoPreviewRef} autoPlay muted playsInline
                      className={`w-full h-full object-cover ${!cameraStream || isCamOff ? 'hidden' : ''}`}
                    />
                    {(!cameraStream || isCamOff) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <CameraOff className="w-12 h-12 opacity-30" />
                        <p className="text-sm opacity-60">{!cameraStream ? 'Camera not started' : 'Camera paused'}</p>
                      </div>
                    )}
                    {connStatus === 'live' && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
                      </div>
                    )}
                  </div>
                </div>

                {cameraStream && (
                  <div className="flex items-center justify-center gap-3">
                    <button type="button" onClick={toggleMute}
                      className={`p-3 rounded-full border transition ${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-muted border-border text-foreground hover:bg-border'}`}>
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button type="button" onClick={toggleCam}
                      className={`p-3 rounded-full border transition ${isCamOff ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-muted border-border text-foreground hover:bg-border'}`}>
                      {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {streamError && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {streamError}
                  </div>
                )}

                <div className="flex gap-3">
                  {!cameraStream ? (
                    <button type="button" onClick={startCamera}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted border border-border hover:bg-border text-foreground font-medium rounded-lg transition">
                      <Camera className="w-5 h-5" /> Start Camera
                    </button>
                  ) : connStatus !== 'live' ? (
                    <button type="button" onClick={goLive} disabled={connStatus === 'connecting'}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition">
                      {connStatus === 'connecting' ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                      Go Live
                    </button>
                  ) : (
                    <button type="button" onClick={endStream}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-lg transition">
                      <Square className="w-5 h-5 fill-current" /> End Stream
                    </button>
                  )}
                </div>

                {/* Stream Key Display */}
                <div className="bg-background rounded-lg p-4 space-y-2 border border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Stream Key (for OBS)</p>
                  <div className="flex bg-background rounded-lg border border-input overflow-hidden relative">
                    <input type={keyVisible ? 'text' : 'password'} readOnly value={streamData.streamKey}
                      className="flex-1 bg-transparent p-2.5 text-sm text-foreground font-mono outline-none pr-20" />
                    <button type="button" onClick={() => setKeyVisible(v => !v)}
                      className="absolute right-12 top-2 text-muted-foreground hover:text-foreground px-2">
                      {keyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button type="button" onClick={() => navigator.clipboard.writeText(streamData.streamKey)}
                      className="px-3 hover:bg-accent text-muted-foreground transition border-l border-border z-10">
                      <Copy size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EXTERNAL SOFTWARE */}
            {activeTab === 'external' && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4" /> OBS / Streamlabs Settings
                </h3>
                <p className="text-sm text-muted-foreground">Paste into OBS → Settings → Stream → Custom</p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Server URL</label>
                  <div className="flex bg-background rounded-lg border border-input overflow-hidden">
                    <input readOnly value={streamData.streamUrl}
                      className="flex-1 bg-transparent p-2.5 text-sm text-foreground font-mono outline-none" />
                    <button type="button" onClick={() => navigator.clipboard.writeText(streamData.streamUrl)}
                      className="px-3 hover:bg-accent text-muted-foreground transition border-l border-border">
                      <Copy size={15} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Stream Key</label>
                  <div className="flex bg-background rounded-lg border border-input overflow-hidden relative">
                    <input type={keyVisible ? 'text' : 'password'} readOnly value={streamData.streamKey}
                      className="flex-1 bg-transparent p-2.5 text-sm text-foreground font-mono outline-none pr-20" />
                    <button type="button" onClick={() => setKeyVisible(v => !v)}
                      className="absolute right-12 top-2 text-muted-foreground hover:text-foreground px-2">
                      {keyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button type="button" onClick={() => navigator.clipboard.writeText(streamData.streamKey)}
                      className="px-3 hover:bg-accent text-muted-foreground transition border-l border-border z-10">
                      <Copy size={15} />
                    </button>
                  </div>
                  <p className="text-xs text-red-500">Keep this private – grants direct access to your stream.</p>
                </div>

                <div className="bg-muted rounded-lg p-4 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground mb-2">Recommended Settings</p>
                  <p>Video: 1920×1080 · 30 fps · 4500 kbps (H.264)</p>
                  <p>Audio: 160 kbps AAC · 44.1 kHz</p>
                </div>

                {streamError && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {streamError}
                  </div>
                )}

                <button type="button" onClick={checkIfLive} disabled={connStatus === 'connecting'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted border border-border hover:bg-border text-foreground rounded-lg text-sm transition disabled:opacity-50">
                  {connStatus === 'connecting' ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  Check Live Status
                </button>

                {connStatus === 'live' && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm font-medium">
                    <Wifi className="w-4 h-4" /> Stream is live!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
