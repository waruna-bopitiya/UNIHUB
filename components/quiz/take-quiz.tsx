'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, ArrowRight, Star } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface DetailedResult {
  questionId: string
  questionText: string
  userAnswer: number
  correctAnswer: number
  options: string[]
  isCorrect: boolean
}

interface TakeQuizProps {
  quiz: {
    id: string
    title: string
    description: string
    duration: number
    questions: Question[]
  }
  participantScores: {
    name: string
    score: number
    totalQuestions: number
  }[]
  quizComments: {
    name: string
    message: string
    date: string
  }[]
  quizRatings: {
    name: string
    rating: number
    date: string
  }[]
  currentUser?: {
    id: string
    firstName: string
    email: string
  }
  detailedResults?: DetailedResult[]
  onAddComment: (name: string, message: string) => void
  onAddRating: (name: string, rating: number) => void
  onComplete: (score: number, answers: number[]) => void
  onCancel: () => void
}

export function TakeQuiz({
  quiz,
  participantScores,
  quizComments,
  quizRatings,
  currentUser,
  detailedResults,
  onAddComment,
  onAddRating,
  onComplete,
  onCancel,
}: TakeQuizProps) {
  // Guard: Check if quiz has questions
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">No Questions Available</h3>
        <p className="text-muted-foreground mb-6">
          This quiz doesn't have any questions yet. Please try another quiz.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Back to Quizzes
        </button>
      </div>
    )
  }

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  )
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60) // in seconds
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [showPreviousScores, setShowPreviousScores] = useState(false)
  const [commentMessage, setCommentMessage] = useState('')
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [submitError, setSubmitError] = useState('')

  const previousParticipantScores = [...participantScores]
    .filter((entry) => entry.name !== 'You')
    .sort((a, b) => b.score / b.totalQuestions - a.score / a.totalQuestions)

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
    // Clear error when user answers a question
    if (submitError) {
      setSubmitError('')
    }
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
    // Check if all questions are answered
    const unansweredQuestions = answers.filter((a) => a === null).length
    if (unansweredQuestions > 0) {
      setSubmitError(`Please answer all questions. You have ${unansweredQuestions} unanswered question${unansweredQuestions > 1 ? 's' : ''}.`)
      return
    }

    let correctCount = 0
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index]
      const correctAnswer = typeof question.correctAnswer === 'string' ? parseInt(question.correctAnswer) : question.correctAnswer
      if (userAnswer === correctAnswer) {
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

  const handleAddCommentClick = () => {
    const trimmedMessage = commentMessage.trim()

    if (!trimmedMessage || !currentUser) {
      return
    }

    onAddComment(currentUser.firstName, trimmedMessage)
    setCommentMessage('')
  }

  const handleAddRatingClick = () => {
    if (!currentUser || selectedRating < 1 || selectedRating > 5) {
      return
    }

    onAddRating(currentUser.firstName, selectedRating)
    setSelectedRating(0)
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

        {/* Results breakdown - Show detailed answer review */}
        {detailedResults && detailedResults.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Review Your Answers</h3>
          {detailedResults.map((result, index) => {
            console.log(`Displaying result ${index}:`, {
              isCorrect: result.isCorrect,
              userAnswer: result.userAnswer,
              correctAnswer: result.correctAnswer,
              optionsType: typeof result.options,
              optionsLength: Array.isArray(result.options) ? result.options.length : 'not-array',
            })
            return (
            <div
              key={result.questionId}
              className="border border-border rounded-lg p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                {result.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-2">
                    Question {index + 1}: {result.questionText}
                  </p>
                  <div className="space-y-2">
                    {Array.isArray(result.options) && result.options.map((option, optIndex) => {
                      const isUserAnswer = result.userAnswer === optIndex
                      const isCorrectAnswer = result.correctAnswer === optIndex
                      return (
                        <div
                          key={optIndex}
                          className={`px-3 py-2 rounded text-sm ${
                            isCorrectAnswer
                              ? 'bg-green-500/10 text-green-700 dark:text-green-400 font-medium border border-green-500/30'
                              : isUserAnswer
                              ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {option}
                          {isCorrectAnswer && ' ✓'}
                          {isUserAnswer && !isCorrectAnswer && ' ✗'}
                        </div>
                      )
                    })}
                    {!Array.isArray(result.options) && (
                      <p className="text-red-500 text-sm">Error: Options are not in array format</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              {detailedResults ? 'No detailed results available' : 'Loading detailed results...'}
            </p>
          </div>
        )}

        <div className="border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-foreground">Previous Takers Scores</h3>
            <button
              onClick={() => setShowPreviousScores((prev) => !prev)}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground hover:bg-secondary transition-colors"
            >
              {showPreviousScores ? 'Hide Scores' : 'Show Scores'}
            </button>
          </div>

          {!showPreviousScores ? (
            <p className="text-sm text-muted-foreground">
              Click "Show Scores" to view how previous students scored.
            </p>
          ) : previousParticipantScores.length === 0 ? (
            <p className="text-sm text-muted-foreground">No previous scores yet.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {previousParticipantScores.map((entry, index) => {
                const percentage = Math.round((entry.score / entry.totalQuestions) * 100)
                return (
                  <div
                    key={`${entry.name}-${entry.score}-${index}`}
                    className="border border-border rounded-md p-3"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-medium text-foreground">{entry.name}</span>
                      <span className="text-sm font-semibold text-foreground">{percentage}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage >= 75
                            ? 'bg-green-500'
                            : percentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="border border-border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Comments</h3>
          {currentUser && (
            <p className="text-sm text-muted-foreground mb-3">Commenting as: <strong>{currentUser.firstName}</strong></p>
          )}

          <div className="space-y-3 mb-4">
            <textarea
              value={commentMessage}
              onChange={(e) => setCommentMessage(e.target.value)}
              placeholder="Leave a comment about this quiz"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddCommentClick}
                disabled={!currentUser}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </div>

          {quizComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {quizComments.map((comment, index) => (
                <div key={`${comment.name}-${comment.date}-${index}`} className="border border-border rounded-md p-3">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-medium text-foreground">{comment.name}</p>
                    <p className="text-xs text-muted-foreground">{comment.date}</p>
                  </div>
                  <p className="text-sm text-foreground">{comment.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Ratings</h3>
          {currentUser && (
            <p className="text-sm text-muted-foreground mb-3">Rating as: <strong>{currentUser.firstName}</strong></p>
          )}

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setSelectedRating(value)}
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  className={`p-2 rounded-md border transition-colors ${
                    value <= selectedRating
                      ? 'bg-purple-500/15 text-purple-500 border-purple-500'
                      : 'bg-background text-muted-foreground border-border hover:border-purple-400'
                  }`}
                >
                  <Star className="w-5 h-5" fill="currentColor" />
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddRatingClick}
                disabled={!currentUser}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Rating
              </button>
            </div>
          </div>

          {quizRatings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ratings yet.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Average rating:{' '}
                <span className="font-medium text-foreground">
                  {(
                    quizRatings.reduce((sum, item) => sum + item.rating, 0) / quizRatings.length
                  ).toFixed(1)}
                  /5
                </span>
              </p>
              {quizRatings.map((rating, index) => (
                <div
                  key={`${rating.name}-${rating.date}-${index}`}
                  className="border border-border rounded-md p-3"
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-medium text-foreground">{rating.name}</p>
                    <p className="text-xs text-muted-foreground">{rating.date}</p>
                  </div>
                  <div className="flex items-center gap-1" aria-label={`Rating ${rating.rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`w-4 h-4 ${
                          value <= rating.rating ? 'text-purple-500' : 'text-muted-foreground/40'
                        }`}
                        fill={value <= rating.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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

  const sortedParticipantScores = [...participantScores].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-6">
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

        {/* Question Navigator Circles */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Questions</p>
          <div className="flex flex-wrap gap-3">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  currentQuestion === index
                    ? 'bg-primary border-2 border-primary text-primary-foreground'
                    : 'bg-secondary border-2 border-border text-muted-foreground hover:border-primary'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = answers[currentQuestion] === index
            const hasAnswered = answers[currentQuestion] !== null
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={hasAnswered}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground font-medium'
                    : 'border-border bg-background text-foreground hover:border-primary/50'
                } ${hasAnswered ? 'cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border'
                      }`}
                    >
                      {isSelected && <div className="w-3 h-3 rounded-full bg-primary-foreground" />}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              </button>
            )
          })}
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

      {/* Submit Error Message */}
      {submitError && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm font-medium">
          {submitError}
        </div>
      )}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-3">Quiz Summary</h4>
        {sortedParticipantScores.length === 0 ? (
          <p className="text-sm text-muted-foreground">No results yet for this quiz.</p>
        ) : (
          <div className="space-y-2">
            {sortedParticipantScores.map((entry, index) => (
              <div
                key={`${entry.name}-${index}`}
                className="flex items-center justify-between text-sm border border-border rounded-md px-3 py-2"
              >
                <span className="font-medium text-foreground">{entry.name}</span>
                <span className="text-muted-foreground">
                  {entry.score}/{entry.totalQuestions}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
