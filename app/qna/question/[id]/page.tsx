"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ArrowBigUp, ArrowBigDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import AnswerCard from "@/components/qna/AnswerCard"

// Mock data (replace with real API call later)
const mockQuestion = {
  id: "1",
  title: "How to create API routes in Next.js?",
  content: "I'm new to Next.js. Can someone explain how to create API routes? I tried creating route.ts files in the app directory, but it's not working. Can someone give an example?",
  author: {
    id: "user1",
    name: "Kamal Perera",
    avatar: "https://avatar.vercel.sh/kamal"
  },
  upvotes: 15,
  downvotes: 2,
  category: "programming",
  categoryName: "Programming",
  createdAt: new Date("2026-03-01T10:00:00"),
  answers: [
    {
      id: "a1",
      content: "You can create app/api/hello/route.ts file. Then export a GET function. Here's an example:\n\n```ts\nexport async function GET() {\n  return Response.json({ message: 'Hello World' })\n}\n```",
      author: {
        id: "user4",
        name: "Chamara Wickramasinghe",
        avatar: "https://avatar.vercel.sh/chamara"
      },
      upvotes: 8,
      downvotes: 0,
      createdAt: new Date("2026-03-01T14:30:00"),
      comments: [
        {
          id: "c1",
          content: "Thank you! It worked for me.",
          author: {
            id: "user1",
            name: "Kamal Perera",
            avatar: "https://avatar.vercel.sh/kamal"
          },
          createdAt: new Date("2026-03-01T15:00:00")
        }
      ]
    },
    {
      id: "a2",
      content: "Another approach is using middleware. You can create a middleware.ts file at the root level and handle requests there.",
      author: {
        id: "user5",
        name: "Dinesh Gunawardhana",
        avatar: "https://avatar.vercel.sh/dinesh"
      },
      upvotes: 4,
      downvotes: 1,
      createdAt: new Date("2026-03-02T09:20:00"),
      comments: []
    }
  ]
}

export default function QuestionDetailPage() {
  const params = useParams()
  const [question, setQuestion] = useState(mockQuestion)
  const [answerContent, setAnswerContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  // TODO: API call to fetch question
  useEffect(() => {
    // fetch(`/api/qna/question/${params.id}`)
    //   .then(res => res.json())
    //   .then(data => setQuestion(data))
  }, [params.id])

  const handleVote = (type: "up" | "down") => {
    // TODO: API call to vote
    console.log("Vote:", type)
  }

  const handlePostAnswer = async () => {
    if (!answerContent.trim()) return
    
    setIsPosting(true)
    try {
      // TODO: API call to post answer
      // const response = await fetch('/api/qna/answers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     content: answerContent,
      //     questionId: params.id,
      //     userId: "current-user-id" // from auth
      //   })
      // })
      
      // Mock new answer
      const newAnswer = {
        id: Date.now().toString(),
        content: answerContent,
        author: {
          id: "current-user",
          name: "You",
          avatar: "https://avatar.vercel.sh/you"
        },
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date(),
        comments: []
      }
      
      setQuestion({
        ...question,
        answers: [newAnswer, ...question.answers]
      })
      setAnswerContent("")
    } catch (error) {
      console.error("Error posting answer:", error)
    } finally {
      setIsPosting(false)
    }
  }

  const handleAnswerVote = (answerId: string, value: number) => {
    // TODO: API call to vote on answer
    console.log("Vote on answer:", answerId, value)
    
    // Update local state
    setQuestion({
      ...question,
      answers: question.answers.map(a => {
        if (a.id === answerId) {
          const newUpvotes = value === 1 ? a.upvotes + 1 : value === -1 ? a.upvotes - 1 : a.upvotes
          const newDownvotes = value === -1 ? a.downvotes + 1 : value === 1 ? a.downvotes - 1 : a.downvotes
          return { ...a, upvotes: newUpvotes, downvotes: newDownvotes }
        }
        return a
      })
    })
  }

  const netQuestionVotes = question.upvotes - question.downvotes

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
          {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        {/* Answer form */}
        <div className="mb-6 bg-card border border-border rounded-lg p-4">
          <textarea
            placeholder="Write your answer..."
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePostAnswer}
              disabled={isPosting || !answerContent.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? "Posting..." : "Post Answer"}
            </button>
          </div>
        </div>

        {/* Answers list using AnswerCard component */}
        <div className="space-y-4">
          {question.answers.map((answer) => (
            <AnswerCard 
              key={answer.id} 
              answer={answer} 
              questionId={question.id}
              onVote={handleAnswerVote}
            />
          ))}
        </div>
      </div>
    </div>
  )
}