
'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { QuizCard } from '@/components/quiz/quiz-card'
import { CreateQuizForm } from '@/components/quiz/create-quiz-form'
import { TakeQuiz } from '@/components/quiz/take-quiz'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useState, useEffect } from 'react'
import { BookOpen, Download, Loader2, Search, Star, Trophy } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { jsPDF } from 'jspdf'

interface Quiz {
  id: string
  title: string
  description: string
  creator: string
  questions: any[]
  duration: number
  participants: number
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  year: number
  semester: number
  course: string
  takers?: number
  attempts?: number
  averageScore?: number
}

interface SubjectCatalogRow {
  year: number
  semester: number
  code: string
  name: string
}

interface SubjectParticipant {
  name: string
  attempts: number
  averageScore: number
}

interface SubjectScoreRow {
  year: number
  semester: number
  code: string
  name: string
  takers: number
  attempts: number
  averageScore: number
  participants: SubjectParticipant[]
}

interface QuizResult {
  quizId: string
  quizTitle: string
  participantName: string
  score: number
  totalQuestions: number
  dateTaken: string
}

interface ParticipantScoreSummary {
  name: string
  score: number
  totalQuestions: number
}

interface QuizComment {
  name: string
  message: string
  date: string
}

interface QuizRating {
  name: string
  rating: number
  date: string
}

interface CourseData {
  year: number
  semester: number
  code: string
  name: string
}

const studentNames = [
  'Nimal Perera',
  'Kasuni Fernando',
  'Ishara Silva',
  'Tharindu Jayasuriya',
  'Sajee Wickramasinghe',
  'Malithi Gunawardena',
  'Tharushi Madushani',
  'Dilan Weerasinghe',
  'Ruvin Senanayake',
  'Ayesha Karunaratne',
  'Chamodi Peris',
  'Gihan Abeysekera',
  'Dinuka Sandaruwan',
  'Piumi Rathnayake',
  'Kavindu Lakshan',
  'Hasini Bandara',
  'Nethmi Upeksha',
  'Sahan Rajapaksha',
  'Madhavi Ekanayake',
  'Naveen Wijesinghe',
]

