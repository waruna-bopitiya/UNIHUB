
'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { QuizCard } from '@/components/quiz/quiz-card'
import { CreateQuizForm } from '@/components/quiz/create-quiz-form'
import { TakeQuiz } from '@/components/quiz/take-quiz'
import { useState } from 'react'
import { BookOpen, Download, Trophy } from 'lucide-react'

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
}

interface QuizResult {
  quizId: string
  quizTitle: string
  score: number
  totalQuestions: number
  dateTaken: string
}

const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Advanced React Hooks & Patterns',
    description: 'Test your knowledge on React hooks, custom hooks, and advanced patterns',
    creator: 'Prof. Sarah Chen',
    questions: [
      {
        id: '1',
        question: 'What is the purpose of useEffect hook in React?',
        options: [
          'To manage component state',
          'To perform side effects in function components',
          'To create custom hooks',
          'To handle routing',
        ],
        correctAnswer: 1,
      },
      {
        id: '2',
        question: 'Which hook would you use to memoize a value?',
        options: ['useState', 'useCallback', 'useMemo', 'useRef'],
        correctAnswer: 2,
      },
      {
        id: '3',
        question: 'What does useContext hook do?',
        options: [
          'Creates a new context',
          'Consumes a context value',
          'Updates context value',
          'Deletes a context',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 15,
    participants: 234,
    category: 'Computer Science',
    difficulty: 'Medium',
    year: 1,
    semester: 1,
  },
  {
    id: '2',
    title: 'Linear Algebra Fundamentals',
    description: 'Test your understanding of matrices, vectors, and linear transformations',
    creator: 'Dr. James Wilson',
    questions: [
      {
        id: '1',
        question: 'What is the determinant of a 2x2 identity matrix?',
        options: ['0', '1', '2', 'Undefined'],
        correctAnswer: 1,
      },
      {
        id: '2',
        question: 'Which operation is NOT commutative for matrices?',
        options: ['Addition', 'Multiplication', 'Scalar multiplication', 'None of the above'],
        correctAnswer: 1,
      },
    ],
    duration: 20,
    participants: 189,
    category: 'Mathematics',
    difficulty: 'Hard',
    year: 1,
    semester: 2,
  },
  {
    id: '3',
    title: 'Introduction to JavaScript ES6',
    description: 'Learn about modern JavaScript features and syntax',
    creator: 'Alex Kumar',
    questions: [
      {
        id: '1',
        question: 'What is the difference between let and const?',
        options: [
          'let is block-scoped, const is function-scoped',
          'const cannot be reassigned, let can be',
          'There is no difference',
          'let is for strings, const is for numbers',
        ],
        correctAnswer: 1,
      },
      {
        id: '2',
        question: 'What does the spread operator (...) do?',
        options: [
          'Deletes elements from an array',
          'Expands an iterable into individual elements',
          'Creates a loop',
          'Checks if an element exists',
        ],
        correctAnswer: 1,
      },
      {
        id: '3',
        question: 'What is a Promise in JavaScript?',
        options: [
          'A type of variable',
          'An object representing eventual completion or failure of an async operation',
          'A loop structure',
          'A conditional statement',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 10,
    participants: 412,
    category: 'Computer Science',
    difficulty: 'Easy',
    year: 2,
    semester: 1,
  },
  {
    id: '4',
    title: 'Web Development Basics',
    description: 'Learn the fundamentals of web development',
    creator: 'Prof. Emily Davis',
    questions: [
      {
        id: '1',
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlinks and Text Markup Language',
        ],
        correctAnswer: 0,
      },
    ],
    duration: 12,
    participants: 356,
    category: 'Computer Science',
    difficulty: 'Easy',
    year: 2,
    semester: 2,
  },
  {
    id: '5',
    title: 'Database Design and SQL',
    description: 'Master SQL and relational database concepts',
    creator: 'Dr. Robert Chen',
    questions: [
      {
        id: '1',
        question: 'What is a primary key?',
        options: [
          'A key that opens databases',
          'A unique identifier for each record in a table',
          'The first key in a keyboard',
          'A password for the database',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 18,
    participants: 298,
    category: 'Computer Science',
    difficulty: 'Medium',
    year: 3,
    semester: 1,
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
    year: 3,
    semester: 2,
  },
  {
    id: '7',
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to machine learning concepts and algorithms',
    creator: 'Dr. Lisa Anderson',
    questions: [
      {
        id: '1',
        question: 'What is supervised learning?',
        options: [
          'Learning with a teacher/labeled data',
          'Learning without labels',
          'Learning with supervision camera',
          'A type of unsupervised learning',
        ],
        correctAnswer: 0,
      },
    ],
    duration: 25,
    participants: 189,
    category: 'Computer Science',
    difficulty: 'Hard',
    year: 4,
    semester: 1,
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
  },
]

export default function QuizPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'results'>('browse')
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)

  const downloadCsv = (fileName: string, rows: string[][]) => {
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
      setSelectedQuiz(quiz)
    }
  }

  const handleQuizComplete = (score: number, answers: number[]) => {
    if (selectedQuiz) {
      const result: QuizResult = {
        quizId: selectedQuiz.id,
        quizTitle: selectedQuiz.title,
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

  if (selectedQuiz) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <TakeQuiz
            quiz={selectedQuiz}
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
                      onClick={() => setSelectedSemester(semester)}
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
            ) : (
              /* Quiz List */
              <div>
                <button
                  onClick={() => {
                    setSelectedYear(null)
                    setSelectedSemester(null)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  ← Back to Years
                </button>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Year {selectedYear} - Semester {selectedSemester}
                </h2>
                {(() => {
                  const filteredQuizzes = quizzes.filter(
                    (q) => q.year === selectedYear && q.semester === selectedSemester
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
      </div>
    </AppLayout>
  )
}
