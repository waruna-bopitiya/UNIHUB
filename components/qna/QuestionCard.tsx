"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle } from "lucide-react"
import VoteButtons from "./VoteButtons"

interface QuestionCardProps {
  question: {
    id: string
    title: string
    content: string
    author: {
      name: string
      avatar: string
    }
    upvotes: number
    downvotes: number
    answers: number
    category: string
    categoryName: string
    createdAt: Date
  }
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const handleVote = (type: "up" | "down") => {
    // TODO: API call to vote
    console.log("Vote on question:", question.id, type)
  }

  return (
    <div className="border border-border rounded-lg bg-card p-4 hover:border-primary/20 transition-colors">
      <div className="flex gap-4">
        {/* Vote buttons - using reusable component */}
        <VoteButtons
          upvotes={question.upvotes}
          downvotes={question.downvotes}
          onVote={handleVote}
          size="md"
          orientation="vertical"
        />

        {/* Question content */}
        <div className="flex-1">
          <Link href={`/qna/question/${question.id}`}>
            <h2 className="text-lg font-semibold hover:text-primary transition-colors">
              {question.title}
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {question.content}
          </p>
          
          {/* Meta info */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <img 
                src={question.author.avatar} 
                alt={question.author.name}
                className="w-5 h-5 rounded-full"
              />
              <span>{question.author.name}</span>
            </div>
            <span>•</span>
            <span>{formatDistanceToNow(question.createdAt, { addSuffix: true })}</span>
            <span>•</span>
            <Link 
              href={`/qna/category/${question.category}`}
              className="bg-secondary px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors"
            >
              {question.categoryName}
            </Link>
            
            {/* Answers count - Now clickable! */}
            <Link 
              href={`/qna/question/${question.id}`}
              className="flex items-center gap-1 ml-auto hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{question.answers} {question.answers === 1 ? "answer" : "answers"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}