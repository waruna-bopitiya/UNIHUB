'use client'

import { useState } from 'react'
import { Clock, Users, BookOpen, Play } from 'lucide-react'

interface QuizCardProps {
  id: string
  title: string
  description: string
  creator: string
  questions: number
  duration: number // in minutes
  participants: number
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  onTakeQuiz: (id: string) => void
}

export function QuizCard({
  id,
  title,
  description,
  creator,
  questions,
  duration,
  participants,
  category,
  difficulty,
  onTakeQuiz,
}: QuizCardProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/10 text-green-500'
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'Hard':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2">
            {title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Created by {creator}
        </p>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
          {category}
        </span>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor()}`}
        >
          {difficulty}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 py-4 border-y border-border mb-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Questions</p>
          <p className="font-bold text-foreground flex items-center justify-center gap-1">
            <BookOpen className="w-4 h-4" />
            {questions}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Duration</p>
          <p className="font-bold text-foreground flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" />
            {duration}m
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Participants</p>
          <p className="font-bold text-foreground flex items-center justify-center gap-1">
            <Users className="w-4 h-4" />
            {participants}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onTakeQuiz(id)}
        className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
      >
        <Play className="w-4 h-4" />
        Take Quiz
      </button>
    </div>
  )
}
