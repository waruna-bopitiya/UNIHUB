'use client'

import { useState } from 'react'
import { Send, Image, FileText, Loader2 } from 'lucide-react'

interface CreatePostProps {
  onPostCreated?: (post: any) => void
  currentUser?: {
    id: string
    name: string
    avatar: string
  }
}

export function CreatePost({ onPostCreated, currentUser }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: currentUser?.name || 'Student',
          author_avatar: currentUser?.avatar || 'S',
          author_role: 'Student',
          content: content.trim(),
          category: category || 'General',
        }),
      })
      if (!res.ok) throw new Error('Failed to post')
      const newPost = await res.json()
      onPostCreated?.(newPost)
      setContent('')
      setCategory('')
    } catch {
      setError('Could not post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-lg p-6 mb-6"
    >
      {/* User Profile Section */}
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-card-foreground font-bold">
          {currentUser?.avatar || 'S'}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, ask a question, or post study materials..."
            className="w-full resize-none bg-secondary rounded-lg p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select category...</option>
          <option value="Question">Question</option>
          <option value="Study Material">Study Material</option>
          <option value="Discussion">Discussion</option>
          <option value="Resource">Resource</option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <Image className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}
