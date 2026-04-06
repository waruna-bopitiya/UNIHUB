'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreVertical, Play, Radio } from 'lucide-react'

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
}

export function PostCard({
  id,
  author,
  timestamp,
  content,
  category,
  likes: initialLikes,
  comments,
  shares,
  streamVideoId,
  streamTitle,
}: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikes)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleLike = async () => {
    const action = liked ? 'unlike' : 'like'
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    try {
      const res = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const data = await res.json()
        setLikeCount(data.likes_count)
      }
    } catch {}
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
            <h3 className="font-semibold text-foreground">{author.name}</h3>
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
          className="mb-4 rounded-xl overflow-hidden border border-border bg-black relative" 
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                <div className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transform group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-white" /> Watch Video
                </div>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                <Radio className="w-3 h-3" /> LIVE
              </div>
            </div>
          ) : (
            // ඔයාගේ අදහසට අනුව සකසන ලද ක්‍රමය
            <div className="absolute inset-0 overflow-hidden bg-black">
              <iframe
                /* w-[300%] h-[300%] මගින් iframe එක අතිවිශාල කරයි.
                  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 මගින් එය හරියටම මැදට ගනී.
                  scale-[0.35] මගින් නැවත කුඩා කර කන්ටේනරයට සරිලන සේ (105% ක් පමණ) සකසයි.
                  එවිට කුඩා වූ බටන්ස් අයිනෙන් පිටතට යයි! 
                */
                className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 scale-[0.35] pointer-events-auto"
                src={`https://www.youtube.com/embed/${streamVideoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1`}
                title={streamTitle ?? 'Live stream'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              {/* Overlay - යූටියුබ් එකට redirect වීම වැළැක්වීමට */}
              <div className="absolute inset-0 z-10 bg-transparent pointer-events-auto"></div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <p className="text-foreground mb-4 leading-relaxed whitespace-pre-line">{content}</p>

      {/* Interaction Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
        <span>{likeCount} likes</span>
        <span>{comments} comments · {shares} shares</span>
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
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}