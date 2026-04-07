'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Clock, Eye, Loader2, Play, Radio, Share2, Users } from 'lucide-react'

import { AppLayout } from '@/components/layout/app-layout'
import { ChatPanel } from '@/components/live/chat-panel'

interface LiveStream {
  id: number
  post_id: number | null
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
  const thumbnailUrl = stream.thumbnail_url ?? `https://img.youtube.com/vi/${stream.video_id}/maxresdefault.jpg`
  const showPlayer = isLive && isPlaying

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border bg-black relative" style={{ aspectRatio: '16/9' }}>
      {!showPlayer ? (
        <div
          className={`w-full h-full relative group ${isLive ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => {
            if (isLive) {
              setIsPlaying(true)
            }
          }}
        >
          <img src={thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
            <div className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transform group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 fill-white" /> {isLive ? 'Watch Live' : 'Coming Soon'}
            </div>
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            <Radio className="w-3 h-3" /> {isLive ? 'LIVE NOW' : 'SCHEDULED'}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden bg-black">
          <iframe
            className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 scale-[0.35] pointer-events-auto"
            src={`https://www.youtube.com/embed/${stream.video_id}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1`}
            title={stream.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
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

  useEffect(() => {
    let active = true

    async function loadStreams() {
      setLoadingStreams(true)
      setPageError('')

      try {
        const response = await fetch('/api/live/streams', { cache: 'no-store' })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to load live streams')
        }

        if (active) {
          setStreams(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (active) {
          setPageError(error instanceof Error ? error.message : 'Failed to load live streams')
        }
      } finally {
        if (active) {
          setLoadingStreams(false)
        }
      }
    }

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
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to load live chat')
        }

        if (active) {
          setChatMessages(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (active) {
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