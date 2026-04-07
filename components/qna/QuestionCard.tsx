"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Edit2, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import VoteButtons from "./VoteButtons"

interface QuestionCardProps {
  question: {
    id: string
    title: string
    content: string
    author: {
      name: string
      avatar: string
      id?: string
    }
    upvotes: number
    downvotes: number
    answers: number
    category: string
    categoryName: string
    createdAt: string | Date
    user_id?: string
  }
  onVoteComplete?: () => void
  onDelete?: () => void
}

function isWithinEditWindow(createdAt: string | Date): boolean {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return created >= sevenDaysAgo
}

export default function QuestionCard({ question, onVoteComplete, onDelete }: QuestionCardProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem('studentId')
    setCurrentUserId(userId)
  }, [])

  const handleVote = (type: "up" | "down") => {
    // TODO: API call to vote
    console.log("Vote on question:", question.id, type)
  }

  const isOwner = currentUserId && (question.user_id || question.author.id) && 
    currentUserId === (question.user_id || question.author.id)
  const isEditable = isOwner && isWithinEditWindow(question.createdAt)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/qna/question/${question.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUserId}`,
        }
      })

      if (!response.ok) {
        const error = await response.json()
        setDeleteError(error.error || 'Failed to delete question')
        return
      }

      console.log('✅ Question deleted successfully')
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error('❌ Error deleting question:', error)
      setDeleteError('An error occurred while deleting the question')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="border border-border rounded-lg bg-card p-4 hover:border-primary/20 transition-colors">
      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {deleteError}
        </div>
      )}
      <div className="flex gap-4">
        {/* Vote buttons - using reusable component */}
        <VoteButtons
          questionId={question.id}
          upvotes={question.upvotes}
          downvotes={question.downvotes}
          onVote={handleVote}
          onVoteComplete={onVoteComplete}
          size="md"
          orientation="vertical"
        />

        {/* Question content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/qna/question/${question.id}`}>
              <h2 className="text-lg font-semibold hover:text-primary transition-colors">
                {question.title}
              </h2>
            </Link>
            
            {/* Edit and Delete buttons */}
            {isEditable && (
              <div className="flex gap-2">
                <Link 
                  href={`/qna/question/${question.id}/edit`}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Edit question"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-red-100 hover:text-red-600 transition-colors text-muted-foreground disabled:opacity-50"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {question.content}
          </p>
          
          {/* Meta info */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <img 
                src={question.author.avatar} 
                alt={question.author.name}
                className="w-5 h-5 rounded-full"
              />
              <span>{question.author.name}</span>
            </div>
            <span>•</span>
            <span>{formatDistanceToNow(typeof question.createdAt === 'string' ? new Date(question.createdAt) : question.createdAt, { addSuffix: true })}</span>
            <span>•</span>
            <Link 
              href={`/qna/category/${question.category}`}
              className="bg-secondary px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors"
            >
              {question.categoryName}
            </Link>
            
            {/* Answers count - Now clickable! */}
            <Link 
              href={`/qna/question/${question.id}`}
              className="flex items-center gap-1 ml-auto hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{question.answers} {question.answers === 1 ? "answer" : "answers"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}