'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Feedback {
  id: number
  resourceId: number
  rating: number
  comment: string | null
  userName: string
  created_at: string
}

interface ResourceFeedbackProps {
  resourceId: number
  resourceName: string
  onFeedbackAdded?: () => void
}

const COMMENT_MAX_LENGTH = 255

export function ResourceFeedback({ resourceId, resourceName, onFeedbackAdded }: ResourceFeedbackProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [userName, setUserName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [newFeedbackId, setNewFeedbackId] = useState<number | null>(null)
  const feedbackListRef = useRef<HTMLDivElement>(null)

  // Fetch user data from localStorage
  useEffect(() => {
    const firstName = localStorage.getItem('firstName')
    if (firstName) {
      setUserName(firstName)
      setIsLoggedIn(true)
    }
  }, [])

  // Fetch feedback on mount
  useEffect(() => {
    fetchFeedback()
  }, [resourceId])

  // Clear highlight after 5 seconds
  useEffect(() => {
    if (newFeedbackId) {
      const timer = setTimeout(() => {
        setNewFeedbackId(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [newFeedbackId])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/resources/feedback?resourceId=${resourceId}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setFeedback(data)
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value
    if (newComment.length <= COMMENT_MAX_LENGTH) {
      setComment(newComment)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rating) {
      toast.error('Please select a rating')
      return
    }

    if (!isLoggedIn) {
      toast.error('Please log in to submit feedback')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/resources/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          rating,
          comment: comment.trim() || null,
          userName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save feedback')
      }

      const newFeedback = await response.json()
      setFeedback([newFeedback, ...feedback])
      setNewFeedbackId(newFeedback.id)
      toast.success('Thank you for your feedback!')

      // Reset form
      setRating(0)
      setComment('')
      setShowForm(false)
      
      // Refresh feedback stats (e.g., average rating, count) on parent page
      if (onFeedbackAdded) {
        onFeedbackAdded()
      }
      
      // Auto-scroll to show the new feedback
      setTimeout(() => {
        feedbackListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to save feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating =
    feedback.length > 0
      ? parseFloat((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1))
      : 0

  if (!isLoggedIn) {
    return (
      <div className="mt-8 border-t pt-8">
        <div className="bg-secondary/30 rounded-lg p-4 text-center">
          <p className="text-muted-foreground">Please log in to view and submit feedback</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 border-t pt-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Feedback & Reviews
        </h3>

        {/* Rating Summary */}
        <div className="bg-secondary/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Average Rating</p>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={
                        averageRating >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <p className="text-2xl font-bold">{averageRating}</p>
                <p className="text-sm text-muted-foreground">({feedback.length} reviews)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Feedback Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} variant="outline" className="mb-6">
            + Add Review
          </Button>
        )}

        {/* Feedback Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-secondary/30 rounded-lg p-4 mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <div className="px-4 py-2 bg-secondary rounded-lg border border-border">
                <p className="text-foreground font-medium">{userName}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Using your logged-in name
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                    disabled={submitting}
                  >
                    <Star
                      size={28}
                      className={
                        rating >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Comment (Optional) - {comment.length}/{COMMENT_MAX_LENGTH} characters
              </label>
              <Textarea
                placeholder="Share your feedback about this resource..."
                value={comment}
                onChange={handleCommentChange}
                disabled={submitting}
                rows={3}
                maxLength={COMMENT_MAX_LENGTH}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {COMMENT_MAX_LENGTH - comment.length} characters remaining
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting || !rating}>
                {submitting ? 'Saving...' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Feedback List */}
      <div className="space-y-4" ref={feedbackListRef}>
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading reviews...</p>
        ) : feedback.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this resource!
          </p>
        ) : (
          feedback.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg p-4 border border-border/50 transition-all duration-500 ${
                newFeedbackId === item.id
                  ? 'bg-green-100/30 border-green-400/50 ring-2 ring-green-400/30'
                  : 'bg-secondary/20'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.userName}</p>
                    {newFeedbackId === item.id && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Just now
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        item.rating >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
              </div>
              {item.comment && (
                <p className="text-sm text-foreground mt-2">{item.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
