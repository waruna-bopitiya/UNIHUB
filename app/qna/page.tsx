"use client"

import QuestionCard from "@/components/qna/QuestionCard"
import Link from "next/link"
import { PlusCircle, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"

// Step 1: Mock data array එක (මේකත් මෙතනම)
const mockQuestions = [
  {
    id: "1",
    title: "Best practices for building scalable web applications?",
    content: "I'm starting a new project using modern frameworks. What are the best practices for building scalable applications?",
    author: {
      id: "user1",
      name: "කමල් පෙරේරා",
      avatar: "https://avatar.vercel.sh/kamal"
    },
    upvotes: 15,
    downvotes: 2,
    answers: 3,
    category: "it3030",
    categoryName: "IT3030 - Programming Applications and Frameworks",
    createdAt: new Date("2026-03-01T10:00:00")
  },
  {
    id: "2",
    title: "Database design for large-scale systems?",
    content: "What are the key considerations when designing a database for a large-scale system? SQL vs NoSQL?",
    author: {
      id: "user2",
      name: "නිමල් සිල්වා",
      avatar: "https://avatar.vercel.sh/nimal"
    },
    upvotes: 8,
    downvotes: 1,
    answers: 5,
    category: "it3020",
    categoryName: "IT3020 - Database Systems",
    createdAt: new Date("2026-03-02T14:30:00")
  },
  {
    id: "3",
    title: "Network architecture for distributed systems?",
    content: "How do I design a network that can handle distributed systems? Any best practices for network management?",
    author: {
      id: "user3",
      name: "සචිනි ජයවර්ධන",
      avatar: "https://avatar.vercel.sh/sachini"
    },
    upvotes: 22,
    downvotes: 0,
    answers: 7,
    category: "it3010",
    categoryName: "IT3010 - Network Design and Management",
    createdAt: new Date("2026-03-03T09:15:00")
  },
  {
    id: "4",
    title: "How to manage IT project timelines effectively?",
    content: "Any tips on managing project timelines and scope in IT projects? How to handle scope creep?",
    author: {
      id: "user4",
      name: "Janaka Wijesinghe",
      avatar: "https://avatar.vercel.sh/janaka"
    },
    upvotes: 32,
    downvotes: 1,
    answers: 8,
    category: "it3040",
    categoryName: "IT3040 - IT Project Management",
    createdAt: new Date("2026-03-02T16:45:00")
  },
  {
    id: "5",
    title: "Key employability skills for IT professionals?",
    content: "What are the most important employability skills I should focus on developing for my IT career?",
    author: {
      id: "user5",
      name: "Ravindra Karunarathne",
      avatar: "https://avatar.vercel.sh/ravindra"
    },
    upvotes: 11,
    downvotes: 0,
    answers: 4,
    category: "it3050",
    categoryName: "IT3050 - Employability Skills Development - Seminar",
    createdAt: new Date("2026-03-02T11:20:00")
  }
]

// Step 3: Main page component එක
export default function QnaPage() {
  const [allQuestions, setAllQuestions] = useState(mockQuestions)

  useEffect(() => {
    // Load saved questions from localStorage
    try {
      const savedQuestions = JSON.parse(localStorage.getItem("qna_questions") || "[]")
      // Combine mock questions with saved questions
      const combined = [...mockQuestions, ...savedQuestions]
      
      // Normalize answers count - handle both array and number formats
      const normalized = combined.map((q: any) => ({
        ...q,
        answers: Array.isArray(q.answers) ? q.answers.length : q.answers
      }))
      
      setAllQuestions(normalized)
    } catch (error) {
      console.error("Error loading questions:", error)
      setAllQuestions(mockQuestions)
    }
  }, [])

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
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
        {allQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  )
}