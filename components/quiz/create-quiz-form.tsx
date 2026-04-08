'use client'

import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface CreateQuizFormProps {
  onSubmit: (quizData: any) => void
  availableCourses: {
    year: number
    semester: number
    course: string
    category: string
  }[]
  currentUser?: {
    id: string
    firstName: string
    email: string
    year: number
    semester: number
  }
}

interface QuestionErrors {
  question?: string
  options?: string[]
  correctAnswer?: string
}

interface FormErrors {
  title?: string
  description?: string
  year?: string
  semester?: string
  course?: string
  duration?: string
  questions?: string
  questionErrors: Record<string, QuestionErrors>
}

export function CreateQuizForm({ onSubmit, availableCourses, currentUser }: CreateQuizFormProps) {
  // Calculate allowed years and semesters based on current user's year/semester
  const getAllowedYearsAndSemesters = () => {
    if (!currentUser) return { years: [], semesters: [] }

    const userYear = currentUser.year
    const userSemester = currentUser.semester
    const allowedYears: number[] = []
    
    // User can create quizzes for their own year and all lower years
    for (let i = 1; i <= userYear; i++) {
      allowedYears.push(i)
    }
    
    // For semesters: all semesters up to user's semester
    // Since there are only 2 semesters
    const allowedSemesters = userSemester === 1 ? [1] : [1, 2]
    
    return { years: allowedYears, semesters: allowedSemesters }
  }

  const { years: allowedYears, semesters: allowedSemesters } = getAllowedYearsAndSemesters()
  
  // Filter available courses to only show allowed years/semesters
  const filteredCourses = currentUser 
    ? availableCourses.filter(
        (c) => allowedYears.includes(c.year) && allowedSemesters.includes(c.semester)
      )
    : availableCourses

  const userPermissionMessage = currentUser 
    ? `You can create quizzes for: Year${allowedYears.length > 1 ? 's' : ''} ${allowedYears.join(', ')} and Semester${allowedSemesters.length > 1 ? 's' : ''} ${allowedSemesters.join(', ')}`
    : ''

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [semester, setSemester] = useState<number | ''>('')
  const [course, setCourse] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [duration, setDuration] = useState(30)
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState<FormErrors>({ questionErrors: {} })
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    },
  ])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    )
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nextErrors: FormErrors = { questionErrors: {} }

    if (!title.trim()) {
      nextErrors.title = 'Quiz title is required.'
    } else if (title.trim().length < 5) {
      nextErrors.title = 'Quiz title should be at least 5 characters.'
    }

    if (!description.trim()) {
      nextErrors.description = 'Description is required.'
    } else if (description.trim().length < 10) {
      nextErrors.description = 'Description should be at least 10 characters.'
    }

    if (year === '') {
      nextErrors.year = 'Please select a year.'
    }

    if (semester === '') {
      nextErrors.semester = 'Please select a semester.'
    }

    if (!course) {
      nextErrors.course = 'Please select a course.'
    }

    if (!Number.isInteger(duration) || duration < 5 || duration > 180) {
      nextErrors.duration = 'Duration must be a whole number between 5 and 180.'
    }

    if (questions.length === 0) {
      nextErrors.questions = 'At least one question is required.'
    }

    questions.forEach((question) => {
      const questionError: QuestionErrors = {}

      if (!question.question.trim()) {
        questionError.question = 'Question text is required.'
      }

      const optionErrors = question.options.map((option) =>
        option.trim() ? '' : 'Option is required.',
      )

      const normalizedOptions = question.options.map((option) => option.trim().toLowerCase())
      const duplicateExists = normalizedOptions.some(
        (option, index) => option && normalizedOptions.indexOf(option) !== index,
      )

      if (duplicateExists) {
        questionError.options = optionErrors.map((msg, idx) =>
          msg || (normalizedOptions[idx] ? 'Duplicate options are not allowed.' : ''),
        )
      } else if (optionErrors.some(Boolean)) {
        questionError.options = optionErrors
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length ||
        !question.options[question.correctAnswer]?.trim()
      ) {
        questionError.correctAnswer = 'Select a valid correct answer option.'
      }

      if (questionError.question || questionError.options || questionError.correctAnswer) {
        nextErrors.questionErrors[question.id] = questionError
      }
    })

    const hasErrors =
      !!nextErrors.title ||
      !!nextErrors.description ||
      !!nextErrors.year ||
      !!nextErrors.semester ||
      !!nextErrors.course ||
      !!nextErrors.duration ||
      !!nextErrors.questions ||
      Object.keys(nextErrors.questionErrors).length > 0

    if (hasErrors) {
      setErrors(nextErrors)
      setFormError('Please fix the highlighted fields before creating the quiz.')
      return
    }

    setErrors({ questionErrors: {} })
    setFormError('')

    const selectedCourse = availableCourses.find(
      (item) => item.year === year && item.semester === semester && item.course === course,
    )

    const quizData = {
      title,
      description,
      year: typeof year === 'number' ? year : parseInt(year as string),
      semester: typeof semester === 'number' ? semester : parseInt(semester as string),
      course,
      category: selectedCourse?.category || 'Computer Science',
      difficulty,
      duration,
      questions,
      creator: currentUser?.firstName || 'Student',
      participants: 0,
    }
    
    console.log('📝 Quiz Data to submit:', {
      title: quizData.title,
      year: quizData.year,
      semester: quizData.semester,
      course: quizData.course,
      category: quizData.category,
      difficulty: quizData.difficulty,
      questionsCount: quizData.questions.length,
    })

    try {
      await onSubmit(quizData)
      // Reset form only after successful submission
      setTitle('')
      setDescription('')
      setYear('')
      setSemester('')
      setCourse('')
      setDifficulty('Medium')
      setDuration(30)
      setErrors({ questionErrors: {} })
      setFormError('')
      setQuestions([
        {
          id: '1',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
        },
      ])
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setFormError('Error creating quiz. Please try again.')
    }
  }

  // Calculate options for year/semester/course dropdowns
  const yearOptions = allowedYears

  // For semester options: depends on which year is selected
  // - For years below user's year: show both semesters (1 & 2)
  // - For user's own year: show semesters up to their current semester
  const semesterOptions = year === '' 
    ? [] 
    : currentUser && year < currentUser.year
      ? [1, 2]  // Years below current year: all semesters
      : allowedSemesters  // Current year: only up to user's semester

  const courseOptions =
    year === '' || semester === ''
      ? []
      : Array.from(
          new Set(
            filteredCourses
              .filter((item) => item.year === year && item.semester === semester)
              .map((item) => item.course),
          ),
        ).sort((a, b) => a.localeCompare(b))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      {currentUser && userPermissionMessage && (
        <div className="rounded-lg border border-blue-500/40 bg-blue-500/20 px-4 py-3 text-sm text-blue-400">
          <strong>Permission Level:</strong> {userPermissionMessage}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Basic Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quiz description"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              required
            />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Year *
              </label>
              <select
                value={year}
                onChange={(e) => {
                  const nextValue = e.target.value
                  setYear(nextValue === '' ? '' : Number(nextValue))
                  setSemester('')
                  setCourse('')
                }}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select year</option>
                {yearOptions.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    Year {optionYear}
                  </option>
                ))}
              </select>
              {errors.year && <p className="mt-1 text-xs text-destructive">{errors.year}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => {
                  const nextValue = e.target.value
                  setSemester(nextValue === '' ? '' : Number(nextValue))
                  setCourse('')
                }}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={year === ''}
              >
                <option value="">Select semester</option>
                {semesterOptions.map((optionSemester) => (
                  <option key={optionSemester} value={optionSemester}>
                    Semester {optionSemester}
                  </option>
                ))}
              </select>
              {errors.semester && <p className="mt-1 text-xs text-destructive">{errors.semester}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Course *
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={year === '' || semester === ''}
              >
                <option value="">Select course</option>
                {courseOptions.map((optionCourse) => (
                  <option key={optionCourse} value={optionCourse}>
                    {optionCourse}
                  </option>
                ))}
              </select>
              {errors.course && <p className="mt-1 text-xs text-destructive">{errors.course}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Difficulty *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="5"
                max="180"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {errors.duration && <p className="mt-1 text-xs text-destructive">{errors.duration}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        <div className="space-y-6">
          {errors.questions && <p className="text-sm text-destructive">{errors.questions}</p>}
          {questions.map((question, qIndex) => (
            <div key={question.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-sm font-medium text-foreground">
                  Question {qIndex + 1}
                </h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Question Text *
                  </label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, 'question', e.target.value)
                    }
                    placeholder="Enter your question"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  {errors.questionErrors[question.id]?.question && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.questionErrors[question.id]?.question}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Options (Select the correct answer)
                  </label>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() =>
                            updateQuestion(question.id, 'correctAnswer', optionIndex)
                          }
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            updateOption(question.id, optionIndex, e.target.value)
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                        {errors.questionErrors[question.id]?.options?.[optionIndex] && (
                          <p className="text-xs text-destructive min-w-[160px]">
                            {errors.questionErrors[question.id]?.options?.[optionIndex]}
                          </p>
                        )}
                      </div>
                    ))}
                    {errors.questionErrors[question.id]?.correctAnswer && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.questionErrors[question.id]?.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <Save className="w-5 h-5" />
          Create Quiz
        </button>
      </div>
    </form>
  )
}
