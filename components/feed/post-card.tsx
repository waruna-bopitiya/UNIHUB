'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react'

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
}: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
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

      {/* Content */}
      <p className="text-foreground mb-4 leading-relaxed">{content}</p>

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
