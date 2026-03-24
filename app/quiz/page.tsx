
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
import { useState } from 'react'
import { BookOpen, Download, Star, Trophy } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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

const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Communication Skills - Written Communication',
    description: 'Test your knowledge on written communication techniques',
    creator: 'Prof. Sarah Chen',
    questions: [
      {
        id: '1',
        question: 'What is the primary goal of written communication?',
        options: [
          'To entertain the reader',
          'To clearly convey information and ideas',
          'To use complex vocabulary',
          'To make the text longer',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 15,
    participants: 234,
    category: 'Communication',
    difficulty: 'Easy',
    year: 1,
    semester: 1,
    course: 'Communication Skills',
  },
  {
    id: '2',
    title: 'Mathematics - Algebra Fundamentals',
    description: 'Test your understanding of algebraic concepts',
    creator: 'Dr. James Wilson',
    questions: [
      {
        id: '1',
        question: 'What is the solution to 2x + 5 = 13?',
        options: ['2', '4', '6', '8'],
        correctAnswer: 1,
      },
    ],
    duration: 20,
    participants: 189,
    category: 'Mathematics',
    difficulty: 'Medium',
    year: 1,
    semester: 1,
    course: 'Mathematics for Computing',
  },
  {
    id: '3',
    title: 'Computer Systems - Hardware Basics',
    description: 'Learn about computer hardware components',
    creator: 'Alex Kumar',
    questions: [
      {
        id: '1',
        question: 'What does CPU stand for?',
        options: [
          'Central Process Unit',
          'Central Processing Unit',
          'Computer Personal Unit',
          'Central Processor Utility',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 10,
    participants: 412,
    category: 'Computer Science',
    difficulty: 'Easy',
    year: 1,
    semester: 1,
    course: 'Introduction to Computer Systems',
  },
  {
    id: '4',
    title: 'Computing Systems - Operating Systems',
    description: 'Understand operating systems and their functions',
    creator: 'Prof. Emily Davis',
    questions: [
      {
        id: '1',
        question: 'What is the main role of an operating system?',
        options: [
          'To provide user entertainment',
          'To manage hardware and software resources',
          'To create programs',
          'To store files only',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 12,
    participants: 356,
    category: 'Computer Science',
    difficulty: 'Easy',
    year: 1,
    semester: 1,
    course: 'Introduction to Computing Systems',
  },
  {
    id: '5',
    title: 'Programming - Variables and Data Types',
    description: 'Master variables and data types in programming',
    creator: 'Dr. Robert Chen',
    questions: [
      {
        id: '1',
        question: 'What is a variable in programming?',
        options: [
          'A named container for storing data values',
          'A type of loop',
          'A function parameter',
          'A conditional statement',
        ],
        correctAnswer: 0,
      },
    ],
    duration: 18,
    participants: 298,
    category: 'Computer Science',
    difficulty: 'Easy',
    year: 1,
    semester: 1,
    course: 'Introduction to Programming',
  },
  {
    id: '6',
    title: 'Software Architecture Patterns',
    description: 'Understand common software architecture patterns',
    creator: 'Prof. Michael Rodriguez',
    questions: [
      {
        id: '1',
        question: 'What is the MVC pattern?',
        options: [
          'Model-View-Controller',
          'Multiple-Version-Control',
          'Memory-Virtual-Cache',
          'Module-Variable-Container',
        ],
        correctAnswer: 0,
      },
    ],
    duration: 20,
    participants: 245,
    category: 'Computer Science',
    difficulty: 'Hard',
    year: 2,
    semester: 1,
    course: 'Software Engineering',
  },
  {
    id: '19',
    title: 'Operating Systems and System Administration - Fundamentals',
    description: 'Test key concepts in operating systems and system administration',
    creator: 'Prof. Emily Davis',
    questions: [
      {
        id: '1',
        question: 'Which component is responsible for process scheduling?',
        options: ['Compiler', 'Kernel', 'Database engine', 'Network card'],
        correctAnswer: 1,
      },
    ],
    duration: 18,
    participants: 201,
    category: 'Computer Science',
    difficulty: 'Medium',
    year: 2,
    semester: 1,
    course: 'Operating Systems and System Administration',
  },
  {
    id: '20',
    title: 'Computer Neteorks - Network Basics',
    description: 'Assess understanding of foundational computer networking concepts',
    creator: 'Alex Kumar',
    questions: [
      {
        id: '1',
        question: 'Which device forwards packets between networks?',
        options: ['Switch', 'Router', 'Hub', 'Repeater'],
        correctAnswer: 1,
      },
    ],
    duration: 16,
    participants: 187,
    category: 'Computer Science',
    difficulty: 'Easy',
    year: 2,
    semester: 1,
    course: 'Computer Neteorks',
  },
  {
    id: '21',
    title: 'Database Mangement Systems - Relational Design',
    description: 'Evaluate database management system and relational model basics',
    creator: 'Dr. Robert Chen',
    questions: [
      {
        id: '1',
        question: 'What does SQL primarily manage?',
        options: ['Network routes', 'Relational data', 'Operating system logs', 'Hardware drivers'],
        correctAnswer: 1,
      },
    ],
    duration: 17,
    participants: 214,
    category: 'Computer Science',
    difficulty: 'Medium',
    year: 2,
    semester: 1,
    course: 'Database Mangement Systems',
  },
  {
    id: '22',
    title: 'Object Oriented Programming - Core Principles',
    description: 'Practice core principles of object-oriented programming',
    creator: 'Dr. James Wilson',
    questions: [
      {
        id: '1',
        question: 'Which OOP principle hides implementation details?',
        options: ['Inheritance', 'Abstraction', 'Recursion', 'Compilation'],
        correctAnswer: 1,
      },
    ],
    duration: 19,
    participants: 226,
    category: 'Computer Science',
    difficulty: 'Easy',
    year: 2,
    semester: 1,
    course: 'Object Oriented Programming',
  },
  {
    id: '7',
    title: 'Employability Skills Development - Advanced Career Skills',
    description: 'Assess advanced communication and workplace readiness skills',
    creator: 'Dr. Lisa Anderson',
    questions: [
      {
        id: '1',
        question: 'Which practice improves interview performance the most?',
        options: [
          'No preparation',
          'Practicing role-specific questions and communication',
          'Arriving late intentionally',
          'Ignoring feedback',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 16,
    participants: 188,
    category: 'Professional Development',
    difficulty: 'Medium',
    year: 3,
    semester: 1,
    course: 'Employability Skills Development',
  },
  {
    id: '23',
    title: 'IT Project Mnagement - Planning and Execution',
    description: 'Test core project management concepts in IT environments',
    creator: 'Alex Kumar',
    questions: [
      {
        id: '1',
        question: 'Which process helps identify potential project risks early?',
        options: ['Risk assessment', 'Code refactoring', 'UI prototyping only', 'Database seeding'],
        correctAnswer: 0,
      },
    ],
    duration: 17,
    participants: 175,
    category: 'Project Management',
    difficulty: 'Medium',
    year: 3,
    semester: 1,
    course: 'IT Project Mnagement',
  },
  {
    id: '24',
    title: 'Programming Applications and Frameworks - Practical Development',
    description: 'Evaluate your understanding of frameworks and application architecture',
    creator: 'Dr. Robert Chen',
    questions: [
      {
        id: '1',
        question: 'What is a key benefit of using frameworks?',
        options: [
          'No need for structure',
          'Reusable patterns and faster development',
          'Eliminates testing entirely',
          'Removes need for documentation',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 20,
    participants: 211,
    category: 'Computer Science',
    difficulty: 'Medium',
    year: 3,
    semester: 1,
    course: 'Programming Applications and Frameworks',
  },
  {
    id: '25',
    title: 'Database Systems - Advanced Concepts',
    description: 'Assess understanding of transactions, indexing, and performance',
    creator: 'Prof. Emily Davis',
    questions: [
      {
        id: '1',
        question: 'What does ACID primarily ensure in databases?',
        options: ['Styling consistency', 'Reliable transactions', 'Faster internet speed', 'Mobile responsiveness'],
        correctAnswer: 1,
      },
    ],
    duration: 18,
    participants: 204,
    category: 'Computer Science',
    difficulty: 'Hard',
    year: 3,
    semester: 1,
    course: 'Database Systems',
  },
  {
    id: '26',
    title: 'Neywork Design and Mnagement - Enterprise Networking',
    description: 'Test enterprise network design and management fundamentals',
    creator: 'Prof. Michael Rodriguez',
    questions: [
      {
        id: '1',
        question: 'Which is essential when designing scalable enterprise networks?',
        options: ['No redundancy', 'Single point of failure', 'Capacity planning and segmentation', 'Random IP allocation'],
        correctAnswer: 2,
      },
    ],
    duration: 19,
    participants: 193,
    category: 'Computer Science',
    difficulty: 'Hard',
    year: 3,
    semester: 1,
    course: 'Neywork Design and Mnagement',
  },
  {
    id: '8',
    title: 'Advanced Cloud Computing',
    description: 'Explore advanced cloud computing technologies and strategies',
    creator: 'Prof. David Thompson',
    questions: [
      {
        id: '1',
        question: 'What are the three main cloud service models?',
        options: [
          'IaaS, PaaS, SaaS',
          'Mac, Linux, Windows',
          'HTTP, FTP, SMTP',
          'SQL, NoSQL, GraphQL',
        ],
        correctAnswer: 0,
      },
    ],
    duration: 22,
    participants: 167,
    category: 'Computer Science',
    difficulty: 'Hard',
    year: 4,
    semester: 2,
    course: 'Cloud Computing',
  },
  {
    id: '13',
    title: 'Probability & Statistics - Core Concepts',
    description: 'Test your understanding of basic probability and statistics principles',
    creator: 'Dr. James Wilson',
    questions: [
      {
        id: '1',
        question: 'What is the probability of getting heads in a fair coin toss?',
        options: ['0', '0.25', '0.5', '1'],
        correctAnswer: 2,
      },
    ],
    duration: 18,
    participants: 191,
    category: 'Mathematics',
    difficulty: 'Easy',
    year: 2,
    semester: 2,
    course: 'Probability & Statistics',
  },
  {
    id: '14',
    title: 'Employability Skill Development - Career Readiness',
    description: 'Assess practical employability and workplace readiness skills',
    creator: 'Prof. Sarah Chen',
    questions: [
      {
        id: '1',
        question: 'Which is most important in a professional CV?',
        options: [
          'Unrelated personal details',
          'Clear structure and relevant skills',
          'Decorative fonts only',
          'Very long paragraphs',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 14,
    participants: 170,
    category: 'Professional Development',
    difficulty: 'Easy',
    year: 2,
    semester: 2,
    course: 'Employability Skills Development',
  },
  {
    id: '15',
    title: 'Professional Skills - Workplace Communication',
    description: 'Practice communication and teamwork in professional environments',
    creator: 'Prof. Emily Davis',
    questions: [
      {
        id: '1',
        question: 'What improves teamwork effectiveness the most?',
        options: [
          'Ignoring feedback',
          'Clear communication and accountability',
          'Avoiding meetings always',
          'Working in isolation',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 15,
    participants: 177,
    category: 'Professional Development',
    difficulty: 'Easy',
    year: 2,
    semester: 2,
    course: 'Professional Skills',
  },
  {
    id: '16',
    title: 'IT Project - Project Planning Essentials',
    description: 'Understand planning and execution basics for IT projects',
    creator: 'Alex Kumar',
    questions: [
      {
        id: '1',
        question: 'Which document typically defines project scope?',
        options: ['Project charter', 'Source code', 'User story map only', 'Email thread'],
        correctAnswer: 0,
      },
    ],
    duration: 17,
    participants: 183,
    category: 'Project Management',
    difficulty: 'Medium',
    year: 2,
    semester: 2,
    course: 'IT Project',
  },
  {
    id: '17',
    title: 'Data Structures & Alogorithms - Fundamentals',
    description: 'Evaluate your knowledge of key data structure and algorithm concepts',
    creator: 'Dr. Robert Chen',
    questions: [
      {
        id: '1',
        question: 'Which data structure uses FIFO ordering?',
        options: ['Stack', 'Queue', 'Tree', 'Graph'],
        correctAnswer: 1,
      },
    ],
    duration: 20,
    participants: 239,
    category: 'Computer Science',
    difficulty: 'Medium',
    year: 2,
    semester: 2,
    course: 'Data Structures & Alogrithms',
  },
  {
    id: '18',
    title: 'Mobile Application Development - Fundamentals',
    description: 'Test core concepts in modern mobile application development',
    creator: 'Prof. Michael Rodriguez',
    questions: [
      {
        id: '1',
        question: 'Which is a common concern in mobile app development?',
        options: [
          'Battery and performance optimization',
          'Desktop BIOS updates',
          'Server rack layout',
          'Printer driver installation',
        ],
        correctAnswer: 0,
      },
    ],
    duration: 19,
    participants: 209,
    category: 'Computer Science',
    difficulty: 'Medium',
    year: 2,
    semester: 2,
    course: 'Mobile Application Development',
  },
]

const mockParticipantScoresByQuiz: Record<string, ParticipantScoreSummary[]> = {
  '1': [
    { name: 'Nimal', score: 8, totalQuestions: 10 },
    { name: 'Kasuni', score: 7, totalQuestions: 10 },
  ],
  '6': [
    { name: 'Ishara', score: 6, totalQuestions: 10 },
    { name: 'Tharindu', score: 9, totalQuestions: 10 },
  ],
}

const mockQuizCommentsByQuiz: Record<string, QuizComment[]> = {
  '1': [
    {
      name: 'Nimal',
      message: 'Good quiz. Questions are clear and useful.',
      date: '3/23/2026, 9:15:00 AM',
    },
  ],
}

const mockQuizRatingsByQuiz: Record<string, QuizRating[]> = {
  '1': [
    {
      name: 'Kasuni',
      rating: 4,
      date: '3/23/2026, 10:00:00 AM',
    },
    {
      name: 'Ishara',
      rating: 5,
      date: '3/23/2026, 11:20:00 AM',
    },
  ],
}

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
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'results' | 'score'>('browse')
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [quizComments, setQuizComments] = useState<Record<string, QuizComment[]>>({})
  const [quizRatings, setQuizRatings] = useState<Record<string, QuizRating[]>>({})
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

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

  const handleDownloadResult = (result: QuizResult) => {
    const percentage = Math.round((result.score / result.totalQuestions) * 100)
    downloadCsv(`quiz-result-${result.quizId}-${Date.now()}.csv`, [
      ['Quiz Title', 'Date Taken', 'Score', 'Total Questions', 'Percentage'],
      [result.quizTitle, result.dateTaken, result.score, result.totalQuestions, `${percentage}%`],
    ])
  }

  const handleDownloadAllResults = () => {
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

    downloadCsv(`quiz-results-${Date.now()}.csv`, rows)
  }

  const handleCreateQuiz = (quizData: any) => {
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      ...quizData,
    }
    setQuizzes([newQuiz, ...quizzes])
    setActiveTab('browse')
  }

  const handleTakeQuiz = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId)
    if (quiz) {
      setPreviewQuiz(quiz)
    }
  }

  const handleStartQuizFromPreview = () => {
    if (previewQuiz) {
      setSelectedQuiz(previewQuiz)
      setPreviewQuiz(null)
    }
  }

  const handleCloseQuizPreview = () => {
    setPreviewQuiz(null)
  }

  const handleQuizComplete = (score: number, answers: number[]) => {
    if (selectedQuiz) {
      const result: QuizResult = {
        quizId: selectedQuiz.id,
        quizTitle: selectedQuiz.title,
        participantName: 'You',
        score,
        totalQuestions: selectedQuiz.questions.length,
        dateTaken: new Date().toLocaleDateString(),
      }
      setQuizResults([result, ...quizResults])
      
      // Update participants count
      setQuizzes(
        quizzes.map((q) =>
          q.id === selectedQuiz.id ? { ...q, participants: q.participants + 1 } : q
        )
      )
    }
  }

  const handleCancelQuiz = () => {
    setSelectedQuiz(null)
  }

  const handleAddQuizComment = (quizId: string, name: string, message: string) => {
    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      return
    }

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
  }

  const handleAddQuizRating = (quizId: string, name: string, rating: number) => {
    const trimmedName = name.trim()
    if (!trimmedName || rating < 1 || rating > 5) {
      return
    }

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

  const categorizedScoreData = yearSemesterBuckets.map((bucket) => {
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
            entry.course.length > 22 ? `${entry.course.slice(0, 22)}...` : entry.course,
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

  if (selectedQuiz) {
    const participantScores: ParticipantScoreSummary[] = [
      ...(mockParticipantScoresByQuiz[selectedQuiz.id] || []),
      ...quizResults
        .filter((result) => result.quizId === selectedQuiz.id)
        .map((result) => ({
          name: result.participantName,
          score: result.score,
          totalQuestions: result.totalQuestions,
        })),
    ]

    const combinedComments = [
      ...(mockQuizCommentsByQuiz[selectedQuiz.id] || []),
      ...(quizComments[selectedQuiz.id] || []),
    ]

    const combinedRatings = [
      ...(mockQuizRatingsByQuiz[selectedQuiz.id] || []),
      ...(quizRatings[selectedQuiz.id] || []),
    ]

    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <TakeQuiz
            quiz={selectedQuiz}
            participantScores={participantScores}
            quizComments={combinedComments}
            quizRatings={combinedRatings}
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
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
            {/* Year Selection */}
            {selectedYear === null ? (
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
            ) : selectedSemester === null ? (
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
            ) : selectedCourse === null ? (
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
                      quizzes
                        .filter((q) => q.year === selectedYear && q.semester === selectedSemester)
                        .map((q) => q.course)
                    )
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
                  )
                })()}
              </div>
            ) : (
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
                {(() => {
                  const filteredQuizzes = quizzes.filter(
                    (q) =>
                      q.year === selectedYear &&
                      q.semester === selectedSemester &&
                      q.course === selectedCourse
                  )
                  return filteredQuizzes.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No quizzes available
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        No quizzes found for Year {selectedYear}, Semester {selectedSemester}
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
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <CreateQuizForm onSubmit={handleCreateQuiz} />
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            {quizResults.length === 0 ? (
              <div className="text-center py-12">
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
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={handleDownloadAllResults}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download All Results
                  </button>
                </div>
                {quizResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {result.quizTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Completed on {result.dateTaken}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {Math.round((result.score / result.totalQuestions) * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.score} / {result.totalQuestions} correct
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadResult(result)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'score' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Score Summary Diagram</h3>
              <p className="text-muted-foreground">
                Categorized summary of courses by year and semester.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Total Quizzes</p>
                <p className="text-2xl font-bold text-foreground">{quizzes.length}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Year/Semester Groups</p>
                <p className="text-2xl font-bold text-foreground">{categorizedScoreData.length}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
                <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
              </div>
            </div>

            {categorizedScoreData.map((group) => (
              <div key={`${group.year}-${group.semester}`} className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  Year {group.year} - Semester {group.semester}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Course-wise participants, attempts, and average scores.
                </p>
                <ChartContainer
                  id={`score-${group.year}-${group.semester}`}
                  config={scoreChartConfig}
                  className="h-[360px] w-full"
                >
                  <BarChart data={group.chartData} margin={{ left: 12, right: 12, top: 16, bottom: 32 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="shortCourse"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={72}
                    />
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_, payload) =>
                            payload?.[0]?.payload?.course ?? 'Course summary'
                          }
                        />
                      }
                    />
                    <Bar yAxisId="left" dataKey="participants" fill="var(--color-participants)" radius={4} />
                    <Bar yAxisId="left" dataKey="attempts" fill="var(--color-attempts)" radius={4} />
                    <Bar yAxisId="right" dataKey="avgScore" fill="var(--color-avgScore)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </div>
            ))}
          </div>
        )}

        {previewQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{previewQuiz.title}</h3>
              <p className="text-muted-foreground mb-4">Previous comments and ratings</p>

              {(() => {
                const previewComments = [
                  ...(mockQuizCommentsByQuiz[previewQuiz.id] || []),
                  ...(quizComments[previewQuiz.id] || []),
                ]
                const previewRatings = [
                  ...(mockQuizRatingsByQuiz[previewQuiz.id] || []),
                  ...(quizRatings[previewQuiz.id] || []),
                ]

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
      </div>
    </AppLayout>
  )
}
