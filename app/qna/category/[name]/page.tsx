import QuestionCard from "@/components/qna/QuestionCard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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

interface CategoryPageProps {
  params: Promise<{ name: string }>  // Note: params is a Promise in Next.js 15
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Await the params (Next.js 15 requirement)
  const { name } = await params
  const slug = name.toLowerCase()
  
  const meta = categoryMeta[slug]

  // If category doesn't exist in meta
  if (!meta) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <p className="text-muted-foreground mb-6">
          The category "{name}" does not exist.
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

  const questions = mockQuestions.filter((q) => q.category === slug)

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