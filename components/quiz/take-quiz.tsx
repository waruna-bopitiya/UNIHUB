'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface TakeQuizProps {
  quiz: {
    id: string
    title: string
    description: string
    duration: number
    questions: Question[]
  }
  onComplete: (score: number, answers: number[]) => void
  onCancel: () => void
}

export function TakeQuiz({ quiz, onComplete, onCancel }: TakeQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  )
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60) // in seconds
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !showResults) {
      handleSubmit()
    }
  }, [timeRemaining, showResults])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    let correctCount = 0
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++
      }
    })
    setScore(correctCount)
    setShowResults(true)
    onComplete(correctCount, answers as number[])
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getAnsweredCount = () => {
    return answers.filter((a) => a !== null).length
  }

  if (showResults) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            {score / quiz.questions.length >= 0.7 ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : (
              <XCircle className="w-10 h-10 text-yellow-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Quiz Completed!
          </h2>
          <p className="text-muted-foreground mb-4">
            You scored {score} out of {quiz.questions.length}
          </p>
          <div className="inline-block px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xl">
            {Math.round((score / quiz.questions.length) * 100)}%
          </div>
        </div>

        {/* Results breakdown */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Review Answers</h3>
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[index]
            const isCorrect = userAnswer === question.correctAnswer
            return (
              <div
                key={question.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-2">
                      Question {index + 1}: {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = userAnswer === optIndex
                        const isCorrectAnswer = question.correctAnswer === optIndex
                        return (
                          <div
                            key={optIndex}
                            className={`px-3 py-2 rounded text-sm ${
                              isCorrectAnswer
                                ? 'bg-green-500/10 text-green-500 font-medium'
                                : isUserAnswer
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            {option}
                            {isCorrectAnswer && ' ✓ Correct'}
                            {isUserAnswer && !isCorrectAnswer && ' ✗ Your answer'}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={onCancel}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Back to Quizzes
        </button>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">{quiz.title}</h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
            <Clock className="w-4 h-4 text-foreground" />
            <span className="font-mono font-bold text-foreground">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-muted-foreground">
              {getAnsweredCount()} answered
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                answers[currentQuestion] === index
                  ? 'border-primary bg-primary/10 text-foreground font-medium'
                  : 'border-border bg-background text-foreground hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuestion] === index
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}
                >
                  {answers[currentQuestion] === index && (
                    <div className="w-3 h-3 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
