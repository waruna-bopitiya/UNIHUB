'use client'

import { useState } from 'react'
import { Send, Image, FileText } from 'lucide-react'

export function CreatePost() {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle post submission
    setContent('')
    setCategory('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-lg p-6 mb-6"
    >
      {/* User Profile Section */}
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-card-foreground font-bold">
          Y
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
          disabled={!content.trim()}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Post
        </button>
      </div>
    </form>
  )
}
