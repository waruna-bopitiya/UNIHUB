'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Clock, Eye, Loader2, Play, Radio, Share2, Users, Edit2, Trash2, Pause, Rewind, FastForward, Maximize, Minimize } from 'lucide-react'

import { AppLayout } from '@/components/layout/app-layout'
import { ChatPanel } from '@/components/live/chat-panel'

interface LiveStream {
  id: number
  post_id: number | null
  creator_id?: string
  title: string
  description: string | null
  year: string | null
  semester: string | null
  module_name: string | null
  video_id: string
  stream_key: string
  stream_url: string
  thumbnail_url: string | null
  status: string
  scheduled_start_time: string | null
  created_at: string
}

interface ChatMessage {
  id: string
  author: string
  message: string
  timestamp: string
}

function formatScheduledTime(value: string | null) {
  if (!value) return 'Time TBD'

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function MainStreamPlayer({ stream }: { stream: LiveStream | null }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Reset state when a new stream is selected
  useEffect(() => {
    if (!stream) return
    setIsPlaying(false)
    setIsPlayerReady(false)
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }
  }, [stream?.id])

  // Initialize YouTube Iframe API when playing starts
  useEffect(() => {
    const showPlayer = isPlaying

    if (!showPlayer || !stream) return

    const initPlayer = () => {
      if (!containerRef.current) return
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId: stream.video_id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          disablekb: 1,
        },
        events: {
          onReady: () => {
            setIsPlayerReady(true)
          },
        },
      })
    }

    if (!(window as any).YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)

      ;(window as any).onYouTubeIframeAPIReady = initPlayer
    } else {
      initPlayer()
    }

    return () => {}
  }, [isPlaying, stream])

  // Full Screen Event Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handlePlay = () => playerRef.current?.playVideo()
  const handlePause = () => playerRef.current?.pauseVideo()
  
  const handleBackward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime()
      playerRef.current.seekTo(currentTime - 10, true)
    }
  }
  
  const handleForward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime()
      playerRef.current.seekTo(currentTime + 10, true)
    }
  }

  // Full Screen Toggle Function
  const toggleFullScreen = async () => {
    if (!wrapperRef.current) return

    if (!document.fullscreenElement) {
      try {
        await wrapperRef.current.requestFullscreen()
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err)
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    }
  }

  if (!stream) {
    return (
      <div className="w-full rounded-xl border border-border bg-card p-8 min-h-[320px] flex items-center justify-center text-center">
        <div>
          <Radio className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No live session yet</h3>
          <p className="text-muted-foreground mt-2">Create a live stream to make it appear here.</p>
        </div>
      </div>
    )
  }

  const isLive = stream.status === 'live'
  const isScheduled = stream.status !== 'live' && new Date(stream.scheduled_start_time || '') > new Date()
  const isCompleted = stream.status !== 'live' && !isScheduled
  
  const thumbnailUrl = stream.thumbnail_url ?? `https://img.youtube.com/vi/${stream.video_id}/maxresdefault.jpg`
  const showPlayer = isPlaying && !isScheduled

  return (
    <div 
      ref={wrapperRef}
      // මෙතන group/player වෙනුවට සාමාන්‍ය 'group' එක දැම්මා 
      className={`w-full overflow-hidden bg-black relative group ${!isFullscreen ? 'rounded-xl border border-border' : ''}`} 
      style={{ aspectRatio: isFullscreen ? 'auto' : '16/9', height: isFullscreen ? '100%' : 'auto' }}
    >
      {!showPlayer ? (
        <div
          className={`w-full h-full relative group ${!isScheduled ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => {
            if (!isScheduled) {
              setIsPlaying(true)
            }
          }}
        >
          <img src={thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
            <div className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transform group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 fill-white" /> 
              {isLive ? 'Watch Live' : isCompleted ? 'Watch Replay' : 'Coming Soon'}
            </div>
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            <Radio className="w-3 h-3" /> 
            {isLive ? 'LIVE NOW' : isCompleted ? 'PREVIOUS' : 'SCHEDULED'}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden bg-black">
          <div className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 scale-[0.35] pointer-events-none">
            <div ref={containerRef} className="w-full h-full"></div>
          </div>

          {isPlayerReady && (
            // මෙතන group-hover:opacity-100 සහ z-[100] හැදුවා
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/70 backdrop-blur-md px-8 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-[100] border border-white/10 shadow-2xl">
              <button onClick={handleBackward} className="text-white hover:text-red-500 transition-transform hover:scale-110 p-2" title="Backward 10s">
                <Rewind className="w-5 h-5" />
              </button>
              <button onClick={handlePlay} className="text-white hover:text-red-500 transition-transform hover:scale-110 p-2" title="Play">
                <Play className="w-6 h-6 fill-current" />
              </button>
              <button onClick={handlePause} className="text-white hover:text-red-500 transition-transform hover:scale-110 p-2" title="Pause">
                <Pause className="w-6 h-6 fill-current" />
              </button>
              <button onClick={handleForward} className="text-white hover:text-red-500 transition-transform hover:scale-110 p-2" title="Forward 10s">
                <FastForward className="w-5 h-5" />
              </button>
              
              <div className="w-[1px] h-6 bg-white/20 mx-2"></div> 
              
              <button onClick={toggleFullScreen} className="text-white hover:text-red-500 transition-transform hover:scale-110 p-2" title="Full Screen">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LiveStreamCard({
  stream,
  onSelect,
}: {
  stream: LiveStream
  onSelect: (stream: LiveStream) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const canPlay = stream.status === 'live'
  const thumbnailUrl = stream.thumbnail_url ?? `https://img.youtube.com/vi/${stream.video_id}/mqdefault.jpg`

  return (
    <button
      type="button"
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all group text-left"
      onClick={() => onSelect(stream)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
        {!isHovered || !canPlay ? (
          <>
            <img src={thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1">
              <Radio className="w-3 h-3" /> {canPlay ? 'Live' : 'Scheduled'}
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              {canPlay ? <Eye className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {canPlay ? 'Live now' : formatScheduledTime(stream.scheduled_start_time)}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 overflow-hidden bg-black pointer-events-none">
            <iframe
              className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 scale-[0.35]"
              src={`https://www.youtube.com/embed/${stream.video_id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1`}
              title={stream.title}
              frameBorder="0"
              allow="autoplay"
            ></iframe>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-foreground line-clamp-1">{stream.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{stream.module_name ?? 'Live session'}</p>
      </div>
    </button>
  )
}

export default function LivePage() {
  const router = useRouter()
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [loadingStreams, setLoadingStreams] = useState(true)
  const [pageError, setPageError] = useState('')
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  useEffect(() => {
    let active = true

    async function loadStreams() {
      setLoadingStreams(true)
      setPageError('')

      try {
        const response = await fetch('/api/live/streams', { cache: 'no-store' })
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Failed to load live streams' }))
          throw new Error(error.error ?? 'Failed to load live streams')
        }

        const data = await response.json()

        if (active) {
          setStreams(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (active) {
          console.error('Error loading streams:', error)
          setPageError(error instanceof Error ? error.message : 'Failed to load live streams')
        }
      } finally {
        if (active) {
          setLoadingStreams(false)
        }
      }
    }

    // Get current user ID
    const userId = localStorage.getItem('studentId')
    setCurrentUserId(userId)

    loadStreams()

    return () => {
      active = false
    }
  }, [])

  const liveStreams = useMemo(
    () => streams.filter((stream) => stream.status === 'live'),
    [streams]
  )

  const upcomingStreams = useMemo(
    () => {
      const now = new Date().getTime()
      return streams
        .filter((stream) => {
          if (stream.status === 'live') return false
          if (!stream.scheduled_start_time) return false
          const scheduledTime = new Date(stream.scheduled_start_time).getTime()
          return scheduledTime > now
        })
        .sort((a, b) => {
          const aTime = a.scheduled_start_time ? new Date(a.scheduled_start_time).getTime() : Number.MAX_SAFE_INTEGER
          const bTime = b.scheduled_start_time ? new Date(b.scheduled_start_time).getTime() : Number.MAX_SAFE_INTEGER
          return aTime - bTime
        })
    },
    [streams]
  )

  const previousStreams = useMemo(
    () => {
      const now = new Date().getTime()
      return streams
        .filter((stream) => {
          if (stream.status === 'live') return false
          if (!stream.scheduled_start_time) return false
          const scheduledTime = new Date(stream.scheduled_start_time).getTime()
          return scheduledTime <= now
        })
        .sort((a, b) => {
          const aTime = a.scheduled_start_time ? new Date(a.scheduled_start_time).getTime() : 0
          const bTime = b.scheduled_start_time ? new Date(b.scheduled_start_time).getTime() : 0
          return bTime - aTime
        })
    },
    [streams]
  )

  const featuredStream = useMemo(() => {
    const selectedStream =
      selectedStreamId !== null
        ? streams.find((stream) => stream.id === selectedStreamId) ?? null
        : null

    if (selectedStream) {
      return selectedStream
    }

    return liveStreams[0] ?? upcomingStreams[0] ?? null
  }, [liveStreams, selectedStreamId, streams, upcomingStreams])

  const otherLiveStreams = useMemo(
    () => liveStreams.filter((stream) => stream.id !== featuredStream?.id),
    [featuredStream?.id, liveStreams]
  )

  useEffect(() => {
    let active = true

    async function loadMessages() {
      if (!featuredStream?.id) {
        setChatMessages([])
        return
      }

      try {
        const response = await fetch(`/api/live/messages?streamId=${featuredStream.id}&limit=50`, {
          cache: 'no-store',
        })
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Failed to load live chat' }))
          throw new Error(error.error ?? 'Failed to load live chat')
        }

        const data = await response.json()

        if (active) {
          setChatMessages(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (active) {
          console.error('Error loading messages:', error)
          setPageError(error instanceof Error ? error.message : 'Failed to load live chat')
          setChatMessages([])
        }
      }
    }

    loadMessages()

    return () => {
      active = false
    }
  }, [featuredStream?.id])

  const handleDeleteStream = async (streamId: number) => {
    if (!currentUserId) {
      setPageError('You must be logged in to delete streams')
      return
    }

    if (!confirm('Are you sure you want to delete this stream?')) {
      return
    }

    setDeleteLoading(streamId)
    try {
      const res = await fetch(`/api/live/streams/${streamId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: currentUserId }),
      })

      if (res.ok) {
        setStreams(streams.filter(s => s.id !== streamId))
        console.log(`🗑️ Stream ${streamId} deleted`)
        if (selectedStreamId === streamId) {
          setSelectedStreamId(null)
        }
      } else {
        const data = await res.json()
        setPageError(data.error || 'Failed to delete stream')
      }
    } catch (error) {
      console.error('Error deleting stream:', error)
      setPageError('Failed to delete stream')
    } finally {
      setDeleteLoading(null)
    }
  }

  const userStreams = useMemo(
    () => streams.filter(stream => stream.creator_id === currentUserId),
    [streams, currentUserId]
  )

  const sessionList = upcomingStreams.length > 0 ? upcomingStreams : []
  const previousSessionList = previousStreams.length > 0 ? previousStreams : []

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-end mb-6">
          <button
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow hover:opacity-90 transition-opacity"
            onClick={() => router.push('/live/create')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Live Stream
          </button>
        </div>

        {pageError && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {pageError}
          </div>
        )}

        {/* My Live Streams Section */}
        {currentUserId && userStreams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">My Live Streams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userStreams.map((stream) => (
                <div key={stream.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{stream.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stream.module_name ?? 'Live stream'}
                      </p>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      stream.status === 'live' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {stream.status === 'live' ? 'LIVE' : 'SCHEDULED'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <button
                      onClick={() => router.push(`/live/edit/${stream.id}`)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-80 transition-opacity text-sm font-medium"
                      title="Edit stream"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStream(stream.id)}
                      disabled={deleteLoading === stream.id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors text-sm font-medium disabled:opacity-50"
                      title="Delete stream"
                    >
                      {deleteLoading === stream.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 flex flex-col">
            <MainStreamPlayer stream={featuredStream} />

            {featuredStream && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{featuredStream.title}</h3>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <p className="text-muted-foreground font-medium">
                      {featuredStream.module_name ?? 'Live session'}
                    </p>
                    <span className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                      <Eye className="w-4 h-4" />
                      {featuredStream.status === 'live'
                        ? 'Live now'
                        : formatScheduledTime(featuredStream.scheduled_start_time)}
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            )}
          </div>

          <div className="h-[500px] lg:h-auto border border-border rounded-xl overflow-hidden">
            {featuredStream ? (
              <ChatPanel messages={chatMessages} streamId={featuredStream.id} />
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-muted-foreground">
                {loadingStreams ? 'Loading live chat...' : 'No active stream selected'}
              </div>
            )}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500" /> More Live Streams
          </h2>
          {loadingStreams ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading streams...
            </div>
          ) : otherLiveStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {otherLiveStreams.map((stream) => (
                <LiveStreamCard
                  key={stream.id}
                  stream={stream}
                  onSelect={(selectedStream) => setSelectedStreamId(selectedStream.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
              No additional live streams are active right now.
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Live Sessions</h2>
          {sessionList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sessionList.map((session) => (
                <div
                  key={session.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">{session.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.module_name ?? 'Upcoming session'}
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                      Upcoming
                    </span>
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatScheduledTime(session.scheduled_start_time)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      Ready to join when it starts
                    </div>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
                    Set Reminder
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
              No upcoming live sessions have been scheduled yet.
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Previous Live Sessions</h2>
          {previousSessionList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previousSessionList.map((session) => (
                <div
                  key={session.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow opacity-75"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">{session.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.module_name ?? 'Previous session'}
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Previous
                    </span>
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatScheduledTime(session.scheduled_start_time)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      Session completed
                    </div>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
                    Watch Replay
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
              No previous live sessions.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}