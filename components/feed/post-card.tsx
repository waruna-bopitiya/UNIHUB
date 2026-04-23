'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, MessageCircle, Share2, MoreVertical, Play, Radio, Maximize, Minimize, Check, Pause, Rewind, FastForward, Clock } from 'lucide-react'
import { Comments } from './comments'
import { useToast } from '@/hooks/use-toast'

interface PostCardProps {
  id: string
  author: {
    name: string
    avatar: string
    role: string
  }
  timestamp: string
  content: string
  category?: string
  likes: number
  comments: number
  shares: number
  streamVideoId?: string
  streamTitle?: string
  userId?: string
  userLiked?: boolean
}

export function PostCard({
  id,
  author,
  timestamp,
  content,
  category,
  likes: initialLikes,
  comments: initialComments,
  shares,
  streamVideoId,
  streamTitle,
  userId,
  userLiked: initialUserLiked = false,
}: PostCardProps) {
  const normalizedInitialLikes = Math.max(0, Number(initialLikes) || 0)
  const normalizedInitialComments = Math.max(0, Number(initialComments) || 0)
  const normalizedInitialLiked = Boolean(initialUserLiked)

  const [liked, setLiked] = useState(normalizedInitialLiked)
  const [likeCount, setLikeCount] = useState(normalizedInitialLikes)
  const [commentCount, setCommentCount] = useState(normalizedInitialComments)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [shareClicked, setShareClicked] = useState(false)
  const { toast } = useToast()

  const videoContainerRef = useRef<HTMLDivElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const lastRightClickNoticeAtRef = useRef(0)

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

    const totalSeconds = Math.floor(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const remainingSeconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!streamVideoId || !isPlaying) return

    const initPlayer = () => {
      if (!playerContainerRef.current) return

      playerRef.current = new (window as any).YT.Player(playerContainerRef.current, {
        videoId: streamVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          disablekb: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true)
            setDuration(event.target.getDuration?.() || 0)
            setCurrentTime(event.target.getCurrentTime?.() || 0)
            event.target.playVideo?.()
          },
          onStateChange: (event: any) => {
            const playerState = (window as any).YT?.PlayerState

            if (event.data === playerState?.PLAYING) {
              setIsVideoPlaying(true)
            }

            if (event.data === playerState?.PAUSED || event.data === playerState?.ENDED) {
              setIsVideoPlaying(false)
            }
          },
        },
      })
    }

    if (!(window as any).YT?.Player) {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')

      if (!existingScript) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)
      }

      const previousReady = (window as any).onYouTubeIframeAPIReady
      ;(window as any).onYouTubeIframeAPIReady = () => {
        previousReady?.()
        initPlayer()
      }
    } else {
      initPlayer()
    }

    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      setIsPlayerReady(false)
      setIsVideoPlaying(false)
    }
  }, [isPlaying, streamVideoId])

  useEffect(() => {
    if (!isPlaying || !isPlayerReady) return

    const syncPlaybackTime = () => {
      if (!playerRef.current?.getCurrentTime) return

      setCurrentTime(playerRef.current.getCurrentTime() || 0)

      if (playerRef.current.getDuration) {
        setDuration(playerRef.current.getDuration() || 0)
      }
    }

    syncPlaybackTime()
    const intervalId = window.setInterval(syncPlaybackTime, 1000)

    return () => window.clearInterval(intervalId)
  }, [isPlaying, isPlayerReady])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleLike = async () => {
    if (!userId) {
      alert('Please log in to like posts')
      return
    }

    const action = liked ? 'unlike' : 'like'
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1)

    setLiked(newLiked)
    setLikeCount(newCount)

    console.log(`👆 Like clicked: action=${action}, userId=${userId}, postId=${id}`)

    try {
      const res = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId }),
      })

      if (res.ok) {
        const data = await res.json()
        console.log(`✅ Like response:`, data)
        setLikeCount(Math.max(0, Number(data.likes_count) || 0))
        setLiked(Boolean(data.user_liked))
      } else {
        console.error('❌ Like failed:', res.status)
        setLiked(liked)
        setLikeCount(likeCount)
      }
    } catch (error) {
      console.error('❌ Like error:', error)
      setLiked(liked)
      setLikeCount(likeCount)
    }
  }

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1)
    console.log(`💬 Comment added, new count: ${commentCount + 1}`)
  }

  const handleShare = async () => {
    const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/community?post=${id}`

    try {
      await navigator.clipboard.writeText(shareLink)
      console.log(`✅ Link copied to clipboard: ${shareLink}`)

      setShareClicked(true)
      toast({
        title: '✅ Link copied!',
        description: shareLink,
        duration: 3000,
      })

      setTimeout(() => setShareClicked(false), 2000)
    } catch (error) {
      console.error('❌ Failed to copy link:', error)
      toast({
        title: '❌ Failed to copy',
        description: 'Could not copy link to clipboard',
        duration: 3000,
      })
    }
  }

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      if (videoContainerRef.current?.requestFullscreen) {
        await videoContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    }
  }

  const handlePlay = () => {
    playerRef.current?.playVideo?.()
    setIsVideoPlaying(true)
  }

  const handlePause = () => {
    playerRef.current?.pauseVideo?.()
    setIsVideoPlaying(false)
  }

  const handleBackward = () => {
    if (!playerRef.current?.seekTo || !playerRef.current?.getCurrentTime) return

    const currentPlaybackTime = playerRef.current.getCurrentTime()
    playerRef.current.seekTo(Math.max(0, currentPlaybackTime - 10), true)
  }

  const handleForward = () => {
    if (!playerRef.current?.seekTo || !playerRef.current?.getCurrentTime) return

    const currentPlaybackTime = playerRef.current.getCurrentTime()
    playerRef.current.seekTo(duration > 0 ? Math.min(duration, currentPlaybackTime + 10) : currentPlaybackTime + 10, true)
  }

  const handlePostCardContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()

    const now = Date.now()
    if (now - lastRightClickNoticeAtRef.current > 1500) {
      toast({
        title: 'Right-click prevented',
        description: 'Context menu is disabled on this card.',
        duration: 2000,
      })
      lastRightClickNoticeAtRef.current = now
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-4" onContextMenu={handlePostCardContextMenu}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-card-foreground font-bold">
            {author.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{author.name}</h3>
            <p className="text-sm text-muted-foreground">{author.role}</p>
            <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {category && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {category}
          </span>
        </div>
      )}

      {streamVideoId && (
        <div
          ref={videoContainerRef}
          className="mb-4 rounded-xl overflow-hidden border border-border bg-card relative group/video"
          style={{ aspectRatio: '16/9' }}
        >
          {!isPlaying ? (
            <div
              className="w-full h-full relative group cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={`https://img.youtube.com/vi/${streamVideoId}/maxresdefault.jpg`}
                alt={streamTitle ?? 'Live stream'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-card/40 group-hover:bg-card/30 transition-colors">
                <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transform group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-white" /> Watch Video
                </div>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive/90 text-destructive-foreground text-xs px-2.5 py-1 rounded-full font-bold">
                <Radio className="w-3 h-3" /> LIVE
              </div>
            </div>
          ) : (
            // ඔයාගේ අදහසට අනුව සකසන ලද ක්‍රමය
            <div className="absolute inset-0 overflow-hidden bg-card">
              
              {/* Crop Effect Wrapper: උඩින් සහ යටින් වීඩියෝව crop කිරීමට */}
              <div className="absolute top-[5%] bottom-[5%] left-0 right-0 overflow-hidden">
                <div
                  ref={playerContainerRef}
                  className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 scale-[0.35] pointer-events-auto"
                ></div>
              </div>

              {/* MASKING LAYERS (යූටියුබ් පාලකයන් වසා දැමීමට) */}
              <div className="absolute top-0 left-0 right-0 h-[10%] bg-card z-10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-card z-10"></div>

              <div className="absolute inset-0 z-20 bg-transparent pointer-events-auto"></div>

              <div className="absolute inset-x-4 bottom-4 z-30 flex items-end justify-between gap-3 opacity-0 transition-opacity duration-200 group-hover/video:opacity-100">
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-2 text-xs text-foreground backdrop-blur-md shadow-lg">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-muted-foreground">/</span>
                  <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/70 p-1.5 backdrop-blur-md shadow-lg">
                  <button
                    onClick={handleBackward}
                    className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary hover:text-primary"
                    title="Backward 10s"
                    type="button"
                  >
                    <Rewind className="w-4 h-4" />
                  </button>
                  <button
                    onClick={isVideoPlaying ? handlePause : handlePlay}
                    className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary hover:text-primary"
                    title={isVideoPlaying ? 'Pause' : 'Play'}
                    type="button"
                  >
                    {isVideoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button
                    onClick={handleForward}
                    className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary hover:text-primary"
                    title="Forward 10s"
                    type="button"
                  >
                    <FastForward className="w-4 h-4" />
                  </button>
                  <div className="mx-1 h-6 w-px bg-border/70" />
                  <button
                    onClick={toggleFullScreen}
                    className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary hover:text-primary"
                    title="Full Screen"
                    type="button"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-foreground mb-4 leading-relaxed whitespace-pre-line">{content}</p>

      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
        <span>{likeCount} likes</span>
        <span>{commentCount} comments · {shares} shares</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            liked
              ? 'text-destructive bg-destructive/10'
              : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span>Like</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>
        <button
          onClick={handleShare}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            shareClicked
              ? 'text-green-500 bg-green-500/20'
              : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          {shareClicked ? (
            <Check className="w-5 h-5" />
          ) : (
            <Share2 className="w-5 h-5" />
          )}
          <span>{shareClicked ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {showComments && <Comments postId={id} currentUserId={userId} onCommentAdded={handleCommentAdded} />}
    </div>
  )
}
