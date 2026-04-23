'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, MoreVertical, Play, Radio, Maximize, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Comments } from './comments'
import { useToast } from '@/hooks/use-toast'

interface PostCardProps {
  id: string
  author: {
    name: string
    avatar: string
    role: string
    id?: string
    badges?: string[]
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
  // Ensure initial values are correct types
  const normalizedInitialLikes = Math.max(0, Number(initialLikes) || 0)
  const normalizedInitialComments = Math.max(0, Number(initialComments) || 0)
  const normalizedInitialLiked = Boolean(initialUserLiked)
  
  const [liked, setLiked] = useState(normalizedInitialLiked)
  const [likeCount, setLikeCount] = useState(normalizedInitialLikes)
  const [commentCount, setCommentCount] = useState(normalizedInitialComments)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [shareClicked, setShareClicked] = useState(false)
  const { toast } = useToast()

  // වීඩියෝ කන්ටේනරය සඳහා Reference එක (Full Screen කිරීම සඳහා)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  const handleLike = async () => {
    if (!userId) {
      alert('Please log in to like posts')
      return
    }

    const action = liked ? 'unlike' : 'like'
    
    // Optimistic update
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
        
        // Use server response as source of truth
        setLikeCount(Math.max(0, Number(data.likes_count) || 0))
        setLiked(Boolean(data.user_liked))
      } else {
        // Revert on error
        console.error('❌ Like failed:', res.status)
        setLiked(liked)
        setLikeCount(likeCount)
      }
    } catch (error) {
      // Revert on error
      console.error('❌ Like error:', error)
      setLiked(liked)
      setLikeCount(likeCount)
    }
  }

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1)
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
      
      // Reset button state after 2 seconds
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

  // Full Screen කිරීමේ Function එක
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

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-card-foreground font-bold">
            {author.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1">
              {author.id ? (
                <Link 
                  href={`/qna/profile/${author.id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {author.name}
                </Link>
              ) : (
                <h3 className="font-semibold text-foreground">{author.name}</h3>
              )}
              {/* Display badges */}
              {author.badges && author.badges.length > 0 && (
                <div className="flex gap-1">
                  {author.badges.map((badge, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs h-5 px-1">
                      {badge === 'Gold Scholar' && '🥇'}
                      {badge === 'Silver Scholar' && '🥈'}
                      {badge === 'Bronze Scholar' && '🥉'}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{author.role}</p>
            <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Category Badge */}
      {category && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {category}
          </span>
        </div>
      )}

      {/* Stream Embed */}
      {streamVideoId && (
        <div 
          ref={videoContainerRef}
          className="mb-4 rounded-xl overflow-hidden border border-border bg-card relative group/video" 
          style={{ aspectRatio: '16/9' }}
        >
          {!isPlaying ? (
            // Thumbnail - Click කළ විට Play වේ
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
                <iframe
                  className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 scale-[0.35] pointer-events-auto"
                  src={`https://www.youtube.com/embed/${streamVideoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`}
                  title={streamTitle ?? 'Live stream'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* MASKING LAYERS (යූටියුබ් පාලකයන් වසා දැමීමට) */}
              <div className="absolute top-0 left-0 right-0 h-[10%] bg-card z-10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-card z-10"></div>

              {/* Overlay - යූටියුබ් එකට redirect වීම වැළැක්වීමට */}
              <div className="absolute inset-0 z-20 bg-transparent pointer-events-auto"></div>

              {/* Custom Full Screen බොත්තම (Overlay එකට උඩින් z-30 ලෙස ඇත) */}
              <button 
                onClick={toggleFullScreen}
                className="absolute bottom-4 right-4 z-30 p-2 bg-card/50 hover:bg-card/80 text-foreground rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover/video:opacity-100"
                title="Full Screen"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <p className="text-foreground mb-4 leading-relaxed whitespace-pre-line">{content}</p>

      {/* Interaction Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
        <span>{likeCount} likes</span>
        <span>{commentCount} comments · {shares} shares</span>
      </div>

      {/* Interaction Buttons */}
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

      {/* Comments Section */}
      {showComments && <Comments postId={id} currentUserId={userId} onCommentAdded={handleCommentAdded} />}
    </div>
  )
}