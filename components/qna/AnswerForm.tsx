"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import VoteButtons from "./VoteButtons"

interface AnswerCardProps {
  answer: {
    id: string
    content: string
    author: {
      id: string
      name: string
      avatar: string
    }
    upvotes: number
    downvotes: number
    createdAt: Date
    comments?: CommentType[]
  }
  questionId: string
  onVote?: (answerId: string, value: number) => void
}

interface CommentType {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  createdAt: Date
}

export default function AnswerCard({ answer, questionId, onVote }: AnswerCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [comments, setComments] = useState<CommentType[]>(answer.comments || [])

  const handleVote = (type: "up" | "down") => {
    const value = type === "up" ? 1 : -1
    onVote?.(answer.id, value)
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    
    setIsAddingComment(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/qna/answer/${answer.id}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: commentText })
      // })
      // const newComment = await response.json()
      
      // Mock new comment
      const newComment: CommentType = {
        id: Date.now().toString(),
        content: commentText,
        author: {
          id: "current-user",
          name: "You",
          avatar: "https://avatar.vercel.sh/you"
        },
        createdAt: new Date()
      }
      
      setComments([...comments, newComment])
      setCommentText("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsAddingComment(false)
    }
  }

  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex gap-4">
        {/* Vote buttons - using reusable VoteButtons component */}
        <VoteButtons
          upvotes={answer.upvotes}
          downvotes={answer.downvotes}
          onVote={handleVote}
          size="md"
          orientation="vertical"
        />

        {/* Answer content */}
        <div className="flex-1">
          {/* Answer text */}
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm">{answer.content}</p>
          </div>

          {/* Author info */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
            <Link href={`/qna/profile/${answer.author.id}`}>
              <img
                src={answer.author.avatar}
                alt={answer.author.name}
                className="w-6 h-6 rounded-full hover:opacity-80 transition-opacity"
              />
            </Link>
            <Link
              href={`/qna/profile/${answer.author.id}`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {answer.author.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(answer.createdAt, { addSuffix: true })}
            </span>
          </div>

          {/* Comments section */}
          <div className="mt-4">
            {/* Toggle comments button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showComments ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <MessageCircle className="w-3 h-3" />
              <span>{comments.length} comments</span>
            </button>

            {/* Comments list */}
            {showComments && (
              <div className="mt-3 space-y-3 pl-4 border-l-2 border-border">
                {comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <Link href={`/qna/profile/${comment.author.id}`}>
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-5 h-5 rounded-full"
                        />
                      </Link>
                      <Link
                        href={`/qna/profile/${comment.author.id}`}
                        className="text-xs font-medium hover:text-primary"
                      >
                        {comment.author.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mt-1 ml-7">{comment.content}</p>
                  </div>
                ))}

                {/* Add comment form */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleAddComment()
                      }
                    }}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={isAddingComment || !commentText.trim()}
                    className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingComment ? "..." : "Post"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}