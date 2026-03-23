'use client'

import { Maximize2, Users } from 'lucide-react'

interface StreamPlayerProps {
  title: string
  tutorName: string
  liveViewers: number
  duration?: string
  /** YouTube video ID – when provided the component embeds the YouTube live player */
  videoId?: string
}

export function StreamPlayer({
  title,
  tutorName,
  liveViewers,
  duration,
  videoId,
}: StreamPlayerProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Video Player */}
      <div className="relative bg-black aspect-video flex items-center justify-center">
        {/* Live Indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-destructive/90 text-white px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span className="text-sm font-semibold">LIVE</span>
        </div>

        {/* Viewers Count */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm">
          <Users className="w-3.5 h-3.5" />
          {liveViewers.toLocaleString()} watching
        </div>

        {videoId ? (
          /* ── Real YouTube live stream embed ── */
          <>
            <iframe
              className="w-full h-full absolute inset-0"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            {/* Fullscreen shortcut */}
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 text-white rounded transition-colors"
              title="Open on YouTube"
            >
              <Maximize2 className="w-4 h-4" />
            </a>
          </>
        ) : (
          /* ── Placeholder when no videoId yet ── */
          <>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-gray-300 text-sm mt-2">with {tutorName}</p>
            </div>
          </>
        )}
      </div>

      {/* Stream Info */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-2">Hosted by {tutorName}</p>
        <div className="mt-4 flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Live Viewers</p>
            <p className="text-2xl font-bold text-primary">
              {liveViewers.toLocaleString()}
            </p>
          </div>
          {duration && (
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold text-foreground">{duration}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
