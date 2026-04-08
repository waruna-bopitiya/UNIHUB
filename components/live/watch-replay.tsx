'use client'

import { Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface WatchReplayProps {
  streamId: number
  postId: number | null
  streamTitle: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'secondary'
  showLabel?: boolean
  className?: string
}

export function WatchReplay({
  streamId,
  postId,
  streamTitle,
  size = 'md',
  variant = 'secondary',
  showLabel = true,
  className = '',
}: WatchReplayProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // If no post_id, replay might not be available yet
  const isAvailable = !!postId

  const handleWatchReplay = async () => {
    if (!isAvailable) {
      return
    }

    setLoading(true)
    try {
      // Navigate to community page with post ID as query parameter
      // Or directly navigate to post if we have a direct post page
      router.push(`/community?post=${postId}`)
    } catch (error) {
      console.error('Error navigating to replay:', error)
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 px-2.5 gap-1.5 text-xs',
    md: 'h-9 px-3 gap-2 text-sm',
    lg: 'h-10 px-4 gap-2 text-base',
  }

  if (!isAvailable) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={`transition-all ${sizeClasses[size]} ${className} opacity-50 cursor-not-allowed`}
        title="Replay will be available soon"
      >
        <Play className="w-4 h-4" />
        {showLabel && 'Replay Processing'}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleWatchReplay}
      disabled={loading}
      className={`transition-all ${sizeClasses[size]} ${className}`}
      title={`Watch replay of ${streamTitle}`}
    >
      <Play className="w-4 h-4 fill-current" />
      {showLabel && (loading ? 'Loading...' : 'Watch Replay')}
    </Button>
  )
}
