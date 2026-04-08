"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, ChevronDown, ChevronUp, ArrowBigUp, ArrowBigDown, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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
    userVote?: 'upvote' | 'downvote' | null
    createdAt: Date
    comments?: CommentType[]
  }
  questionId: string
  userId?: string
  onVoteComplete?: () => void
  onAnswerDeleted?: () => void
  onAnswerUpdated?: () => void
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

export default function AnswerCard({ answer, questionId, userId, onVoteComplete, onAnswerDeleted, onAnswerUpdated }: AnswerCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [comments, setComments] = useState<CommentType[]>(answer.comments || [])
  const [upvotes, setUpvotes] = useState(answer.upvotes)
  const [downvotes, setDownvotes] = useState(answer.downvotes)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(
    answer.userVote ? (answer.userVote === 'upvote' ? 'upvote' : 'downvote') : null
  )
  const [isVoting, setIsVoting] = useState(false)
  const [isEditingAnswer, setIsEditingAnswer] = useState(false)
  const [editedContent, setEditedContent] = useState(answer.content)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeletingAnswer, setIsDeletingAnswer] = useState(false)

  const isAnswerAuthor = userId && userId === answer.author.id

  console.log(`🎯 AnswerCard #${answer.id} rendered - prop.userVote=${answer.userVote}, state.userVote=${answer.userVote ? (answer.userVote === 'upvote' ? 'upvote' : 'downvote') : null}`)

  // Sync state with answer prop when it changes (after database refresh)
  useEffect(() => {
    console.log(`🔄 AnswerCard #${answer.id} useEffect triggered - answer.userVote=${answer.userVote}`)
    setUpvotes(answer.upvotes)
    setDownvotes(answer.downvotes)
    const newUserVote = answer.userVote ? (answer.userVote === 'upvote' ? 'upvote' : 'downvote') : null
    setUserVote(newUserVote)
    console.log(`📊 Answer #${answer.id} updated from database - userVote: ${answer.userVote} → ${newUserVote}`)
  }, [answer.id, answer.upvotes, answer.downvotes, answer.userVote])

  const handleVote = async (type: "up" | "down") => {
    if (!userId) {
      toast.error("Please sign in to vote")
      return
    }

    setIsVoting(true)
    try {
      const response = await fetch('/api/qna/answer-votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerId: parseInt(answer.id),
          questionId: parseInt(questionId),
          userId,
          voteType: type === 'up' ? 'upvote' : 'downvote'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Vote failed')
      }

      // Update local state with new vote counts
      setUpvotes(Math.max(0, parseInt(data.upvotes) || 0))
      setDownvotes(Math.max(0, parseInt(data.downvotes) || 0))

      // Update user's vote state
      const newVote = type === 'up' ? 'upvote' : 'downvote'
      if (data.status === 'removed') {
        setUserVote(null)
        console.log('🗑️ Vote removed - userVote set to null')
        toast.success(`Your ${type === 'up' ? 'upvote' : 'downvote'} has been removed`)
      } else if (data.status === 'created') {
        setUserVote(newVote)
        console.log('➕ Vote created - userVote set to:', newVote)
        toast.success(`Your ${type === 'up' ? 'upvote' : 'downvote'} has been saved`)
      } else if (data.status === 'updated') {
        setUserVote(newVote)
        console.log('🔄 Vote updated - userVote set to:', newVote)
        toast.success(`Changed to ${type === 'up' ? 'upvote' : 'downvote'}`)
      }

      // Refresh answers from database to show updated badge
      if (onVoteComplete) {
        console.log('📄 Refreshing answers from database... userId in AnswerCard:', userId)
        onVoteComplete()
      }
    } catch (error) {
      console.error('❌ Vote error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) {
      toast.error("Answer cannot be empty")
      return
    }

    if (editedContent.trim().length < 10) {
      toast.error("Answer must be at least 10 characters")
      return
    }

    setIsSavingEdit(true)
    try {
      const response = await fetch('/api/qna/answers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerId: answer.id,
          content: editedContent.trim(),
          userId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update answer')
      }

      toast.success("Answer updated successfully!")
      setIsEditingAnswer(false)
      onAnswerUpdated?.()
    } catch (error) {
      console.error('Error updating answer:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update answer')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteAnswer = async () => {
    if (!confirm('Are you sure you want to delete this answer? This action cannot be undone.')) {
      return
    }

    setIsDeletingAnswer(true)
    try {
      const response = await fetch(
        `/api/qna/answers?answerId=${answer.id}&userId=${userId}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete answer')
      }

      toast.success("Answer deleted successfully")
      onAnswerDeleted?.()
    } catch (error) {
      console.error('Error deleting answer:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete answer')
    } finally {
      setIsDeletingAnswer(false)
    }
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

  const netVotes = upvotes - downvotes

  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex gap-4">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={() => handleVote("up")}
            disabled={isVoting}
            className={`transition-colors rounded-md p-1 ${
              userVote === "upvote" 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ArrowBigUp className="w-6 h-6" />
          </button>
          <span className={`text-lg font-bold ${Math.max(0, netVotes) > 0 ? 'text-primary' : Math.max(0, netVotes) < 0 ? 'text-destructive' : ''}`}>
            {Math.max(0, netVotes)}
          </span>
          <button 
            onClick={() => handleVote("down")}
            disabled={isVoting}
            className={`transition-colors rounded-md p-1 ${
              userVote === "downvote" 
                ? "text-destructive bg-destructive/10" 
                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ArrowBigDown className="w-6 h-6" />
          </button>

          {/* User vote badge - More prominent */}
          {userVote && (
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold text-center transition-all w-full ${
              userVote === 'upvote' 
                ? 'bg-primary/20 text-primary border border-primary/50' 
                : 'bg-destructive/20 text-destructive border border-destructive/50'
            }`}>
              {userVote === 'upvote' ? 'You ⬆️' : 'You ⬇️'}
            </div>
          )}
        </div>

        {/* Answer content */}
        <div className="flex-1">
          {/* Edit mode */}
          {isEditingAnswer ? (
            <div className="space-y-3">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
                placeholder="Edit your answer..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsEditingAnswer(false)
                    setEditedContent(answer.content)
                  }}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Answer text */}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm">{answer.content}</p>
              </div>

              {/* Author info and action buttons */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50 justify-between">
                <div className="flex items-center gap-2">
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

                {/* Action buttons - only show for answer author */}
                {isAnswerAuthor && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingAnswer(true)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Edit answer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteAnswer}
                      disabled={isDeletingAnswer}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete answer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

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