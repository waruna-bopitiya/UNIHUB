"use client"

import { useState } from "react"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"
import { toast } from "sonner"

interface VoteButtonsProps {
  questionId: string
  upvotes: number
  downvotes: number
  onVote?: (type: "up" | "down") => void
  onVoteComplete?: () => void
  size?: "sm" | "md" | "lg"
  orientation?: "vertical" | "horizontal"
  initialVote?: "up" | "down" | null
}

export default function VoteButtons({ 
  questionId,
  upvotes, 
  downvotes, 
  onVote,
  onVoteComplete,
  size = "md",
  orientation = "vertical",
  initialVote = null
}: VoteButtonsProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(initialVote)
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes)
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes)
  const [isLoading, setIsLoading] = useState(false)

  const netVotes = currentUpvotes - currentDownvotes

  const handleVote = async (type: "up" | "down") => {
    const userId = localStorage.getItem('studentId')
    if (!userId) {
      toast.error("Please log in to vote")
      return
    }

    console.log('🗳️ User voting:', { questionId, userId, voteType: type === 'up' ? 'upvote' : 'downvote' })
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/qna/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: parseInt(questionId),
          userId,
          voteType: type === 'up' ? 'upvote' : 'downvote'
        })
      })

      const data = await response.json()
      console.log('📋 Vote API response:', { status: data.status, upvotes: data.upvotes, downvotes: data.downvotes })
      
      if (!response.ok) {
        throw new Error(data.error || 'Vote failed')
      }

      // Ensure votes are never negative - strict protection
      const upvotes = Math.max(0, parseInt(data.upvotes) || 0)
      const downvotes = Math.max(0, parseInt(data.downvotes) || 0)
      
      console.log('✅ Protected votes:', { upvotes, downvotes })
      setCurrentUpvotes(upvotes)
      setCurrentDownvotes(downvotes)
      
      // Update user's vote type and show confirmation message
      if (data.status === 'removed') {
        setVote(null)
        toast.success(`Your ${type === 'up' ? 'upvote' : 'downvote'} has been removed`)
      } else if (data.status === 'created') {
        setVote(type)
        toast.success(`Your ${type === 'up' ? 'upvote' : 'downvote'} has been saved`)
      } else if (data.status === 'updated') {
        setVote(type)
        toast.success(`Changed to ${type === 'up' ? 'upvote' : 'downvote'}`)
      }
      
      onVote?.(type)
      onVoteComplete?.()
    } catch (error) {
      console.error('❌ Vote error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to vote. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Size classes
  const sizeClasses = {
    sm: { icon: "w-4 h-4", text: "text-xs", button: "p-0.5" },
    md: { icon: "w-5 h-5", text: "text-sm", button: "p-1" },
    lg: { icon: "w-6 h-6", text: "text-lg", button: "p-1.5" }
  }
  const sizes = sizeClasses[size]

  // Orientation classes
  const orientationClasses = {
    vertical: "flex flex-col items-center gap-1",
    horizontal: "flex items-center gap-2"
  }

  // Color classes based on vote state
  const getUpvoteClass = () => {
    if (vote === "up") return "text-primary bg-primary/10"
    return "text-muted-foreground hover:text-primary hover:bg-primary/10"
  }

  const getDownvoteClass = () => {
    if (vote === "down") return "text-destructive bg-destructive/10"
    return "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
  }

  const getVoteTextClass = () => {
    if (netVotes > 0) return "text-primary"
    if (netVotes < 0) return "text-destructive"
    return ""
  }

  // Ensure votes are always non-negative for display
  const displayUpvotes = Math.max(0, currentUpvotes)
  const displayDownvotes = Math.max(0, currentDownvotes)
  const displayNetVotes = displayUpvotes - displayDownvotes

  return (
    <div className={orientationClasses[orientation]}>
      <button
        onClick={() => handleVote("up")}
        disabled={isLoading}
        className={`rounded-md transition-all duration-200 ${getUpvoteClass()} ${sizes.button} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label="Upvote"
      >
        <ArrowBigUp className={sizes.icon} />
      </button>
      
      <span className={`font-medium ${sizes.text} ${getVoteTextClass()}`}>
        {Math.max(0, displayNetVotes)}
      </span>
      
      <button
        onClick={() => handleVote("down")}
        disabled={isLoading}
        className={`rounded-md transition-all duration-200 ${getDownvoteClass()} ${sizes.button} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label="Downvote"
      >
        <ArrowBigDown className={sizes.icon} />
      </button>
    </div>
  )
}