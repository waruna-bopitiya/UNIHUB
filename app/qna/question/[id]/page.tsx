"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowBigUp, ArrowBigDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import AnswerCard from "@/components/qna/AnswerCard"

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [question, setQuestion] = useState<any | null>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [answerContent, setAnswerContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [answersLoading, setAnswersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  // Check if user is logged in
  useEffect(() => {
    const studentId = localStorage.getItem('studentId')
    const firstName = localStorage.getItem('firstName')
    
    if (studentId) {
      setIsLoggedIn(true)
      setUserId(studentId)
      setUserName(firstName)
    }
  }, [])

  // Fetch the question from the API
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/qna/questions`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }

        const allQuestions = await response.json()
        const foundQuestion = allQuestions.find((q: any) => q.id === params.id || q.id.toString() === params.id)
        
        if (foundQuestion) {
          setQuestion(foundQuestion)
          setError(null)
        } else {
          setQuestion(null)
          setError('Question not found')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load question'
        console.error('Error fetching question:', errorMessage)
        setQuestion(null)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestion()
  }, [params.id])

  // Fetch answers for the question
  useEffect(() => {
    const fetchAnswers = async () => {
      if (!params.id) return
      
      try {
        setAnswersLoading(true)
        const response = await fetch(`/api/qna/answers?questionId=${params.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch answers')
        }

        const data = await response.json()
        setAnswers(data)
      } catch (err) {
        console.error('Error fetching answers:', err)
        setAnswers([])
      } finally {
        setAnswersLoading(false)
      }
    }

    fetchAnswers()
  }, [params.id])

  const handleVote = (type: "up" | "down") => {
    // TODO: API call to vote
    console.log("Vote:", type)
  }

  const handlePostAnswer = async () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to post an answer")
      router.push("/auth/login")
      return
    }

    if (!answerContent.trim() || !question) {
      toast.error("Please enter your answer")
      return
    }

    if (answerContent.trim().length < 10) {
      toast.error("Answer must be at least 10 characters")
      return
    }

    setIsPosting(true)
    const loadingToast = toast.loading("Posting your answer...")
    
    try {
      const response = await fetch('/api/qna/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: params.id,
          userId: userId,
          content: answerContent.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post answer')
      }

      // Add new answer to the list
      setAnswers([data.answer, ...answers])
      setAnswerContent("")
      
      toast.dismiss(loadingToast)
      toast.success("Answer posted successfully! 🎉")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      console.error("Error posting answer:", errorMessage)
      toast.dismiss(loadingToast)
      toast.error(errorMessage || "Failed to post answer. Please try again.")
    } finally {
      setIsPosting(false)
    }
  }

  const handleAnswerVote = (answerId: string, value: number) => {
    if (!question) return
    
    // TODO: API call to vote on answer
    console.log("Vote on answer:", answerId, value)
    
    // Update local state
    setQuestion({
      ...question,
      answers: question.answers.map((a: any) => {
        if (a.id === answerId) {
          const newUpvotes = value === 1 ? a.upvotes + 1 : value === -1 ? a.upvotes - 1 : a.upvotes
          const newDownvotes = value === -1 ? a.downvotes + 1 : value === 1 ? a.downvotes - 1 : a.downvotes
          return { ...a, upvotes: newUpvotes, downvotes: newDownvotes }
        }
        return a
      })
    })
  }

  const netQuestionVotes = question ? question.upvotes - question.downvotes : 0

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto py-6 px-4">
        <Link 
          href="/qna"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to questions
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    )
  }

  if (!question || error) {
    return (
      <div className="container max-w-3xl mx-auto py-6 px-4">
        <Link 
          href="/qna"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to questions
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error || 'Question not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      {/* Back button */}
      <Link 
        href="/qna"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to questions
      </Link>

      {/* Question */}
      <div className="border border-border rounded-lg bg-card p-6">
        <div className="flex gap-4">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={() => handleVote("up")}
              className="hover:text-primary transition-colors"
            >
              <ArrowBigUp className="w-6 h-6" />
            </button>
            <span className="text-lg font-medium">
              {netQuestionVotes}
            </span>
            <button 
              onClick={() => handleVote("down")}
              className="hover:text-destructive transition-colors"
            >
              <ArrowBigDown className="w-6 h-6" />
            </button>
          </div>

          {/* Question content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{question.title}</h1>
            
            {/* Author info */}
            <div className="flex items-center gap-3 mt-4">
              <img 
                src={question.author.avatar}
                alt={question.author.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium">{question.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  asked {formatDistanceToNow(question.createdAt, { addSuffix: true })}
                </p>
              </div>
              <Link 
                href={`/qna/category/${question.category}`}
                className="bg-secondary px-2 py-1 rounded-md text-sm ml-auto"
              >
                {question.categoryName}
              </Link>
            </div>

            {/* Question content */}
            <div className="mt-6 prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{question.content}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Answers section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        {/* Answer form */}
        {isLoggedIn ? (
          <div className="mb-6 bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Signed in as <span className="font-medium text-foreground">{userName}</span>
            </p>
            <textarea
              placeholder="Write your answer..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setAnswerContent("")}
                className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePostAnswer}
                disabled={isPosting || !answerContent.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? "Posting..." : "Post Answer"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-secondary/30 rounded-lg p-4 text-center">
            <p className="text-muted-foreground mb-4">
              You must be signed in to post an answer
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Answers list */}
        <div className="space-y-4">
          {answersLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading answers...</p>
          ) : answers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No answers yet. Be the first to answer this question!
            </p>
          ) : (
            answers.map((answer) => (
              <AnswerCard 
                key={answer.id} 
                answer={answer} 
                questionId={question.id}
                onVote={handleAnswerVote}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}