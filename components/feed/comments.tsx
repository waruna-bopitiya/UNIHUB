'use client'

import { useState, useEffect } from 'react'
import { Trash2, Loader2 } from 'lucide-react'

interface Comment {
  id: number
  post_id: number
  user_id: string
  user_name: string
  user_avatar: string
  content: string
  created_at: string
}

interface CommentsProps {
  postId: string
  currentUserId?: string
  onCommentAdded?: () => void
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function Comments({ postId, currentUserId, onCommentAdded }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userName, setUserName] = useState('')
  const [userAvatar, setUserAvatar] = useState('S')

  // Fetch current user info and comments
  useEffect(() => {
    fetchComments()
    fetchCurrentUserInfo()
  }, [postId])

  const fetchCurrentUserInfo = async () => {
    try {
      const userId = localStorage.getItem('studentId')
      const email = localStorage.getItem('email')

      if (!userId && !email) return

      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (email) params.append('email', email)

      const res = await fetch(`/api/user/me?${params.toString()}`)
      if (res.ok) {
        const user = await res.json()
        setUserName(user.name)
        setUserAvatar(user.avatar || 'S')
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const fetchComments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/posts/${postId}/comments`)
      if (res.ok) {
        const data = await res.json()
        console.log(`📝 Fetched ${data.length} comments for post ${postId}`)
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    if (!currentUserId) {
      alert('Please log in to comment')
      return
    }

    setSubmitting(true)

    try {
      console.log(`💬 Submitting comment by ${userName} (${currentUserId})`)

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          userName: userName || 'Anonymous',
          userAvatar: userAvatar || 'S',
          content: newComment,
        }),
      })

      if (res.ok) {
        const comment = await res.json()
        console.log(`✅ Comment created:`, comment)
        setComments([comment, ...comments])
        setNewComment('')
        onCommentAdded?.()
      } else {
        const error = await res.json()
        alert(`Failed to post comment: ${error.error}`)
      }
    } catch (error) {
      console.error('❌ Error submitting comment:', error)
      alert('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return

    try {
      const res = await fetch(`/api/posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      })

      if (res.ok) {
        console.log(`✅ Comment ${commentId} deleted`)
        setComments(comments.filter(c => c.id !== commentId))
      } else {
        const error = await res.json()
        alert(`Failed to delete comment: ${error.error}`)
      }
    } catch (error) {
      console.error('❌ Error deleting comment:', error)
      alert('Failed to delete comment')
    }
  }

  return (
    <div className="border-t border-border pt-4 mt-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-card-foreground shrink-0">
            {userAvatar}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              disabled={!currentUserId}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting || !currentUserId}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Commenting...
                  </span>
                ) : (
                  'Comment'
                )}
              </button>
            </div>
          </div>
        </div>
        {!currentUserId && (
          <p className="text-xs text-muted-foreground mt-2">Please log in to comment</p>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-card-foreground shrink-0">
                {comment.user_avatar}
              </div>
              <div className="flex-1">
                <div className="bg-secondary rounded-lg px-3 py-2">
                  <p className="font-medium text-sm text-foreground">{comment.user_name}</p>
                  <p className="text-sm text-foreground py-1">{comment.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(comment.created_at)}</p>
              </div>
              {currentUserId === comment.user_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
