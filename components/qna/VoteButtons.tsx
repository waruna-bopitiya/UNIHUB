"use client"

import { useState } from "react"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"

interface VoteButtonsProps {
  upvotes: number
  downvotes: number
  onVote?: (type: "up" | "down") => void
  size?: "sm" | "md" | "lg"
  orientation?: "vertical" | "horizontal"
  initialVote?: "up" | "down" | null
}

export default function VoteButtons({ 
  upvotes, 
  downvotes, 
  onVote,
  size = "md",
  orientation = "vertical",
  initialVote = null
}: VoteButtonsProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(initialVote)
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes)
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes)

  const netVotes = currentUpvotes - currentDownvotes

  const handleVote = (type: "up" | "down") => {
    let newVote: "up" | "down" | null = type
    let upvoteChange = 0
    let downvoteChange = 0

    // Handle vote logic
    if (vote === type) {
      // Remove vote
      newVote = null
      if (type === "up") {
        upvoteChange = -1
      } else {
        downvoteChange = -1
      }
    } else {
      // Change or add vote
      if (vote === "up") {
        upvoteChange = -1
      } else if (vote === "down") {
        downvoteChange = -1
      }
      
      if (type === "up") {
        upvoteChange += 1
      } else {
        downvoteChange += 1
      }
    }

    // Update local state
    setVote(newVote)
    setCurrentUpvotes(currentUpvotes + upvoteChange)
    setCurrentDownvotes(currentDownvotes + downvoteChange)

    // Call parent handler
    onVote?.(type)
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