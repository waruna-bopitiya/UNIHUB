import QuestionCard from "@/components/qna/QuestionCard"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Step 1: Mock data array එක (මේකත් මෙතනම)
const mockQuestions = [
  {
    id: "1",
    title: "Next.js වලින් API routes හදන්නේ කොහොමද?",
    content: "මම Next.js අලුතෙන් පටන් ගත්තා. API routes හදන හැටි කියලා දෙන්නකෝ.",
    author: {
      id: "user1",
      name: "කමල් පෙරේරා",
      avatar: "https://avatar.vercel.sh/kamal"
    },
    upvotes: 15,
    downvotes: 2,
    answers: 3,
    category: "programming",
    categoryName: "Programming",
    createdAt: new Date("2026-03-01T10:00:00")
  },
  {
    id: "2",
    title: "Calculus අමාරුයි, පහසුවෙන් ඉගෙනගන්න විදිහක්?",
    content: "Calculus ප්‍රශ්න තේරෙන්නේ නැහැ. කවුරුහරි උදව් කරන්න පුළුවන්ද?",
    author: {
      id: "user2",
      name: "නිමල් සිල්වා",
      avatar: "https://avatar.vercel.sh/nimal"
    },
    upvotes: 8,
    downvotes: 1,
    answers: 5,
    category: "mathematics",
    categoryName: "Mathematics",
    createdAt: new Date("2026-03-02T14:30:00")
  },
  {
    id: "3",
    title: "Quantum Physics basics books?",
    content: "Quantum Physics පටන් ගන්න පොත් කීපයක් suggest කරන්න පුළුවන්ද?",
    author: {
      id: "user3",
      name: "සචිනි ජයවර්ධන",
      avatar: "https://avatar.vercel.sh/sachini"
    },
    upvotes: 22,
    downvotes: 0,
    answers: 7,
    category: "physics",
    categoryName: "Physics",
    createdAt: new Date("2026-03-03T09:15:00")
  }
]

// Step 3: Main page component එක
export default function QnaPage() {
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
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
          href="/qna/category/programming"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          Programming
        </Link>
        <Link 
          href="/qna/category/mathematics"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          Mathematics
        </Link>
        <Link 
          href="/qna/category/physics"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          Physics
        </Link>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {mockQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  )
}