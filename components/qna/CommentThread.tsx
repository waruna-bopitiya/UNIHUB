"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface CommentType {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  createdAt: Date
  replies?: CommentType[]
  parentId?: string | null
}

interface CommentThreadProps {
  comments: CommentType[]
  onAddComment?: (content: string, parentId?: string | null) => void
  onEditComment?: (commentId: string, content: string) => void
  onDeleteComment?: (commentId: string) => void
  currentUserId?: string
  maxDepth?: number
  showReplyButton?: boolean
  showEditDelete?: boolean
  depth?: number
}

export default function CommentThread({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUserId,
  maxDepth = 3,
  showReplyButton = true,
  showEditDelete = true,
  depth = 0
}: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const handleReplySubmit = (commentId: string) => {
    if (replyText.trim()) {
      onAddComment?.(replyText, commentId)
      setReplyText("")
      setReplyingTo(null)
    }
  }

  if (depth >= maxDepth || comments.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 ml-4 border-l border-border/50 pl-4">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-2">
          {/* Comment */}
          <div className="bg-muted/30 rounded p-3">
            <div className="flex items-start gap-3">
              <Link href={`/qna/profile/${comment.author.id}`}>
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-6 h-6 rounded-full hover:opacity-80 transition-opacity flex-shrink-0"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/qna/profile/${comment.author.id}`}
                    className="text-xs font-medium hover:text-primary transition-colors"
                  >
                    {comment.author.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-foreground mt-1 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {showReplyButton && (
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Reply
                    </button>
                  )}
                  {showEditDelete && currentUserId === comment.author.id && (
                    <>
                      <button
                        onClick={() => onEditComment?.(comment.id, comment.content)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteComment?.(comment.id)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3 ml-8">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyText("")
                    }}
                    className="px-3 py-1 text-xs border border-border rounded hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <CommentThread
              comments={comment.replies}
              onAddComment={onAddComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              currentUserId={currentUserId}
              maxDepth={maxDepth}
              showReplyButton={showReplyButton}
              showEditDelete={showEditDelete}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  )
}