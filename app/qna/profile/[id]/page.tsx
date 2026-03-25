"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Award, MessageCircle, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import QuestionCard from "@/components/qna/QuestionCard"
import AnswerCard from "@/components/qna/AnswerCard"

// Mock user data
const mockUser = {
  id: "user1",
  name: "Kamal Perera",
  email: "kamal@university.edu",
  avatar: "https://avatar.vercel.sh/kamal",
  bio: "Computer Science student passionate about web development and AI. Looking to learn and help others!",
  memberSince: new Date("2025-01-15"),
  location: "Colombo, Sri Lanka",
  course: "Computer Science",
  year: "3rd Year",
  stats: {
    questions: 12,
    answers: 34,
    upvotesReceived: 156,
    helpfulAnswers: 8
  },
  badges: ["Top Contributor", "Quick Responder", "Helpful"]
}

// Mock user's questions
const userQuestions = [
  {
    id: "q1",
    title: "How to create API routes in Next.js?",
    content: "I'm new to Next.js. Can someone explain how to create API routes?",
    author: {
      name: "Kamal Perera",
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
    id: "q2",
    title: "Best resources to learn React?",
    content: "I want to learn React from scratch. Any recommendations for courses or books?",
    author: {
      name: "Kamal Perera",
      avatar: "https://avatar.vercel.sh/kamal"
    },
    upvotes: 8,
    downvotes: 0,
    answers: 5,
    category: "programming",
    categoryName: "Programming",
    createdAt: new Date("2026-03-05T14:30:00")
  }
]

// Mock user's answers
const userAnswers = [
  {
    id: "a1",
    content: "You can create app/api/hello/route.ts file. Then export a GET function. Here's an example:\n\n```ts\nexport async function GET() {\n  return Response.json({ message: 'Hello World' })\n}\n```",
    author: {
      id: "user1",
      name: "Kamal Perera",
      avatar: "https://avatar.vercel.sh/kamal"
    },
    upvotes: 8,
    downvotes: 0,
    createdAt: new Date("2026-03-02T14:30:00"),
    questionTitle: "How to create API routes in Next.js?",
    questionId: "q1",
    comments: []
  },
  {
    id: "a2",
    content: "I highly recommend the official React documentation. It's the best place to start. After that, check out 'React - The Complete Guide' on Udemy.",
    author: {
      id: "user1",
      name: "Kamal Perera",
      avatar: "https://avatar.vercel.sh/kamal"
    },
    upvotes: 12,
    downvotes: 0,
    createdAt: new Date("2026-03-06T09:20:00"),
    questionTitle: "Best resources to learn React?",
    questionId: "q2",
    comments: []
  }
]

export default function ProfilePage() {
  const params = useParams()
  const [user, setUser] = useState(mockUser)
  const [questions, setQuestions] = useState(userQuestions)
  const [answers, setAnswers] = useState(userAnswers)
  const [activeTab, setActiveTab] = useState<"questions" | "answers" | "about">("questions")
  const [loading, setLoading] = useState(false)

  // TODO: Fetch user data from API
  useEffect(() => {
    // fetch(`/api/qna/user/${params.id}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setUser(data.user)
    //     setQuestions(data.questions)
    //     setAnswers(data.answers)
    //   })
  }, [params.id])

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-6 px-4 text-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4">
      {/* Back button */}
      <Link 
        href="/qna"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to questions
      </Link>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/20"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
            
            {user.bio && (
              <p className="mt-3 text-sm">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {user.course && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{user.course}, {user.year}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Member since {user.memberSince.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
            </div>

            {/* Badges */}
            {user.badges && user.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {user.badges.map((badge, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    🏆 {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-3 min-w-[200px]">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">{user.stats.questions}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">{user.stats.answers}</div>
                <div className="text-xs text-muted-foreground">Answers</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">{user.stats.upvotesReceived}</div>
                <div className="text-xs text-muted-foreground">Upvotes</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">{user.stats.helpfulAnswers}</div>
                <div className="text-xs text-muted-foreground">Helpful</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-2 px-1 transition-colors ${
              activeTab === "questions" 
                ? "border-b-2 border-primary text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Questions ({user.stats.questions})
          </button>
          <button
            onClick={() => setActiveTab("answers")}
            className={`pb-2 px-1 transition-colors ${
              activeTab === "answers" 
                ? "border-b-2 border-primary text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Answers ({user.stats.answers})
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-2 px-1 transition-colors ${
              activeTab === "about" 
                ? "border-b-2 border-primary text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            About
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No questions asked yet</p>
              <Link 
                href="/qna/ask"
                className="inline-block mt-2 text-primary hover:underline text-sm"
              >
                Ask a question →
              </Link>
            </div>
          ) : (
            questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          )}
        </div>
      )}

      {activeTab === "answers" && (
        <div className="space-y-4">
          {answers.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No answers given yet</p>
            </div>
          ) : (
            answers.map((answer) => (
              <div key={answer.id} className="border border-border rounded-lg bg-card p-4">
                <div className="flex items-start gap-3">
                  {/* Vote count */}
                  <div className="flex flex-col items-center min-w-[40px]">
                    <span className="text-sm font-medium">{answer.upvotes - answer.downvotes}</span>
                    <span className="text-xs text-muted-foreground">votes</span>
                  </div>
                  
                  {/* Answer content */}
                  <div className="flex-1">
                    <Link 
                      href={`/qna/question/${answer.questionId}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {answer.questionTitle}
                    </Link>
                    <div className="prose prose-sm max-w-none mt-2">
                      <p className="text-sm whitespace-pre-wrap line-clamp-2">{answer.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      <span>{answer.comments?.length || 0} comments</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(answer.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "about" && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Bio</h3>
            <p className="text-sm text-muted-foreground">
              {user.bio || "No bio provided yet."}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Course Information</h3>
            <p className="text-sm text-muted-foreground">
              {user.course || "Not specified"} - {user.year || "Year not specified"}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Location</h3>
            <p className="text-sm text-muted-foreground">
              {user.location || "Not specified"}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Member Since</h3>
            <p className="text-sm text-muted-foreground">
              {user.memberSince.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}