"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function EditQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.id

  const [question, setQuestion] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  // Check if user is logged in
  useEffect(() => {
    const studentId = localStorage.getItem('studentId')
    setUserId(studentId)
  }, [])

  // Fetch the question
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId) return

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/qna/question/${questionId}`, {
          headers: {
            'Authorization': `Bearer ${userId}`,
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch question')
        }

        const data = await response.json()
        const questionData = data.data

        if (!questionData) {
          throw new Error('Question not found')
        }

        // Check if user is the owner
        if (userId && questionData.user_id !== userId) {
          throw new Error('You can only edit your own questions')
        }

        // Check if question is editable
        if (!questionData.isEditable) {
          throw new Error('This question can no longer be edited. Questions can only be edited within 7 days of creation.')
        }

        setQuestion(questionData)
        setTitle(questionData.title)
        setContent(questionData.content)
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchQuestion()
    }
  }, [questionId, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/qna/question/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update question')
      }

      toast.success('Question updated successfully!')
      router.push(`/qna/question/${questionId}`)
    } catch (err: any) {
      console.error('Error updating question:', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!userId) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p>You must be logged in to edit questions</p>
        </div>
        <Link href="/auth/login" className="text-primary hover:underline">
          Go to login
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading question...</div>
      </div>
    )
  }

  if (error && !question) {
    return (
      <div className="container mx-auto p-4">
        <Link href="/qna" className="flex items-center gap-2 mb-4 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Q&A
        </Link>
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Link href={`/qna/question/${questionId}`} className="flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to question
      </Link>

      <div className="bg-card rounded-lg border border-border p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Question</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded text-red-700 flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background hover:border-border/80 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Details
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide more details about your question..."
              className="w-full px-4 py-2 border border-border rounded-lg bg-background hover:border-border/80 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              rows={8}
              disabled={submitting}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Link
              href={`/qna/question/${questionId}`}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Question'}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> You can edit this question for 7 days from when you created it. After that, you won't be able to make changes.
          </p>
        </div>
      </div>
    </div>
  )
}
