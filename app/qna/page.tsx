"use client"

import QuestionCard from "@/components/qna/QuestionCard"
import Link from "next/link"
import { PlusCircle, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"

interface Question {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  category: string
  categoryName: string
  upvotes: number
  downvotes: number
  answers: number
  createdAt: string | Date
}

export default function QnaPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/qna/questions')
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }

        const questions = await response.json()
        setAllQuestions(questions)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load questions'
        console.error('Error fetching questions:', errorMessage)
        setError(errorMessage)
        setAllQuestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  return (
    <div className="w-full py-6 px-4 md:px-6 lg:px-8">
      {/* Back button */}
      <Link 
        href="/?section=qna"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Questions & Answers</h1>
        <Link 
          href="/qna/ask"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Ask Question
        </Link>
      </div>

      {/* Categories quick filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Link 
          href="/qna"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          All
        </Link>
        <Link 
          href="/qna/category/it3030"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          IT3030
        </Link>
        <Link 
          href="/qna/category/it3020"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          IT3020
        </Link>
        <Link 
          href="/qna/category/it3010"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          IT3010
        </Link>
        <Link 
          href="/qna/category/it3040"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          IT3040
        </Link>
        <Link 
          href="/qna/category/it3050"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          IT3050
        </Link>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive">Error: {error}</p>
          </div>
        ) : allQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No questions found</p>
            <p className="text-sm text-muted-foreground">
              Be the first to ask a question!
            </p>
          </div>
        ) : (
          allQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))
        )}
      </div>
    </div>
  )
}