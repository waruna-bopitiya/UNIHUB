"use client"

import { useState } from "react"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [vote, setVote] = useState<"up" | "down" | null>(initialVote)
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes)
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes)
  const [isLoading, setIsLoading] = useState(false)

  const netVotes = currentUpvotes - currentDownvotes

  const handleVote = async (type: "up" | "down") => {
    const userId = localStorage.getItem('studentId')
    if (!userId) {
      toast({
        title: "Not Logged In",
        description: "Please log in to vote",
        variant: "destructive"
      })
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

      // Simple approach: trust the server response for the correct counts
      setCurrentUpvotes(data.upvotes || currentUpvotes)
      setCurrentDownvotes(data.downvotes || currentDownvotes)
      
      // Update user's vote type and show confirmation message
      if (data.status === 'removed') {
        setVote(null)
        toast({
          title: "✅ Vote Removed",
          description: `Your ${type === 'up' ? 'upvote' : 'downvote'} has been removed`,
          variant: "default"
        })
      } else if (data.status === 'created') {
        setVote(type)
        toast({
          title: "✅ Vote Recorded",
          description: `Your ${type === 'up' ? 'upvote' : 'downvote'} has been saved`,
          variant: "default"
        })
      } else if (data.status === 'updated') {
        setVote(type)
        toast({
          title: "✅ Vote Changed",
          description: `Changed to ${type === 'up' ? 'upvote' : 'downvote'}`,
          variant: "default"
        })
      }
      
      onVote?.(type)
      onVoteComplete?.()
    } catch (error) {
      console.error('❌ Vote error:', error)
      toast({
        title: "❌ Vote Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })
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

  return (
    <div className={orientationClasses[orientation]}>
      <button
        onClick={() => handleVote("up")}
        className={`rounded-md transition-all duration-200 ${getUpvoteClass()} ${sizes.button}`}
        aria-label="Upvote"
      >
        <ArrowBigUp className={sizes.icon} />
      </button>
      
      <span className={`font-medium ${sizes.text} ${getVoteTextClass()}`}>
        {netVotes}
      </span>
      
      <button
        onClick={() => handleVote("down")}
        className={`rounded-md transition-all duration-200 ${getDownvoteClass()} ${sizes.button}`}
        aria-label="Downvote"
      >
        <ArrowBigDown className={sizes.icon} />
      </button>
    </div>
  )
}