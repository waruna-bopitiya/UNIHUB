'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { 
  Loader2, AlertCircle, Edit3, Trash2, Eye, EyeOff, Save, X, Check, Calendar, User, Hash
} from 'lucide-react'

interface Post {
  id: number
  creator_id: string
  author_name: string
  author_avatar: string
  author_role: string
  content: string
  category: string
  stream_video_id?: string
  stream_title?: string
  likes_count: number
  comments_count: number
  is_private: boolean
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editIsPrivate, setEditIsPrivate] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userId = localStorage.getItem('studentId')
        setCurrentUserId(userId)

        if (!userId) {
          setError('You must be logged in')
          setLoading(false)
          return
        }

        const res = await fetch(`/api/posts?userId=${userId}&myPosts=true`)
        if (!res.ok) throw new Error('Failed to fetch posts')

        const data = await res.json()
        setPosts(data)
        setError('')
      } catch (err: any) {
        console.error('Error fetching posts:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Start editing
  const handleEditStart = (post: Post) => {
    setEditingId(post.id)
    setEditContent(post.content)
    setEditCategory(post.category)
    setEditIsPrivate(post.is_private)
    setEditError('')
  }

  // Save edit
  const handleSaveEdit = async (postId: number) => {
    if (!editContent.trim()) {
      setEditError('Content cannot be empty')
      return
    }

    setEditLoading(true)
    setEditError('')

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: currentUserId,
          content: editContent,
          category: editCategory,
          is_private: editIsPrivate,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update post')
      }

      const updated = await res.json()
      setPosts(posts.map(p => p.id === postId ? updated : p))
      setEditingId(null)
    } catch (err: any) {
      console.error('Error updating post:', err)
      setEditError(err.message)
    } finally {
      setEditLoading(false)
    }
  }

  // Delete post
  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return

    setDeleteLoading(true)

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_id: currentUserId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete post')
      }

      setPosts(posts.filter(p => p.id !== postId))
    } catch (err: any) {
      console.error('Error deleting post:', err)
      alert(`Failed to delete post: ${err.message}`)
    } finally {
      setDeleteLoading(false)
      setDeleteConfirmId(null)
    }
  }

  // Toggle private
  const handleTogglePrivate = async (postId: number, currentPrivate: boolean) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    setEditLoading(true)

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: currentUserId,
          is_private: !currentPrivate,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update privacy')
      }

      const updated = await res.json()
      setPosts(posts.map(p => p.id === postId ? updated : p))
    } catch (err: any) {
      console.error('Error updating post privacy:', err)
      alert(`Failed to update privacy: ${err.message}`)
    } finally {
      setEditLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Posts</h1>
          <p className="text-muted-foreground">Manage, edit, or delete your posts</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold text-foreground">{posts.length}</p>
              </div>
              <Hash className="w-8 h-8 text-primary/30" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Public Posts</p>
                <p className="text-2xl font-bold text-foreground">{posts.filter(p => !p.is_private).length}</p>
              </div>
              <Eye className="w-8 h-8 text-primary/30" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Private Posts</p>
                <p className="text-2xl font-bold text-foreground">{posts.filter(p => p.is_private).length}</p>
              </div>
              <EyeOff className="w-8 h-8 text-primary/30" />
            </div>
          </div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">You haven't created any posts yet</p>
            <a href="/community" className="text-primary hover:underline">
              Create your first post
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-card border border-border rounded-lg overflow-hidden">
                {editingId === post.id ? (
                  // Edit Mode
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Edit Post</h3>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    {editError && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {editError}
                      </div>
                    )}

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={4}
                        maxLength={5000}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Update your post content..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">{editContent.length}/5000</p>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                      <select
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="General">General</option>
                        <option value="Discussion">Discussion</option>
                        <option value="Question">Question</option>
                        <option value="Study Material">Study Material</option>
                        <option value="Live Stream">Live Stream</option>
                        <option value="Event">Event</option>
                        <option value="Announcement">Announcement</option>
                      </select>
                    </div>

                    {/* Privacy */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`private-${post.id}`}
                        checked={editIsPrivate}
                        onChange={e => setEditIsPrivate(e.target.checked)}
                        className="rounded border-border bg-background"
                      />
                      <label htmlFor={`private-${post.id}`} className="text-sm text-foreground cursor-pointer">
                        Make this post private (only visible to you)
                      </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        disabled={editLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-lg font-medium transition"
                      >
                        {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {editLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-2 bg-muted hover:bg-border text-foreground rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {post.author_avatar}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{post.author_name}</p>
                              <p className="text-xs text-muted-foreground">{post.author_role}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.stream_title && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-700 dark:text-blue-400 text-xs font-medium">
                              📡 {post.stream_title}
                            </span>
                          )}
                          {post.is_private && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-700 dark:text-yellow-400 text-xs font-medium">
                              <EyeOff className="w-3 h-3" /> Private
                            </span>
                          )}
                          <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t border-border">
                        <span>👍 {post.likes_count} likes</span>
                        <span>💬 {post.comments_count} comments</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex border-t border-border">
                      <button
                        onClick={() => handleEditStart(post)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-muted text-foreground transition border-r border-border"
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleTogglePrivate(post.id, post.is_private)}
                        disabled={editLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-muted disabled:opacity-50 text-foreground transition border-r border-border"
                      >
                        {post.is_private ? (
                          <><Eye className="w-4 h-4" /> Make Public</>
                        ) : (
                          <><EyeOff className="w-4 h-4" /> Make Private</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deleteLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-destructive/10 disabled:opacity-50 text-destructive transition"
                      >
                        {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
