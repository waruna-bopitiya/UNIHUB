"use client";

import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { AcademicSelector, type AcademicData } from '@/components/shared/academic-selector';
import {
  Settings, Copy, Eye, EyeOff, Radio, Loader2, ImagePlus, X,
  UploadCloud, MonitorPlay, Wifi, WifiOff, RefreshCw, Camera,
  CameraOff, Mic, MicOff, Video, VideoOff, ExternalLink, Send,
  Play, Square, AlertCircle
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = 'form' | 'streaming';
type StreamTab = 'browser' | 'external';
type ConnStatus = 'offline' | 'connecting' | 'live';

interface StreamInfo {
  videoId: string;
  streamKey: string;
  streamUrl: string;
  thumbnailUrl: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CreateLiveStreamPage() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [academicData, setAcademicData] = useState<AcademicData>({ year: '', semester: '', module_name: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStartTime: new Date().toISOString().slice(0, 16),
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Creation state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('form');
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [dateError, setDateError] = useState('');
  const [streamInfo, setStreamInfo] = useState<StreamInfo>({
    videoId: '', streamKey: '', streamUrl: 'rtmp://a.rtmp.youtube.com/live2', thumbnailUrl: null,
  });

  // ── Streaming dashboard state ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<StreamTab>('browser');
  const [connStatus, setConnStatus] = useState<ConnStatus>('offline');
  const [keyVisible, setKeyVisible] = useState(false);
  const [streamError, setStreamError] = useState('');

  // ── Browser streaming state ──────────────────────────────────────────────────
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // ── Post modal state ─────────────────────────────────────────────────────────
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Live Stream');
  const [postLoading, setPostLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userId = localStorage.getItem('studentId');
        const email = localStorage.getItem('email');
        
        console.log('📍 Fetching current user - userId:', userId, 'email:', email);
        
        if (!userId && !email) {
          console.warn('⚠️ No user ID or email in localStorage');
          return;
        }

        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);

        const res = await fetch(`/api/user/me?${params.toString()}`);
        if (res.ok) {
          const user = await res.json();
          console.log('✅ Current user fetched:', user);
          setCurrentUser(user);
        } else {
          console.warn('❌ Failed to fetch current user:', res.status);
        }
      } catch (error) {
        console.error('❌ Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Sync camera stream → video element
  useEffect(() => {
    if (cameraStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach(t => t.stop());
      peerConnectionRef.current?.close();
    };
  }, [cameraStream]);

  // ── Helpers ─────────────────────────────────────────────────────────────────────
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Minimum 1 minute from now
    return now.toISOString().slice(0, 16);
  };

  const validateScheduledTime = (dateString: string): boolean => {
    const selectedDate = new Date(dateString);
    const now = new Date();
    return selectedDate > now;
  };

  // ── Form handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate scheduled time
    if (name === 'scheduledStartTime') {
      if (value && !validateScheduledTime(value)) {
        setDateError('Scheduled start time must be in the future');
      } else {
        setDateError('');
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAcademicChange = (field: keyof AcademicData, value: string) => {
    setAcademicData(prev => {
      if (field === 'year') return { year: value, semester: '', module_name: '' };
      if (field === 'semester') return { ...prev, semester: value, module_name: '' };
      return { ...prev, [field]: value };
    });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Stream creation ──────────────────────────────────────────────────────────
  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCreateError('');

    // Validate scheduled time before submission
    if (!validateScheduledTime(formData.scheduledStartTime)) {
      setCreateError('Scheduled start time must be in the future');
      setLoading(false);
      return;
    }

    try {
      let thumbnailBase64: string | null = null;
      let thumbnailMime: string | null = null;
      if (thumbnailFile) {
        thumbnailBase64 = await toBase64(thumbnailFile);
        thumbnailMime = thumbnailFile.type;
      }

      const res = await fetch('/api/live/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: `${academicData.year} – ${academicData.semester} – ${academicData.module_name}\n\n${formData.description}`,
          scheduledStartTime: new Date(formData.scheduledStartTime).toISOString(),
          thumbnailBase64,
          thumbnailMime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create stream');

      const info: StreamInfo = {
        videoId: data.videoId,
        streamKey: data.streamKey,
        streamUrl: data.streamUrl,
        thumbnailUrl: data.thumbnailUrl ?? thumbnailPreview,
      };
      setStreamInfo(info);

      // Save stream to DB
      const dbRes = await fetch('/api/live/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          year: academicData.year,
          semester: academicData.semester,
          module_name: academicData.module_name,
          video_id: data.videoId,
          stream_key: data.streamKey,
          stream_url: data.streamUrl,
          thumbnail_url: info.thumbnailUrl,
          scheduled_start_time: new Date(formData.scheduledStartTime).toISOString(),
        }),
      });
      
      if (!dbRes.ok) {
        console.error('Failed to save stream to DB');
      }

      setPhase('streaming');
      const generatedPostContent = `🎓 Watch my live class: "${formData.title}"\n\n${formData.description}\n\n📚 ${academicData.module_name} | Year ${academicData.year} · Sem ${academicData.semester}`;
      setPostContent(generatedPostContent);
      console.log('📝 Post content set:', generatedPostContent);
      console.log('🎥 Stream info:', info);
      console.log('👤 Current user:', currentUser);
      setShowPostModal(true);
      console.log('✅ Post modal should now be visible');
    } catch (err: any) {
      console.error('❌ Stream creation error:', err);
      setCreateError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Camera controls ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    setStreamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: true,
      });
      setCameraStream(stream);
    } catch (err: any) {
      setStreamError('Camera access denied: ' + err.message);
    }
  };

  const toggleMute = () => {
    if (!cameraStream) return;
    cameraStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(m => !m);
  };

  const toggleCam = () => {
    if (!cameraStream) return;
    cameraStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsCamOff(c => !c);
  };

  // ── WHIP – Go Live ───────────────────────────────────────────────────────────
  const goLive = async () => {
    if (!cameraStream) return;
    setConnStatus('connecting');
    setStreamError('');

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    peerConnectionRef.current = pc;

    cameraStream.getTracks().forEach(track => pc.addTrack(track, cameraStream));

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') setConnStatus('live');
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setConnStatus('offline');
        setStreamError('WebRTC connection lost.');
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await new Promise<void>(resolve => {
        if (pc.iceGatheringState === 'complete') return resolve();
        const check = () => {
          if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', check); resolve(); }
        };
        pc.addEventListener('icegatheringstatechange', check);
        setTimeout(resolve, 6000);
      });

      const whipUrl = `https://whip.youtube.com/whip/${streamInfo.streamKey}`;
      const response = await fetch(whipUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription!.sdp,
      });

      if (!response.ok) throw new Error(`WHIP ${response.status}: ${await response.text()}`);

      await pc.setRemoteDescription({ type: 'answer', sdp: await response.text() });
      setConnStatus('live');
    } catch (err: any) {
      pc.close();
      setConnStatus('offline');
      setStreamError('Failed to go live: ' + err.message);
    }
  };

  // ── End stream ───────────────────────────────────────────────────────────────
  const endStream = async () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setConnStatus('offline');
    try {
      await fetch('/api/live/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: streamInfo.videoId }),
      });
    } catch {}
  };

  // ── Check live (external tab) ────────────────────────────────────────────────
  const checkIfLive = async () => {
    if (!streamInfo.videoId) return;
    setConnStatus('connecting');
    setStreamError('');
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${streamInfo.videoId}&key=AIzaSyDB9WvHrAVJdWL6lFMJejW2gBP9SoMzsTk`
      );
      const data = await res.json();
      const liveStatus = data.items?.[0]?.snippet?.liveBroadcastContent;
      if (liveStatus === 'live') {
        setConnStatus('live');
      } else {
        setConnStatus('offline');
        setStreamError('Not live yet. Start OBS then check again.');
      }
    } catch {
      setConnStatus('offline');
    }
  };

  // ── Share post ────────────────────────────────────────────────────────────────
  const handleSharePost = async () => {
    if (!postContent.trim()) return;
    setPostLoading(true);
    try {
      const postData = {
        author_name: currentUser?.name || 'Student',
        author_avatar: currentUser?.avatar || 'S',
        author_role: 'Student',
        content: postContent,
        category: postCategory,
        stream_video_id: streamInfo.videoId,
        stream_title: formData.title,
      };
      
      console.log('📤 Sharing post with data:', postData);
      
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      
      let responseData;
      const contentType = res.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        console.error('❌ Received non-JSON response:', text);
        responseData = { error: 'Invalid response from server' };
      }
      
      if (!res.ok) {
        console.error('❌ Post share failed:', responseData);
        alert(`Failed to share post: ${responseData.error || 'Unknown error'}`);
        return;
      }
      
      console.log('✅ Post shared successfully:', responseData);
      setShowPostModal(false);
      setPostContent('');
      alert('✅ Post shared to feed successfully!');
    } catch (err: any) {
      console.error('❌ Post share error:', err);
      alert(`Error sharing post: ${err.message}`);
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-1.5 rounded-full">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {phase === 'form' ? 'Create New Live Class' : formData.title}
              </h1>
              {phase === 'streaming' && (
                <p className="text-sm text-muted-foreground">
                  {academicData.module_name} · Year {academicData.year} · Sem {academicData.semester}
                </p>
              )}
            </div>
          </div>
          {phase === 'streaming' && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${
              connStatus === 'live'       ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : connStatus === 'connecting' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
              : 'bg-muted border-border text-muted-foreground'}`}>
              {connStatus === 'live'
                ? <><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> LIVE</>
                : connStatus === 'connecting'
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Connecting…</>
                : <><WifiOff className="w-3 h-3" /> Offline</>}
            </div>
          )}
        </div>

        {/* ═══════════════ PHASE 1 — FORM ═══════════════ */}
        {phase === 'form' && (
          <form onSubmit={handleCreateStream}>
            <div className="grid grid-cols-12 gap-6">

              {/* Left column */}
              <div className="col-span-12 lg:col-span-8 space-y-6">

                {/* Thumbnail Upload */}
                <div
                  className="relative bg-black rounded-xl overflow-hidden border-2 border-dashed border-border cursor-pointer group"
                  style={{ aspectRatio: '16/9' }}
                  onClick={() => !thumbnailPreview && fileInputRef.current?.click()}
                >
                  {thumbnailPreview ? (
                    <>
                      <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm backdrop-blur-sm">
                          Change
                        </button>
                        <button type="button" onClick={e => { e.stopPropagation(); removeThumbnail(); }}
                          className="px-4 py-2 bg-red-500/70 hover:bg-red-500 text-white rounded-lg text-sm backdrop-blur-sm">
                          Remove
                        </button>
                      </div>
                      <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">Thumbnail</span>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <ImagePlus className="w-10 h-10 opacity-40" />
                      <p className="text-sm font-medium">Click to upload thumbnail</p>
                      <p className="text-xs opacity-50">JPG / PNG · 16:9 recommended</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                </div>

                {/* Form fields */}
                <div className="bg-card p-6 rounded-xl border border-border space-y-5">
                  <div className="flex items-center gap-2 pb-4 border-b border-border">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <h2 className="font-semibold text-foreground">Stream Details</h2>
                  </div>

                  <AcademicSelector values={academicData} onChange={handleAcademicChange} showErrors={false} variant="default" />

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title" type="text" required maxLength={100}
                      placeholder="e.g., Advanced Database Design – Week 5"
                      className="w-full bg-background border border-input rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.title} onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">{formData.title.length}/100</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Description</label>
                    <textarea
                      name="description" rows={4} maxLength={5000}
                      placeholder="What will you cover? Share topics, prerequisites, resources…"
                      className="w-full bg-background border border-input rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      value={formData.description} onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">{formData.description.length}/5000</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                      Scheduled Start <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="scheduledStartTime" type="datetime-local" required
                      min={getMinDateTime()}
                      className={`w-full bg-background border rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-2 ${
                        dateError ? 'border-red-500 focus:ring-red-500' : 'border-input focus:ring-primary'
                      }`}
                      value={formData.scheduledStartTime} onChange={handleChange}
                    />
                    {dateError && <p className="text-xs text-red-500 mt-2">{dateError}</p>}
                  </div>
                </div>

                {createError && (
                  <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {createError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !formData.title.trim() || !academicData.year || !!dateError}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl transition"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                  {loading ? 'Creating on YouTube…' : 'Create Live Stream'}
                </button>
              </div>

              {/* Right column — info */}
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-card border border-border rounded-xl p-6 sticky top-6 space-y-5">
                  <h3 className="font-semibold text-foreground">What happens next?</h3>
                  {[
                    { icon: UploadCloud, label: 'Stream created on YouTube', sub: 'Unlisted – only visible via UniHub' },
                    { icon: Radio,       label: 'Stream key generated',      sub: 'OBS or browser streaming' },
                    { icon: Video,       label: 'Camera preview',            sub: 'Preview before going live' },
                    { icon: Send,        label: 'Share in feed',             sub: 'Post appears on the home feed' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
                    <strong>Note:</strong> YouTube channel must have live streaming enabled (can take up to 24h for new channels).
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ═══════════════ PHASE 2 — STREAMING DASHBOARD ═══════════════ */}
        {phase === 'streaming' && (
          <div className="grid grid-cols-12 gap-6">

            {/* Left column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
                {(['browser', 'external'] as StreamTab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                    {tab === 'browser' ? '🎥 Browser Stream' : '📡 External Software'}
                  </button>
                ))}
              </div>

              {/* BROWSER STREAMING */}
              {activeTab === 'browser' && (
                <div className="space-y-4">
                  <div className="bg-black rounded-xl overflow-hidden border border-border" style={{ aspectRatio: '16/9' }}>
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
                      {connStatus === 'connecting' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-white text-sm">
                            <Loader2 className="animate-spin w-4 h-4" /> Connecting to YouTube…
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {cameraStream && (
                    <div className="flex items-center justify-center gap-3">
                      <button type="button" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}
                        className={`p-3 rounded-full border transition ${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-card border-border text-foreground hover:bg-muted'}`}>
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      <button type="button" onClick={toggleCam} title={isCamOff ? 'Turn on camera' : 'Turn off camera'}
                        className={`p-3 rounded-full border transition ${isCamOff ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-card border-border text-foreground hover:bg-muted'}`}>
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
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-card border border-border hover:bg-muted text-foreground font-medium rounded-xl transition">
                        <Camera className="w-5 h-5" /> Start Camera Preview
                      </button>
                    ) : connStatus !== 'live' ? (
                      <button type="button" onClick={goLive} disabled={connStatus === 'connecting'}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition">
                        {connStatus === 'connecting' ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                        {connStatus === 'connecting' ? 'Connecting…' : 'Go Live on YouTube'}
                      </button>
                    ) : (
                      <button type="button" onClick={endStream}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl transition">
                        <Square className="w-5 h-5 fill-current" /> End Stream
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Browser streaming uses WebRTC (WHIP) — no software install needed.
                    For higher quality, use the{' '}
                    <button type="button" className="underline" onClick={() => setActiveTab('external')}>External Software</button> tab.
                  </p>
                </div>
              )}

              {/* EXTERNAL SOFTWARE */}
              {activeTab === 'external' && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4" /> Encoder Settings (OBS / Streamlabs)
                  </h3>
                  <p className="text-sm text-muted-foreground">Paste these into OBS → Settings → Stream → Custom.</p>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Stream Server URL</label>
                    <div className="flex bg-background rounded-lg border border-input overflow-hidden">
                      <input readOnly value={streamInfo.streamUrl}
                        className="flex-1 bg-transparent p-3 text-sm text-foreground font-mono outline-none" />
                      <button type="button" onClick={() => navigator.clipboard.writeText(streamInfo.streamUrl)}
                        className="px-4 hover:bg-accent text-muted-foreground transition border-l border-border" title="Copy">
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Stream Key</label>
                    <div className="flex bg-background rounded-lg border border-input overflow-hidden relative">
                      <input type={keyVisible ? 'text' : 'password'} readOnly value={streamInfo.streamKey}
                        className="flex-1 bg-transparent p-3 text-sm text-foreground font-mono outline-none pr-20" />
                      <button type="button" onClick={() => setKeyVisible(v => !v)}
                        className="absolute right-12 top-3 text-muted-foreground hover:text-foreground px-2">
                        {keyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button type="button" onClick={() => navigator.clipboard.writeText(streamInfo.streamKey)}
                        className="px-4 hover:bg-accent text-muted-foreground transition border-l border-border bg-background z-10" title="Copy">
                        <Copy size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-red-500">Keep this private – it grants direct access to your stream.</p>
                  </div>

                  <div className="bg-muted rounded-lg p-4 text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground mb-2">Recommended OBS Settings</p>
                    <p>Video: 1920×1080 @ 30 fps · Bitrate: 4500 kbps (H.264)</p>
                    <p>Audio: 160 kbps AAC · 44.1 kHz · Keyframe interval: 2s</p>
                  </div>

                  {streamError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {streamError}
                    </div>
                  )}

                  <button type="button" onClick={checkIfLive} disabled={connStatus === 'connecting'}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted text-foreground rounded-lg text-sm transition disabled:opacity-50">
                    {connStatus === 'connecting' ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                    Check if stream is live
                  </button>

                  {connStatus === 'live' && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm font-medium">
                      <Wifi className="w-4 h-4" /> Stream is live — students can watch now!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right column — stream info */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-6">
                {streamInfo.thumbnailUrl ? (
                  <img src={streamInfo.thumbnailUrl} alt={formData.title} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video bg-muted flex items-center justify-center">
                    <Radio className="w-8 h-8 text-muted-foreground opacity-30" />
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{formData.title}</h3>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{formData.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Status',  val: connStatus === 'live' ? '🔴 Live' : connStatus === 'connecting' ? '⏳ Connecting' : '⚫ Offline' },
                      { label: 'Privacy', val: 'Unlisted' },
                      { label: 'Video ID', val: streamInfo.videoId },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={`font-medium text-foreground font-mono text-xs ${label === 'Status' && connStatus === 'live' ? 'text-green-500' : ''}`}>{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-border">
                    <a href={`https://studio.youtube.com/video/${streamInfo.videoId}/livestreaming`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition">
                      <ExternalLink className="w-4 h-4" /> YouTube Studio
                    </a>
                    <a href={`https://youtube.com/watch?v=${streamInfo.videoId}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition">
                      <Play className="w-4 h-4" /> Watch Page
                    </a>
                    <button type="button" onClick={() => setShowPostModal(true)}
                      className="flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">
                      <Send className="w-4 h-4" /> Share in Feed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POST CREATION MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Share with the community</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Let students know about your live class</p>
              </div>
              <button type="button" onClick={() => setShowPostModal(false)} className="p-2 hover:bg-muted rounded-lg transition">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {streamInfo.thumbnailUrl && (
                <img src={streamInfo.thumbnailUrl} alt={formData.title} className="w-full rounded-lg aspect-video object-cover" />
              )}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Post Content</label>
                <textarea rows={5} value={postContent} onChange={e => setPostContent(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Tell students what this stream is about…"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Category</label>
                <select value={postCategory} onChange={e => setPostCategory(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="Live Stream">Live Stream</option>
                  <option value="Study Material">Study Material</option>
                  <option value="Event">Event</option>
                  <option value="Discussion">Discussion</option>
                </select>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button type="button" onClick={() => setShowPostModal(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted transition">
                Skip
              </button>
              <button type="button" onClick={handleSharePost} disabled={!postContent.trim() || postLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition">
                {postLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                {postLoading ? 'Sharing…' : 'Share Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
