'use client'

import { Download, Eye, Heart, FileType } from 'lucide-react'
import { useState } from 'react'

interface MaterialCardProps {
  id: string
  title: string
  subject: string
  uploader: string
  downloads: number
  views: number
  likes: number
  fileType: string
  uploadDate: string
}

export function MaterialCard({
  id,
  title,
  subject,
  uploader,
  downloads: initialDownloads,
  views: initialViews,
  likes: initialLikes,
  fileType,
  uploadDate,
}: MaterialCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)

  const handleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  const getFileIcon = () => {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return 'text-destructive'
      case 'DOCX':
        return 'text-primary'
      case 'PPT':
        return 'text-accent'
      case 'ZIP':
        return 'text-muted-foreground'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center ${getFileIcon()}`}>
          <FileType className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{subject}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Uploaded by {uploader} on {uploadDate}
          </p>
        </div>
      </div>

      {/* File Type Badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
          {fileType}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 py-4 border-y border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Views</p>
          <p className="font-bold text-foreground flex items-center justify-center gap-1">
            <Eye className="w-4 h-4" />
            {initialViews.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Downloads</p>
          <p className="font-bold text-foreground flex items-center justify-center gap-1">
            <Download className="w-4 h-4" />
            {initialDownloads.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Likes</p>
          <p className="font-bold text-foreground flex items-center justify-center gap-1">
            <Heart className="w-4 h-4" />
            {likes.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            liked
              ? 'bg-destructive/20 text-destructive'
              : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          Like
        </button>
      </div>
    </div>
  )
}