const scoreChartConfig = {
  participants: {
    label: 'Participants',
    color: 'var(--chart-1)',
  },
  avgScore: {
    label: 'Average Score %',
    color: 'var(--chart-2)',
  },
  attempts: {
    label: 'Attempts',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

export default function QuizPage() {
  // Current user state
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isNotLoggedIn, setIsNotLoggedIn] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)

  // Quiz page state
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'results' | 'score'>('browse')
  const [scoreView, setScoreView] = useState<'courseByYear' | 'quizTakers'>('courseByYear')
  const [selectedScoreYear, setSelectedScoreYear] = useState<number | 'all'>('all')
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [availableCourses, setAvailableCourses] = useState<Array<{ year: number; semester: number; code: string; course: string; category: string }>>([])
  const [subjectCatalogRows, setSubjectCatalogRows] = useState<SubjectCatalogRow[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [quizComments, setQuizComments] = useState<Record<string, QuizComment[]>>({})
  const [quizRatings, setQuizRatings] = useState<Record<string, QuizRating[]>>({})
  const [detailedResults, setDetailedResults] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [browseCourseSearch, setBrowseCourseSearch] = useState('')
  const [browseQuizSearch, setBrowseQuizSearch] = useState('')
  const [resultsSearch, setResultsSearch] = useState('')
  const [scoreSearch, setScoreSearch] = useState('')
  const [hoveredCourseKey, setHoveredCourseKey] = useState<string | null>(null)
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false)
  const [loadingBrowseData, setLoadingBrowseData] = useState(true)
  const [loadingResultsData, setLoadingResultsData] = useState(false)
  const [loadingQuizPreview, setLoadingQuizPreview] = useState(false)

  // Score data from API
  const [scoreDataFromApi, setScoreDataFromApi] = useState<any>(null)
  const [loadingScoreData, setLoadingScoreData] = useState(false)

  // Fetch current user info on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const studentId = localStorage.getItem('studentId')
        
        if (!studentId) {
          console.log('⚠️ No student ID found - user not logged in')
          setIsNotLoggedIn(true)
          setLoadingUser(false)
          return
        }

        console.log('👤 Fetching user info for:', studentId)
        const response = await fetch(`/api/user/current?id=${studentId}`)
        const result = await response.json()

        if (result.status === 'success') {
          console.log('✅ Current user loaded:', result.data)
          setCurrentUser(result.data)
          setIsNotLoggedIn(false)
        } else {
          console.error('❌ Failed to fetch user:', result.message)
          setIsNotLoggedIn(true)
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error)
        setIsNotLoggedIn(true)
      } finally {
        setLoadingUser(false)
      }
    }

    fetchCurrentUser()
  }, [])

  // Function to fetch and merge statistics with quiz data
  const fetchAndMergeStatistics = async (quizzes: Quiz[]) => {
    try {
      console.log('Fetching quiz statistics...')
      
      const response = await fetch('/api/quiz/scores')
      const result = await response.json()
      
      if (result.status === 'success' && result.data) {
        console.log('Statistics fetched successfully')
        
        // Merge statistics with quiz data
        const quizzesWithStats = quizzes.map(quiz => {
          const stats = result.data.courseByYear?.find((stat: any) => 
            stat.year === quiz.year && stat.semester === quiz.semester
          )
          const courseStats = stats?.chartData?.find((course: any) => course.course === quiz.course)
          
          return {
            ...quiz,
            takers: courseStats?.participants || 0,
            attempts: courseStats?.attempts || 0,
            averageScore: courseStats?.avgScore || 0,
          }
        })
        
        setQuizzes(quizzesWithStats)
        console.log('Statistics merged with quiz data')
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      // Still set quizzes without stats if stats fetch fails
      setQuizzes(quizzes)
    }
  }

  // Fetch quizzes from database on page load
  // Function to generate courses for all years and semesters
  const generateCoursesForAllYears = async () => {
    try {
      console.log('🎓 Generating courses for all years and semesters...')
      
      const response = await fetch('/api/quiz/generate-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        console.log('✅ Courses generated successfully:', result.data)
        return result.data
      } else {
        console.error('❌ Failed to generate courses:', result.message)
        return null
      }
    } catch (error) {
      console.error('❌ Error generating courses:', error)
      return null
    }
  } // Added closing brace here

  // Function to fetch quizzes from database
  const fetchQuizzesFromDatabase = async () => {
    setLoadingBrowseData(true)
    try {
      console.log('Fetching courses from subject4years table...')
      
      // Fetch courses from the database (only use existing categorized courses)
      const coursesResponse = await fetch('/api/quiz/courses')
      const coursesResult = await coursesResponse.json()

      if (coursesResult.status === 'success' && Array.isArray(coursesResult.data)) {
        console.log('✅ Courses loaded from database:', coursesResult.data.length, 'courses')
        const courseRows = coursesResult.data as CourseData[]
        setSubjectCatalogRows(
          courseRows.map((row) => ({
            year: row.year,
            semester: row.semester,
            code: row.code,
            name: row.name,
          })),
        )
        const courseMap = courseRows.reduce(
          (map: Map<string, { year: number; semester: number; code: string; course: string; category: string }>, c: CourseData) => {
            const key = `${c.year}-${c.semester}-${c.code}`
            if (!map.has(key)) {
              map.set(key, {
                year: c.year,
                semester: c.semester,
                code: c.code,
                course: c.name,
                category: 'Course',
              })
            }
            return map
          },
          new Map<string, { year: number; semester: number; code: string; course: string; category: string }>(),
        )
        const uniqueCourses = Array.from(courseMap.values())
        setAvailableCourses(uniqueCourses)
      } else {
        console.log('⚠️ Error loading courses from database')
        setAvailableCourses([])
        setSubjectCatalogRows([])
      }

      // Fetch existing quizzes from database
      const quizzesResponse = await fetch('/api/quiz')
      const quizzesResult = await quizzesResponse.json()

      let dbQuizzes: Quiz[] = []
      if (quizzesResult.status === 'success' && Array.isArray(quizzesResult.data)) {
        console.log('✅ Quizzes loaded from database:', quizzesResult.data.length)
        dbQuizzes = quizzesResult.data
          .filter((q: any) => q && q.id)
          .map((q: any) => ({
            id: (q.id || '').toString(),
            title: q.title || 'Untitled Quiz',
            description: q.description || '',
            creator: q.creator || 'Unknown',
            questions: [],
            duration: q.duration || 0,
            participants: q.participants || 0,
            category: q.category || 'General',
            difficulty: q.difficulty || 'Medium',
            year: q.year || 1,
            semester: q.semester || 1,
            course: q.course || 'Unknown Course',
            takers: q.takers || 0,
            attempts: q.attempts || 0,
            averageScore: q.averageScore || 0,
          }))
      }

      // Fetch and merge statistics with real quizzes only
      await fetchAndMergeStatistics(dbQuizzes)
    } catch (error) {
      console.error('❌ Error fetching courses from database:', error)
      setAvailableCourses([])
      setQuizzes([])
    } finally {
      setLoadingBrowseData(false)
    }
  }

  useEffect(() => {
    fetchQuizzesFromDatabase()
  }, [])

  // Fetch quiz results from database
  useEffect(() => {
    const fetchQuizResultsFromDatabase = async () => {
      try {
        setLoadingResultsData(true)
        if (!currentUser?.id) {
          console.log('⏭️  Skipping results fetch - no user logged in')
          setLoadingResultsData(false)
          return
        }

        console.log('📊 Fetching quiz results from database for user ID:', currentUser.id)
        const response = await fetch(
          `/api/quiz/results?participantId=${encodeURIComponent(currentUser.id)}&participantName=${encodeURIComponent(currentUser.firstName || '')}`,
        )
        const result = await response.json()

        if (result.status === 'success' && Array.isArray(result.data)) {
          console.log('✅ Quiz results loaded from database:', result.data.length, 'results')
          // Map results to QuizResult type with null checks
          const dbResults = result.data
            .filter((r: any) => r && (r.quizId || r.quiz_id)) // Filter out any results with missing data
            .map((r: any) => ({
              quizId: (r.quizId || r.quiz_id).toString(),
              quizTitle: r.quizTitle || r.title || 'Unknown Quiz',
              participantName: r.participantName || r.participant_name || 'Anonymous',
              score: r.score || 0,
              totalQuestions: r.totalQuestions || r.total_questions || 0,
              dateTaken: r.dateTaken || r.date_taken ? new Date(r.dateTaken || r.date_taken).toLocaleDateString() : 'Unknown Date',
            }))
          
          console.log('✅ Processed', dbResults.length, 'quiz results')
          // Set results from database
          setQuizResults(dbResults)
        } else {
          console.log('⚠️ No quiz results found in database')
          setQuizResults([])
        }
      } catch (error) {
        console.error('❌ Error fetching quiz results from database:', error)
        setQuizResults([])
      } finally {
        setLoadingResultsData(false)
      }
    }

    fetchQuizResultsFromDatabase()
  }, [currentUser])

  // Fetch score data from database
  useEffect(() => {
    const fetchScoreDataFromDatabase = async () => {
      try {
        console.log('📊 Fetching score statistics from database...')
        setLoadingScoreData(true)
        const response = await fetch('/api/quiz/scores')
        const result = await response.json()

        if (result.status === 'success') {
          console.log('✅ Score data loaded from database:', result.data)
          setScoreDataFromApi(result.data)
        } else {
          console.log('⚠️ Failed to fetch score data:', result.message)
          setScoreDataFromApi(null)
        }
      } catch (error) {
        console.error('❌ Error fetching score data from database:', error)
        setScoreDataFromApi(null)
      } finally {
        setLoadingScoreData(false)
      }
    }

    fetchScoreDataFromDatabase()
  }, [])

  const downloadCsv = (fileName: string, rows: Array<Array<string | number>>) => {
    const escapeCsv = (value: string | number) => {
      const normalized = String(value).replace(/\"/g, '""')
      return `"${normalized}"`
    }

    const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadPdf = (fileName: string, rows: Array<Array<string | number>>) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    let yPosition = margin

    // Add title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Quiz Results Report', margin, yPosition)
    yPosition += 10

    // Add date
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
    yPosition += 8

    // Add table
    doc.setFontSize(11)
    const cellPadding = 3
    const colWidths = rows[0].map(() => (pageWidth - 2 * margin) / rows[0].length)

    // Draw header row
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(41, 128, 185)
    doc.setTextColor(255, 255, 255)

    let xPosition = margin
    for (let i = 0; i < rows[0].length; i++) {
      doc.rect(xPosition, yPosition - 4, colWidths[i], 6, 'F')
      doc.text(String(rows[0][i]), xPosition + cellPadding, yPosition)
      xPosition += colWidths[i]
    }
    yPosition += 8

    // Draw data rows
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage()
        yPosition = margin

        // Redraw header on new page
        doc.setFont('helvetica', 'bold')
        doc.setFillColor(41, 128, 185)
        doc.setTextColor(255, 255, 255)

        xPosition = margin
        for (let i = 0; i < rows[0].length; i++) {
          doc.rect(xPosition, yPosition - 4, colWidths[i], 6, 'F')
          doc.text(String(rows[0][i]), xPosition + cellPadding, yPosition)
          xPosition += colWidths[i]
        }
        yPosition += 8

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
      }

      // Draw alternating row background
      if (rowIdx % 2 === 0) {
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F')
      }

      xPosition = margin
      for (let i = 0; i < rows[rowIdx].length; i++) {
        doc.text(String(rows[rowIdx][i]), xPosition + cellPadding, yPosition)
        xPosition += colWidths[i]
      }
      yPosition += 6
    }

    // Add footer
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    doc.text(`Page 1 of ${doc.getNumberOfPages()}`, pageWidth / 2, pageHeight - 5, { align: 'center' })

    // Download
    doc.save(fileName)
  }

  const handleDownloadResult = (result: QuizResult, format: 'csv' | 'pdf' = 'pdf') => {
    const percentage = Math.round((result.score / result.totalQuestions) * 100)
    const data = [
      ['Quiz Title', 'Date Taken', 'Score', 'Total Questions', 'Percentage'],
      [result.quizTitle, result.dateTaken, result.score, result.totalQuestions, `${percentage}%`],
    ]

    if (format === 'pdf') {
      downloadPdf(`quiz-result-${result.quizId}-${Date.now()}.pdf`, data)
    } else {
      downloadCsv(`quiz-result-${result.quizId}-${Date.now()}.csv`, data)
    }
  }

  const handleDownloadAllResults = (format: 'csv' | 'pdf' = 'pdf') => {
    const rows = [
      ['Quiz Title', 'Date Taken', 'Score', 'Total Questions', 'Percentage'],
      ...quizResults.map((result) => [
        result.quizTitle,
        result.dateTaken,
        result.score,
        result.totalQuestions,
        `${Math.round((result.score / result.totalQuestions) * 100)}%`,
      ]),
    ]

    if (format === 'pdf') {
      downloadPdf(`quiz-results-${Date.now()}.pdf`, rows)
    } else {
      downloadCsv(`quiz-results-${Date.now()}.csv`, rows)
    }
  }

  const fetchQuizRatings = async (quizId: string) => {
    try {
      console.log('📥 Fetching ratings from database for quiz:', quizId)
      const response = await fetch(`/api/quiz/${quizId}/rating`)
      const result = await response.json()

      if (response.ok) {
        console.log('✅ Ratings loaded from database:', result.data)
        setQuizRatings((prev) => ({
          ...prev,
          [quizId]: result.data || [],
        }))
      } else {
        console.error('❌ Failed to fetch ratings:', result.message)
      }
    } catch (error) {
      console.error('❌ Error fetching ratings:', error)
    }
  }

  const fetchQuizComments = async (quizId: string) => {
    try {
      console.log('📥 Fetching comments from database for quiz:', quizId)
      const response = await fetch(`/api/quiz/${quizId}/comment`)
      const result = await response.json()

      if (response.ok) {
        console.log('✅ Comments loaded from database:', result.data)
        setQuizComments((prev) => ({
          ...prev,
          [quizId]: result.data || [],
        }))
      } else {
        console.error('❌ Failed to fetch comments:', result.message)
      }
    } catch (error) {
      console.error('❌ Error fetching comments:', error)
    }
  }

  const handleCreateQuiz = async (quizData: any) => {
    // Prevent double submission
    if (isCreatingQuiz) {
      console.warn('⚠️ Quiz creation already in progress, ignoring duplicate submission')
      return
    }

    setIsCreatingQuiz(true)
    try {
      console.log('🚀 Starting quiz creation...', quizData)
      
      const payload = {
        ...quizData,
        creator: quizData.creator || 'Student',
        creatorId: currentUser?.id, // Add creator's user ID for validation
        // Remove id field from questions if it exists
        questions: quizData.questions.map((q: any) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      }
      
      console.log('📤 Sending to API:', JSON.stringify(payload, null, 2))
      
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('📥 Response status:', response.status)
      const result = await response.json()
      console.log('📥 Response data:', result)

      if (!response.ok) {
        console.error('❌ API error:', result.message)
        alert('Error creating quiz: ' + result.message)
        return
      }

      console.log('✅ Quiz created successfully in database!')
      
      // Refresh quizzes from database to show the newly created quiz
      await fetchQuizzesFromDatabase()
      
      // Set the filters to show the newly created quiz
      setSelectedYear(quizData.year)
      setSelectedSemester(quizData.semester)
      setSelectedCourse(quizData.course)
      
      setActiveTab('browse')
      alert('Quiz created successfully!')
    } catch (error) {
      console.error('❌ Failed to create quiz:', error)
      alert('Failed to create quiz. Check console for details.')
    } finally {
      setIsCreatingQuiz(false)
    }
  }

  const handleTakeQuiz = async (quizId: string) => {
    setLoadingQuizPreview(true)
    try {
      // Fetch full quiz details with questions from API
      const response = await fetch(`/api/quiz/${quizId}`)
      const result = await response.json()
      
      if (result.status === 'success' && result.data) {
        console.log('📚 Quiz data received:', { id: result.data.id, title: result.data.title })
        const quizWithQuestions = {
          ...result.data,
          id: (result.data.id || quizId).toString(),
          questions: result.data.questions || [],
        }
        console.log('✅ Quiz prepared for taking:', { id: quizWithQuestions.id, title: quizWithQuestions.title })
        setPreviewQuiz(quizWithQuestions as Quiz)
        // Load ratings and comments from database
        fetchQuizRatings(quizId)
        fetchQuizComments(quizId)
      } else {
        console.error('Failed to fetch quiz details:', result.message)
        alert('Failed to load quiz questions. Please try again.')
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error)
      alert('Failed to load quiz questions. Please try again.')
    } finally {
      setLoadingQuizPreview(false)
    }
  }

  const handleStartQuizFromPreview = () => {
    if (previewQuiz) {
      setDetailedResults([])
      setSelectedQuiz(previewQuiz)
      setPreviewQuiz(null)
      // Load ratings and comments from database
      fetchQuizRatings(previewQuiz.id)
      fetchQuizComments(previewQuiz.id)
    }
  }

  const handleCloseQuizPreview = () => {
    setPreviewQuiz(null)
  }

  const handleQuizComplete = async (score: number, answers: number[]): Promise<{ score: number; totalQuestions: number } | null> => {
    if (!selectedQuiz) return null

    try {
      console.log('📤 Submitting quiz response to database:', {
        quizId: selectedQuiz.id,
        score,
        totalQuestions: answers.length,
        participantName: currentUser?.firstName || 'Anonymous',
      })

      const response = await fetch(`/api/quiz/${selectedQuiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          participantId: currentUser?.id || null,
          participantName: currentUser?.firstName || 'You',
          quizData: {
            title: selectedQuiz.title,
            questions: selectedQuiz.questions,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API error:', result.message)
        alert('Failed to save your quiz response: ' + result.message)
        return null
      }

      console.log('✅ Quiz response saved to database successfully!')

      // Store detailed results from API response
      if (result.data.results) {
        console.log('🎯 Received detailed results from API:', {
          count: result.data.results.length,
          firstQuestion: result.data.results[0] ? {
            questionId: result.data.results[0].questionId,
            userAnswer: result.data.results[0].userAnswer,
            correctAnswer: result.data.results[0].correctAnswer,
            isCorrect: result.data.results[0].isCorrect,
            optionsCount: result.data.results[0].options?.length,
          } : null,
        })
        setDetailedResults(result.data.results)
        console.log('✅ Detailed results captured:', result.data.results.length, 'questions')
      } else {
        console.warn('⚠️  No results in API response:', result.data)
      }

      // Update local state with actual response from API
      const quizResult: QuizResult = {
        quizId: selectedQuiz.id,
        quizTitle: selectedQuiz.title,
        participantName: currentUser?.firstName || 'You',
        score: result.data.score,
        totalQuestions: result.data.totalQuestions,
        dateTaken: new Date(result.data.dateTaken).toLocaleDateString(),
      }

      setQuizResults([quizResult, ...quizResults])

      // Update participants count
      setQuizzes(
        quizzes.map((q) =>
          q.id === selectedQuiz.id ? { ...q, participants: q.participants + 1 } : q
        )
      )

      console.log('✅ Quiz complete! Your response has been saved.')
      return {
        score: result.data.score,
        totalQuestions: result.data.totalQuestions,
      }
    } catch (error) {
      console.error('❌ Failed to submit quiz:', error)
      alert('Failed to submit quiz. Please try again.')
      return null
    }
  }

  const handleCancelQuiz = () => {
    setSelectedQuiz(null)
  }

  const handleAddQuizComment = async (quizId: string, name: string, message: string) => {
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      return
    }

    try {
      console.log('📤 Submitting comment to database:', { quizId, name: trimmedName, message: trimmedMessage })
      
      const response = await fetch(`/api/quiz/${quizId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API error:', result.message)
        alert('Failed to submit comment: ' + result.message)
        return
      }

      console.log('✅ Comment saved to database:', result.data)

      // Update local state with new comment
      setQuizComments((prev) => ({
        ...prev,
        [quizId]: [
          {
            name: trimmedName,
            message: trimmedMessage,
            date: new Date().toLocaleString(),
          },
          ...(prev[quizId] || []),
        ],
      }))
    } catch (error) {
      console.error('❌ Failed to submit comment:', error)
      alert('Failed to submit comment. Please try again.')
    }
  }

  const handleAddQuizRating = async (quizId: string, name: string, rating: number) => {
    const trimmedName = name.trim()
    if (!trimmedName || rating < 1 || rating > 5) {
      return
    }

    try {
      console.log('📤 Submitting rating to database:', { quizId, name: trimmedName, rating })
      
      const response = await fetch(`/api/quiz/${quizId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, rating }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API error:', result.message)
        alert('Failed to submit rating: ' + result.message)
        return
      }

      console.log('✅ Rating saved to database:', result.data)

      // Update local state with new rating
      setQuizRatings((prev) => ({
        ...prev,
        [quizId]: [
          {
            name: trimmedName,
            rating,
            date: new Date().toLocaleString(),
          },
          ...(prev[quizId] || []),
        ],
      }))
    } catch (error) {
      console.error('❌ Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    }
  }

  const yearSemesterBuckets = Array.from(
    quizzes.reduce((bucketMap, quiz) => {
      const key = `${quiz.year}-${quiz.semester}`
      if (!bucketMap.has(key)) {
        bucketMap.set(key, {
          year: quiz.year,
          semester: quiz.semester,
          quizzes: [] as Quiz[],
        })
      }
      bucketMap.get(key)!.quizzes.push(quiz)
      return bucketMap
    }, new Map<string, { year: number; semester: number; quizzes: Quiz[] }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => (a.year === b.year ? a.semester - b.semester : a.year - b.year))

  // Use API data if available, otherwise fallback to calculated data
  const scoreDataFromApiCourseByYear = scoreDataFromApi?.courseByYear || null
  const scoreDataFromApiQuizTakers = scoreDataFromApi?.quizTakers || null
  const scoreDataSummary = scoreDataFromApi?.summary || { totalAttempts: 0, averageScore: 0, totalParticipants: 0 }

  const subjectScoreRows: SubjectScoreRow[] = subjectCatalogRows
    .map((subject) => {
      const matchingYearGroup = Array.isArray(scoreDataFromApiCourseByYear)
        ? scoreDataFromApiCourseByYear.find(
            (group: any) => group.year === subject.year && group.semester === subject.semester,
          )
        : null

      const subjectNameLower = subject.name.trim().toLowerCase()
      const matchingCourseStats = matchingYearGroup?.chartData?.find((course: any) => {
        const courseNameLower = String(course.course || '').trim().toLowerCase()
        return (
          courseNameLower === subjectNameLower ||
          courseNameLower.includes(subjectNameLower) ||
          subjectNameLower.includes(courseNameLower)
        )
      })

      const matchingTakerStats = Array.isArray(scoreDataFromApiQuizTakers)
        ? scoreDataFromApiQuizTakers.find(
            (group: any) =>
              group.year === subject.year &&
              group.semester === subject.semester &&
              String(group.course || '').trim().toLowerCase() === subjectNameLower,
          )
        : null

      const participants: SubjectParticipant[] = Array.isArray(matchingTakerStats?.rows)
        ? matchingTakerStats.rows.map((row: any) => ({
            name: row.name,
            attempts: row.attempts || 0,
            averageScore: row.averageScore || 0,
          }))
        : []

      return {
        year: subject.year,
        semester: subject.semester,
        code: subject.code,
        name: subject.name,
        takers: matchingCourseStats?.participants || 0,
        attempts: matchingCourseStats?.attempts || 0,
        averageScore: matchingCourseStats?.avgScore || 0,
        participants,
      }
    })
    .sort((a, b) =>
      a.year === b.year
        ? a.semester === b.semester
          ? a.code.localeCompare(b.code)
          : a.semester - b.semester
        : a.year - b.year,
    )

  const subjectScoreRowsWithScores = subjectScoreRows.filter((row) => row.takers > 0 || row.attempts > 0)
  const subjectScoreGroups = Array.from(
    subjectScoreRows.reduce((map, row) => {
      const key = `${row.year}-${row.semester}`
      if (!map.has(key)) {
        map.set(key, { year: row.year, semester: row.semester, rows: [] as typeof subjectScoreRows })
      }
      map.get(key)!.rows.push(row)
      return map
    }, new Map<string, { year: number; semester: number; rows: typeof subjectScoreRows }>()),
  )
    .map(([, value]) => ({
      ...value,
      rows: value.rows.sort((a, b) => a.code.localeCompare(b.code)),
    }))
    .sort((a, b) => (a.year === b.year ? a.semester - b.semester : a.year - b.year))

  const subjectAvailableScoreYears = Array.from(new Set(subjectScoreRows.map((row) => row.year))).sort((a, b) => a - b)
  const filteredSubjectScoreGroups =
    selectedScoreYear === 'all'
      ? subjectScoreGroups
      : subjectScoreGroups.filter((group) => group.year === selectedScoreYear)

  const normalizedSubjectScoreSearch = scoreSearch.trim().toLowerCase()
  const searchedSubjectScoreGroups = filteredSubjectScoreGroups
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => {
        if (!normalizedSubjectScoreSearch) return true
        return (
          row.name.toLowerCase().includes(normalizedSubjectScoreSearch) ||
          row.code.toLowerCase().includes(normalizedSubjectScoreSearch)
        )
      }),
    }))
    .filter((group) => group.rows.length > 0)

  const topSubject = [...subjectScoreRowsWithScores].sort((a, b) => b.averageScore - a.averageScore)[0]
  const lowSubject = [...subjectScoreRowsWithScores].sort((a, b) => a.averageScore - b.averageScore)[0]
  const totalSubjects = subjectCatalogRows.length
  const subjectsWithScores = subjectScoreRowsWithScores.length

  // Fallback calculated data (for backward compatibility if API is not ready)
  const calculatedCategorizedScoreData = yearSemesterBuckets.map((bucket) => {
    const courseMap = bucket.quizzes.reduce((map, quiz) => {
      if (!map.has(quiz.course)) {
        map.set(quiz.course, {
          course: quiz.course,
          participants: 0,
          quizIds: [] as string[],
        })
      }

      const courseEntry = map.get(quiz.course)!
      courseEntry.participants += quiz.participants
      courseEntry.quizIds.push(quiz.id)
      return map
    }, new Map<string, { course: string; participants: number; quizIds: string[] }>())

    const chartData = Array.from(courseMap.values())
      .map((entry) => {
        const attemptsForCourse = quizResults.filter((result) =>
          entry.quizIds.includes(result.quizId),
        )
        const avgScore =
          attemptsForCourse.length > 0
            ? Math.round(
                (attemptsForCourse.reduce(
                  (sum, result) => sum + (result.score / result.totalQuestions) * 100,
                  0,
                ) /
                  attemptsForCourse.length) *
                  10,
              ) / 10
            : 0

        return {
          course: entry.course,
          shortCourse:
            entry.course.length > 1 ? `${entry.course.slice(0, 1)}...` : entry.course,
          participants: entry.participants,
          attempts: attemptsForCourse.length,
          avgScore,
        }
      })
      .sort((a, b) => a.course.localeCompare(b.course))

    return {
      year: bucket.year,
      semester: bucket.semester,
      chartData,
    }
  })

  // Use calculated data for now (API will populate scoreDataFromApi for future optimization)
  const categorizedScoreData: typeof calculatedCategorizedScoreData = scoreDataFromApiCourseByYear || calculatedCategorizedScoreData

  const totalAttempts = quizResults.length
  const overallAverageScore =
    quizResults.length > 0
      ? Math.round(
          (quizResults.reduce(
            (sum, result) => sum + (result.score / result.totalQuestions) * 100,
            0,
          ) /
            quizResults.length) *
            10,
        ) / 10
      : 0

  const availableScoreYears = Array.from(new Set(quizzes.map((q) => q.year))).sort((a, b) => a - b)

  const filteredCategorizedScoreData =
    selectedScoreYear === 'all'
      ? categorizedScoreData
      : categorizedScoreData.filter((group) => group.year === selectedScoreYear)

  const participantAttemptRows = quizResults.map((result) => {
    const quiz = quizzes.find((q) => q.id === result.quizId)
    return {
      name: result.participantName,
      quizId: result.quizId,
      year: quiz?.year ?? 0,
      semester: quiz?.semester ?? 0,
      course: quiz?.course ?? 'Unknown Course',
      quizTitle: result.quizTitle,
      percentage: Math.round((result.score / result.totalQuestions) * 100),
    }
  })

  const participantScoreData = Array.from(
    participantAttemptRows
      .reduce((map, row) => {
      if (!map.has(row.name)) {
        map.set(row.name, {
          name: row.name,
          attempts: 0,
          totalPercentage: 0,
          quizzes: new Set<string>(),
        })
      }

      const participant = map.get(row.name)!
      participant.attempts += 1
      participant.totalPercentage += row.percentage
      participant.quizzes.add(row.quizId)

      return map
      }, new Map<string, { name: string; attempts: number; totalPercentage: number; quizzes: Set<string> }>())
      .values(),
  )
    .map((participant) => ({
      name: participant.name,
      attempts: 1,
      quizzesTaken: 1,
      averageScore: Math.round((participant.totalPercentage / participant.attempts) * 10) / 10,
    }))
    .sort((a, b) => b.averageScore - a.averageScore)

  const allYearCourseEntries = Array.from(
    quizzes.reduce((map, quiz) => {
      const key = `${quiz.year}::${quiz.semester}::${quiz.course}`
      if (!map.has(key)) {
        map.set(key, { year: quiz.year, semester: quiz.semester, course: quiz.course })
      }
      return map
    }, new Map<string, { year: number; semester: number; course: string }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) =>
      a.year === b.year
        ? a.semester === b.semester
          ? a.course.localeCompare(b.course)
          : a.semester - b.semester
        : a.year - b.year,
    )

  const courseTakerScoreData = allYearCourseEntries.map((entry) => {
    const rowsForCourse = participantAttemptRows.filter(
      (row) =>
        row.year === entry.year &&
        row.semester === entry.semester &&
        row.course === entry.course,
    )
    const uniqueTakers = new Set(rowsForCourse.map((row) => row.name)).size
    const attempts = rowsForCourse.length
    const averageScore =
      attempts > 0
        ? Math.round(
            (rowsForCourse.reduce((sum, row) => sum + row.percentage, 0) / attempts) * 10,
          ) / 10
        : 0

    return {
      year: entry.year,
      semester: entry.semester,
      course: entry.course,
      takers: uniqueTakers,
      attempts,
      averageScore,
    }
  })

  // Calculate course taker scores for calculated data
  const calculatedCourseTakerScoreByYearSemester = Array.from(
    courseTakerScoreData.reduce((map, row) => {
      const key = `${row.year}-${row.semester}`
      if (!map.has(key)) {
        map.set(key, { year: row.year, semester: row.semester, rows: [] as typeof courseTakerScoreData })
      }
      map.get(key)!.rows.push(row)
      return map
    }, new Map<string, { year: number; semester: number; rows: typeof courseTakerScoreData }>()),
  )
    .map(([, value]) => value)
    .sort((a, b) => (a.year === b.year ? a.semester - b.semester : a.year - b.year))

  // Use API data for quiz takers if available, otherwise use calculated data
  const courseTakerScoreByYearSemester: typeof calculatedCourseTakerScoreByYearSemester = scoreDataFromApiQuizTakers || calculatedCourseTakerScoreByYearSemester

  const childScoresByCourseGroup = Array.from(
    participantAttemptRows
      .reduce((map, row) => {
        const groupKey = `${row.year}-${row.semester}-${row.course}`
        if (!map.has(groupKey)) {
          map.set(groupKey, new Map<string, { name: string; attempts: number; totalPercentage: number }>())
        }

        const childMap = map.get(groupKey)!
        if (!childMap.has(row.name)) {
          childMap.set(row.name, { name: row.name, attempts: 0, totalPercentage: 0 })
        }

        const child = childMap.get(row.name)!
        child.attempts += 1
        child.totalPercentage += row.percentage

        return map
      }, new Map<string, Map<string, { name: string; attempts: number; totalPercentage: number }>>())
      .entries(),
  ).reduce((acc, [groupKey, childMap]) => {
    acc[groupKey] = Array.from(childMap.values())
      .map((child) => ({
        ...child,
        averageScore: Math.round((child.totalPercentage / child.attempts) * 10) / 10,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)

    return acc
  }, {} as Record<string, Array<{ name: string; attempts: number; totalPercentage: number; averageScore: number }>>)

  const createQuizCourseOptions = availableCourses

  const normalizedScoreSearch = scoreSearch.trim().toLowerCase()
  const searchedCategorizedScoreData = filteredCategorizedScoreData
    .map((group) => ({
      ...group,
      chartData: group.chartData.filter((row) =>
        normalizedScoreSearch === ''
          ? true
          : row.course.toLowerCase().includes(normalizedScoreSearch),
      ),
    }))
    .filter((group) => group.chartData.length > 0)

  const searchedCourseTakerScoreByYearSemester = courseTakerScoreByYearSemester
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) =>
        normalizedScoreSearch === ''
          ? true
          : row.course.toLowerCase().includes(normalizedScoreSearch),
      ),
    }))
    .filter((group) => group.rows.length > 0)

  const filteredResults = quizResults.filter((result) => {
    if (!resultsSearch.trim()) {
      return true
    }
    const keyword = resultsSearch.trim().toLowerCase()
    return (
      result.quizTitle.toLowerCase().includes(keyword) ||
      result.dateTaken.toLowerCase().includes(keyword)
    )
  })

  if (selectedQuiz) {
    const participantScores: ParticipantScoreSummary[] = quizResults
      .filter((result) => result.quizId === selectedQuiz.id)
      .map((result) => ({
        name: result.participantName,
        score: result.score,
        totalQuestions: result.totalQuestions,
      }))

    const combinedComments = quizComments[selectedQuiz.id] || []

    const combinedRatings = quizRatings[selectedQuiz.id] || []

    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <TakeQuiz
            quiz={selectedQuiz}
            participantScores={participantScores}
            quizComments={combinedComments}
            quizRatings={combinedRatings}
            currentUser={currentUser}
            detailedResults={detailedResults}
            onAddComment={(name, message) =>
              handleAddQuizComment(selectedQuiz.id, name, message)
            }
            onAddRating={(name, rating) => handleAddQuizRating(selectedQuiz.id, name, rating)}
            onComplete={handleQuizComplete}
            onCancel={handleCancelQuiz}
          />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="w-full py-6 px-4 md:px-6 lg:px-8">
        Header
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Quiz Platform
          </h1>
          <p className="text-muted-foreground">
            Create quizzes, test your knowledge, and track your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Quizzes
              </h3>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{quizzes.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Quizzes Completed
              </h3>
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{quizResults.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Average Score
              </h3>
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {quizResults.length > 0
                ? Math.round(
                    (quizResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) /
                      quizResults.length)
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'browse'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Browse Quizzes
              {activeTab === 'browse' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('create')
                setSelectedYear(null)
                setSelectedSemester(null)
                setSelectedCourse(null)
              }}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'create'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Quiz
              {activeTab === 'create' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('results')
                setSelectedYear(null)
                setSelectedSemester(null)
                setSelectedCourse(null)
              }}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'results'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Results
              {activeTab === 'results' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('score')
                setSelectedYear(null)
                setSelectedSemester(null)
                setSelectedCourse(null)
              }}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'score'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Score
              {activeTab === 'score' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'browse' && (
          <div>
            {loadingBrowseData ? (
              <div className="bg-card border border-border rounded-lg p-10 text-center mb-6">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Loading Quiz Data</h3>
                <p className="text-muted-foreground">Fetching courses and quizzes from the database...</p>
              </div>
            ) : null}
            {/* Year Selection */}
            {!loadingBrowseData && selectedYear === null ? (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Select Year</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 hover:bg-gradient-to-br hover:from-primary/20 hover:to-primary/10 hover:border-primary/40 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-200">
                        {year}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Year {year}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : !loadingBrowseData && selectedSemester === null ? (
              /* Semester Selection */
              <div>
                <button
                  onClick={() => setSelectedYear(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  ← Back to Years
                </button>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Year {selectedYear} - Select Semester
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((semester) => (
                    <button
                      key={semester}
                      onClick={() => {
                        setSelectedSemester(semester)
                        setSelectedCourse(null)
                      }}
                      className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-lg p-8 hover:bg-gradient-to-br hover:from-secondary/20 hover:to-secondary/10 hover:border-secondary/40 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="text-4xl font-bold text-secondary mb-2 group-hover:scale-110 transition-transform duration-200">
                        {semester}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Semester {semester}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : !loadingBrowseData && selectedCourse === null ? (
              /* Course Selection */
              <div>
                <button
                  onClick={() => setSelectedSemester(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  ← Back to Semesters
                </button>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Year {selectedYear} - Semester {selectedSemester} - Select Course
                </h2>
                {(() => {
                  const courses = Array.from(
                    new Set(
                      availableCourses
                        .filter((c) => c.year === selectedYear && c.semester === selectedSemester)
                        .map((c) => c.course)
                    )
                  ).filter((course) =>
                    browseCourseSearch.trim() === ''
                      ? true
                      : course.toLowerCase().includes(browseCourseSearch.trim().toLowerCase()),
                  )

                  return courses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No courses available
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        No courses found for Year {selectedYear}, Semester {selectedSemester}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <div className="relative w-full md:max-w-md">
                          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={browseCourseSearch}
                            onChange={(e) => setBrowseCourseSearch(e.target.value)}
                            placeholder="Search course"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course) => {
                        const courseQuizCount = quizzes.filter(
                          (q) =>
                            q.year === selectedYear &&
                            q.semester === selectedSemester &&
                            q.course === course
                        ).length

                        return (
                          <button
                            key={course}
                            onClick={() => setSelectedCourse(course)}
                            className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-6 hover:bg-gradient-to-br hover:from-accent/20 hover:to-accent/10 hover:border-accent/40 transition-all duration-200 cursor-pointer group text-left"
                          >
                            <div className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                              {course}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {courseQuizCount} quiz{courseQuizCount !== 1 ? 'zes' : ''}
                            </div>
                          </button>
                        )
                      })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : !loadingBrowseData ? (
              /* Quiz List */
              <div>
                <button
                  onClick={() => {
                    setSelectedCourse(null)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  ← Back to Courses
                </button>
                <h2 className="text-2xl font-bold text-foreground mb-2">{selectedCourse}</h2>
                <p className="text-muted-foreground mb-6">
                  Year {selectedYear} - Semester {selectedSemester}
                </p>
                <div className="mb-4">
                  <div className="relative w-full md:max-w-xl">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={browseQuizSearch}
                      onChange={(e) => setBrowseQuizSearch(e.target.value)}
                      placeholder="Search quizzes by title, description, creator"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                {(() => {
                  const filteredQuizzes = quizzes.filter(
                    (q) =>
                      (selectedYear === null || q.year === selectedYear) &&
                      (selectedSemester === null || q.semester === selectedSemester) &&
                      (selectedCourse === null || q.course === selectedCourse) &&
                      (browseQuizSearch.trim() === ''
                        ? true
                        : `${q.title} ${q.description} ${q.creator}`
                            .toLowerCase()
                            .includes(browseQuizSearch.trim().toLowerCase()))
                  )
                  return filteredQuizzes.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No quizzes available
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {selectedYear === null
                          ? 'Please select a year to browse quizzes'
                          : selectedSemester === null
                          ? `Please select a semester for Year ${selectedYear}`
                          : selectedCourse === null
                          ? `Please select a course for Year ${selectedYear}, Semester ${selectedSemester}`
                          : `No quizzes found for Year ${selectedYear}, Semester ${selectedSemester}, ${selectedCourse}`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredQuizzes.map((quiz) => (
                        <QuizCard
                          key={quiz.id}
                          id={quiz.id}
                          title={quiz.title}
                          description={quiz.description}
                          creator={quiz.creator}
                          questions={quiz.questions.length}
                          duration={quiz.duration}
                          participants={quiz.participants}
                          category={quiz.category}
                          difficulty={quiz.difficulty}
                          onTakeQuiz={handleTakeQuiz}
                        />
                      ))}
                    </div>
                  )
                })()}
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            {loadingUser ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading user info...</p>
              </div>
            ) : isNotLoggedIn ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold text-amber-950 mb-2">
                  Login Required
                </h3>
                <p className="text-amber-900 mb-6">
                  You must be logged in to create quizzes. Please log in with your SLIIT account.
                </p>
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <CreateQuizForm
                onSubmit={handleCreateQuiz}
                availableCourses={createQuizCourseOptions}
                currentUser={currentUser}
              />
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">My Results</h2>
              <p className="text-muted-foreground">
                View all your quiz attempts and scores
              </p>
            </div>

            {loadingResultsData ? (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Loading Results</h3>
                <p className="text-muted-foreground">Fetching your quiz attempts...</p>
              </div>
            ) : quizResults.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No quiz results yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start taking quizzes to see your results here
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Browse Quizzes
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-4">Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-background border border-border rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
                      <p className="text-2xl font-bold text-primary">{quizResults.length}</p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                      <p className="text-2xl font-bold text-primary">
                        {quizResults.length > 0
                          ? Math.round(
                              (quizResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) /
                                quizResults.length)
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Correct</p>
                      <p className="text-2xl font-bold text-primary">
                        {quizResults.reduce((sum, r) => sum + r.score, 0)}
                      </p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                      <p className="text-2xl font-bold text-primary">
                        {quizResults.reduce((sum, r) => sum + r.totalQuestions, 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="relative w-full md:max-w-md">
                        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={resultsSearch}
                          onChange={(e) => setResultsSearch(e.target.value)}
                          placeholder="Search results by quiz title or date"
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadAllResults('pdf')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download as PDF
                      </button>
                      <button
                        onClick={() => handleDownloadAllResults('csv')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download as CSV
                      </button>
                    </div>
                  </div>

                  {filteredResults.length === 0 ? (
                    <div className="text-center py-8 bg-card border border-border rounded-lg">
                      <p className="text-muted-foreground">
                        No results match your search "{resultsSearch}"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredResults.length} of {quizResults.length} results
                      </p>
                      {filteredResults.map((result, index) => {
                        const percentage = Math.round((result.score / result.totalQuestions) * 100)
                        const isPass = percentage >= 70

                        return (
                          <div
                            key={index}
                            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-1">
                                  {result.quizTitle}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Completed on {result.dateTaken}
                                </p>
                              </div>

                              <div className="text-right">
                                <div className={`text-3xl font-bold mb-1 ${isPass ? 'text-green-500' : 'text-orange-500'}`}>
                                  {percentage}%
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {result.score} / {result.totalQuestions} correct
                                </p>
                                <div className="mt-2 text-xs font-medium bg-background rounded px-2 py-1 inline-block">
                                  {isPass ? '✓ Pass' : '⚠ Review Required'}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDownloadResult(result, 'pdf')}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                                >
                                  <Download className="w-4 h-4" />
                                  PDF
                                </button>
                                <button
                                  onClick={() => handleDownloadResult(result, 'csv')}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                                >
                                  <Download className="w-4 h-4" />
                                  CSV
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'score' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Summery Details</h3>
              <p className="text-muted-foreground">
                Live Neon catalog rows from subject4years, joined with quiz score aggregates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Subject Rows</p>
                <p className="text-2xl font-bold text-foreground">{totalSubjects}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Subjects With Scores</p>
                <p className="text-2xl font-bold text-foreground">{subjectsWithScores}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
                <p className="text-2xl font-bold text-foreground">{scoreDataSummary.totalAttempts}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <p className="text-2xl font-bold text-foreground">{scoreDataSummary.averageScore}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Top Scoring Subject</p>
                <p className="text-lg font-semibold text-foreground">
                  {topSubject
                    ? `${topSubject.code} - ${topSubject.name} (${topSubject.averageScore}%)`
                    : 'No scored subjects yet'}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Lowest Scoring Subject</p>
                <p className="text-lg font-semibold text-foreground">
                  {lowSubject
                    ? `${lowSubject.code} - ${lowSubject.name} (${lowSubject.averageScore}%)`
                    : 'No scored subjects yet'}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Score View</label>
                <select
                  value={scoreView}
                  onChange={(e) => setScoreView(e.target.value as 'courseByYear' | 'quizTakers')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="courseByYear">Subject Scores by Year</option>
                  <option value="quizTakers">Quiz Takers Scores</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Search</label>
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={scoreSearch}
                    onChange={(e) => setScoreSearch(e.target.value)}
                    placeholder="Search by subject code or name"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              {scoreView === 'courseByYear' && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Year</label>
                  <select
                    value={selectedScoreYear}
                    onChange={(e) =>
                      setSelectedScoreYear(e.target.value === 'all' ? 'all' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="all">All Years</option>
                    {subjectAvailableScoreYears.map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {loadingScoreData && (
              <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
                Loading live score data from Neon...
              </div>
            )}

            {scoreView === 'courseByYear' ? (
              searchedSubjectScoreGroups.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">No subject score data for the selected year.</p>
                </div>
              ) : (
                searchedSubjectScoreGroups.map((group, index) => (
                  <div key={`subject-score-${group.year}-${group.semester}-${index}`} className="bg-card border border-border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      Year {group.year} - Semester {group.semester}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Average score diagram for submitted quiz attempts in this year and semester.
                    </p>
                    <ChartContainer
                      id={`subject-average-score-${group.year}-${group.semester}-${index}`}
                      config={scoreChartConfig}
                      className="h-[360px] w-full"
                    >
                      <BarChart
                        data={group.rows.map((subjectRow) => ({
                          code: subjectRow.code,
                          name: subjectRow.name,
                          averageScore: subjectRow.averageScore,
                        }))}
                        margin={{ left: 12, right: 12, top: 16, bottom: 40 }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="code"
                          tickLine={false}
                          axisLine={false}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={72}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? 'Subject'}
                            />
                          }
                        />
                        <Bar dataKey="averageScore" name="Average Score %" fill="var(--color-avgScore)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                ))
              )
            ) : (
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-lg font-semibold text-foreground mb-1">Quiz Takers Score Summary</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Score summary for students who took quizzes across all subjects in subject4years.
                </p>

                <div className="space-y-4">
                  {searchedSubjectScoreGroups.map((yearGroup, index) => (
                    <div
                      key={`taker-score-${yearGroup.year}-${yearGroup.semester}-${index}`}
                      className="border border-border rounded-lg p-4"
                    >
                      <h5 className="text-base font-semibold text-foreground mb-3">
                        Year {yearGroup.year} - Semester {yearGroup.semester}
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Code</th>
                              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Subject</th>
                              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Takers</th>
                              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Attempts</th>
                              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Average Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {yearGroup.rows.map((subjectRow) => (
                              <tr
                                key={`${subjectRow.year}-${subjectRow.semester}-${subjectRow.code}`}
                                className="border-b border-border/60"
                              >
                                <td className="py-2 pr-4 text-foreground font-medium">{subjectRow.code}</td>
                                <td className="py-2 pr-4 text-foreground font-medium">{subjectRow.name}</td>
                                <td className="py-2 pr-4 text-foreground">{subjectRow.takers}</td>
                                <td className="py-2 pr-4 text-foreground">{subjectRow.attempts}</td>
                                <td className="py-2 pr-4 text-foreground">{subjectRow.averageScore}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {previewQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{previewQuiz.title}</h3>
              <p className="text-muted-foreground mb-4">Previous comments and ratings</p>

              {(() => {
                const previewComments = quizComments[previewQuiz.id] || []
                const previewRatings = quizRatings[previewQuiz.id] || []

                return (
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">Ratings</h4>
                      {previewRatings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No ratings yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {previewRatings.map((rating, index) => (
                            <div
                              key={`${rating.name}-${rating.date}-${index}`}
                              className="flex items-center justify-between gap-3 border border-border rounded-md px-3 py-2"
                            >
                              <span className="font-medium text-foreground text-sm">{rating.name}</span>
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

                    <div className="border border-border rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">Comments</h4>
                      {previewComments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No comments yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto">
                          {previewComments.map((comment, index) => (
                            <div key={`${comment.name}-${comment.date}-${index}`} className="border border-border rounded-md p-3">
                              <div className="flex items-center justify-between gap-3 mb-1">
                                <p className="font-medium text-foreground text-sm">{comment.name}</p>
                                <p className="text-xs text-muted-foreground">{comment.date}</p>
                              </div>
                              <p className="text-sm text-foreground">{comment.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={handleCloseQuizPreview}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleStartQuizFromPreview}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {loadingQuizPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm bg-card border border-border rounded-lg p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Loading Quiz</h3>
              <p className="text-muted-foreground">Preparing questions and details...</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

