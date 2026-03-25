"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import QuestionCard from "@/components/qna/QuestionCard"

const categoryMeta: Record<
  string,
  { label: string; description: string }
> = {
  programming: {
    label: "Programming",
    description: "Code help, debugging, and programming concepts.",
  },
  mathematics: {
    label: "Mathematics",
    description: "Calculus, algebra, and problem-solving questions.",
  },
  physics: {
    label: "Physics",
    description: "Mechanics, quantum, and all things physics.",
  },
  chemistry: {
    label: "Chemistry",
    description: "Organic, inorganic, and lab-related questions.",
  },
  biology: {
    label: "Biology",
    description: "Molecular biology, anatomy, and life sciences.",
  },
}

// Temporary mock data
const mockQuestions = [
  {
    id: "q1",
    title: "How to create API routes in Next.js? (Need peer help)",
    content: "I'm new to Next.js. Can someone explain how to create API routes?",
    author: { name: "Kamal Perera", avatar: "https://avatar.vercel.sh/kamal" },
    upvotes: 15,
    downvotes: 2,
    answers: 3,
    category: "programming",
    categoryName: "Programming",
    createdAt: new Date("2026-03-03T10:00:00"),
  },
  {
    id: "q2",
    title: "Calculus is hard! Exam tomorrow 🤯 - Need urgent help",
    content: "I don't understand calculus problems. Can someone explain limits?",
    author: { name: "Nimal Silva", avatar: "https://avatar.vercel.sh/nimal" },
    upvotes: 8,
    downvotes: 1,
    answers: 5,
    category: "mathematics",
    categoryName: "Mathematics",
    createdAt: new Date("2026-03-03T14:30:00"),
  },
  {
    id: "q3",
    title: "Quantum Physics basics - Anyone want to form a study group?",
    content: "Looking for peers interested in learning Quantum Physics together.",
    author: { name: "Sachini Jayawardena", avatar: "https://avatar.vercel.sh/sachini" },
    upvotes: 22,
    downvotes: 0,
    answers: 7,
    category: "physics",
    categoryName: "Physics",
    createdAt: new Date("2026-03-03T09:15:00"),
  },
]

export default function CategoryPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<any[]>([])
  
  const slug = params?.name as string
  const meta = categoryMeta[slug?.toLowerCase()] || {
    label: "Unknown category",
    description: "This category does not exist yet.",
  }

  useEffect(() => {
    // Simulate API call loading
    const timer = setTimeout(() => {
      const filtered = mockQuestions.filter((q) => q.category === slug?.toLowerCase())
      setQuestions(filtered)
      setLoading(false)
    }, 800) // 0.8 second delay to show loading state
    
    return () => clearTimeout(timer)
  }, [slug])

  // Loading state - shows skeleton while data is loading
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Back button skeleton */}
        <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
        
        {/* Header skeleton */}
        <div>
          <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
        </div>
        
        {/* Questions skeletons */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-lg bg-card p-4">
              <div className="flex gap-4">
                {/* Vote buttons skeleton */}
                <div className="flex flex-col items-center gap-1">
                  <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-6 bg-muted animate-pulse rounded"></div>
                  <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
                </div>
                
                {/* Content skeleton */}
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-full bg-muted animate-pulse rounded mb-1"></div>
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
                  
                  {/* Meta info skeleton */}
                  <div className="flex gap-4 mt-3">
                    <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                    <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Category not found
  if (!categoryMeta[slug?.toLowerCase()]) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <p className="text-muted-foreground mb-6">
          The category "{slug}" does not exist.
        </p>
        <Link 
          href="/qna"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all questions
        </Link>
      </div>
    )
  }

  // Actual content - shows after loading is complete
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <Link 
        href="/qna"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all questions
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          Q&A / {meta.label}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold">
          {meta.label} questions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.description}
        </p>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
            No questions in this category yet. Be the first to ask!
          </div>
        ) : (
          questions.map((q) => <QuestionCard key={q.id} question={q} />)
        )}
      </div>
    </div>
  )
}