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
  it3050: {
    label: "IT3050 - Employability Skills Development - Seminar",
    description: "Questions about employability skills, career development, and professional seminars.",
  },
  it3040: {
    label: "IT3040 - IT Project Management",
    description: "Discussions on IT project management, planning, and execution.",
  },
  it3030: {
    label: "IT3030 - Programming Applications and Frameworks",
    description: "Help with programming applications, frameworks, and application development.",
  },
  it3020: {
    label: "IT3020 - Database Systems",
    description: "Questions about database design, management, and database systems.",
  },
  it3010: {
    label: "IT3010 - Network Design and Management",
    description: "Topics related to network design, configuration, and management.",
  },
}

// Temporary mock data
const mockQuestions = [
  {
    id: "q1",
    title: "Best practices for building scalable web applications?",
    content: "I'm starting a new project using modern frameworks. What are the best practices for building scalable applications?",
    author: { name: "Kamal Perera", avatar: "https://avatar.vercel.sh/kamal" },
    upvotes: 15,
    downvotes: 2,
    answers: 3,
    category: "it3030",
    categoryName: "IT3030 - Programming Applications and Frameworks",
    createdAt: new Date("2026-03-03T10:00:00"),
  },
  {
    id: "q2",
    title: "Database design for large-scale systems?",
    content: "What are the key considerations when designing a database for a large-scale system? SQL vs NoSQL?",
    author: { name: "Nimal Silva", avatar: "https://avatar.vercel.sh/nimal" },
    upvotes: 8,
    downvotes: 1,
    answers: 5,
    category: "it3020",
    categoryName: "IT3020 - Database Systems",
    createdAt: new Date("2026-03-03T14:30:00"),
  },
  {
    id: "q3",
    title: "Network architecture for distributed systems?",
    content: "How do I design a network that can handle distributed systems? Any best practices for network management?",
    author: { name: "Sachini Jayawardena", avatar: "https://avatar.vercel.sh/sachini" },
    upvotes: 22,
    downvotes: 0,
    answers: 7,
    category: "it3010",
    categoryName: "IT3010 - Network Design and Management",
    createdAt: new Date("2026-03-03T09:15:00"),
  },
  {
    id: "q4",
    title: "Best programming frameworks for our IT project?",
    content: "Which frameworks should we use for building scalable applications?",
    author: { name: "Dinesh Kumar", avatar: "https://avatar.vercel.sh/dinesh" },
    upvotes: 18,
    downvotes: 1,
    answers: 6,
    category: "it3030",
    categoryName: "IT3030 - Programming Applications and Frameworks",
    createdAt: new Date("2026-03-02T15:20:00"),
  },
  {
    id: "q5",
    title: "Managing timeline and scope in IT projects?",
    content: "Any tips on managing project timelines effectively? How to handle scope creep?",
    author: { name: "Anura Silva", avatar: "https://avatar.vercel.sh/anura" },
    upvotes: 12,
    downvotes: 0,
    answers: 4,
    category: "it3040",
    categoryName: "IT3040 - IT Project Management",
    createdAt: new Date("2026-03-01T12:45:00"),
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