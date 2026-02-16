'use client'

import { Play, Pause, Volume2, VolumeX, Maximize2, Settings } from 'lucide-react'
import { useState } from 'react'

interface StreamPlayerProps {
  title: string
  tutorName: string
  liveViewers: number
  duration?: string
}

export function StreamPlayer({
  title,
  tutorName,
  liveViewers,
  duration,
}: StreamPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Video Player */}
      <div className="relative bg-black aspect-video flex items-center justify-center group">
        {/* Live Indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-destructive/90 text-white px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span className="text-sm font-semibold">LIVE</span>
        </div>

        {/* Viewers Count */}
        <div className="absolute top-4 right-4 z-10 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm">
          {liveViewers.toLocaleString()} watching
        </div>

        {/* Tutor Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-gray-300 text-sm mt-2">with {tutorName}</p>
        </div>

        {/* Play/Pause Overlay */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/80 hover:bg-primary text-white rounded-full p-4"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-2">
          {/* Progress Bar */}
          <div className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer hover:h-1.5 transition-all">
            <div className="h-full w-1/3 bg-primary rounded-full"></div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/20 rounded transition-colors">
              <Volume2 className="w-4 h-4 text-white" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors">
              <Settings className="w-4 h-4 text-white" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors">
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
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
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold text-foreground">{duration || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
