
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
import { BookOpen, Download, Search, Star, Trophy } from 'lucide-react'
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
    title: 'Internet & Web Technology - Core Concepts',
    description: 'Test your understanding of internet and web technology fundamentals',
    creator: 'Dr. James Wilson',
    questions: [
      {
        id: '1',
        question: 'Which protocol is primarily used to securely load web pages?',
        options: ['FTP', 'SMTP', 'HTTPS', 'SSH'],
        correctAnswer: 2,
      },
    ],
    duration: 18,
    participants: 191,
    category: 'Computer Science',
    difficulty: 'Easy',
    year: 1,
    semester: 2,
    course: 'Internet & Web Technology',
  },
  {
    id: '14',
    title: 'Information System & Data Modeling - Foundations',
    description: 'Assess practical concepts in information systems and data modeling',
    creator: 'Prof. Sarah Chen',
    questions: [
      {
        id: '1',
        question: 'Which model is commonly used for relational database design?',
        options: [
          'ER model',
          'OSI model',
          'Waterfall model',
          'MVC model',
        ],
        correctAnswer: 0,
      },
    ],
    duration: 14,
    participants: 170,
    category: 'Computer Science',
    difficulty: 'Easy',
    year: 1,
    semester: 2,
    course: 'Information System & Data Modeling',
  },
  {
    id: '15',
    title: 'English for Academic Purposes - Academic Writing',
    description: 'Practice English skills needed for academic communication',
    creator: 'Prof. Emily Davis',
    questions: [
      {
        id: '1',
        question: 'Which is most important in academic writing?',
        options: [
          'Informal slang usage',
          'Clear structure and evidence-based arguments',
          'Very long sentences only',
          'No references',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 15,
    participants: 177,
    category: 'Professional Development',
    difficulty: 'Easy',
    year: 1,
    semester: 2,
    course: 'English for Academic Purposes',
  },
  {
    id: '16',
    title: 'Software Process Modeling - Process Lifecycle',
    description: 'Understand software process models and lifecycle practices',
    creator: 'Alex Kumar',
    questions: [
      {
        id: '1',
        question: 'Which model is iterative and risk-driven?',
        options: ['Waterfall', 'Spiral', 'Big Bang', 'V-Model only'],
        correctAnswer: 1,
      },
    ],
    duration: 17,
    participants: 183,
    category: 'Computer Science',
    difficulty: 'Medium',
    year: 1,
    semester: 2,
    course: 'Software Process Modeling',
  },
  {
    id: '17',
    title: 'Object Oriented Concept - Core Principles',
    description: 'Evaluate your understanding of object-oriented concepts and design',
    creator: 'Dr. Robert Chen',
    questions: [
      {
        id: '1',
        question: 'Which OOP concept allows one interface with many implementations?',
        options: ['Encapsulation', 'Polymorphism', 'Compilation', 'Serialization'],
        correctAnswer: 1,
      },
    ],
    duration: 20,
    participants: 239,
    category: 'Computer Science',
    difficulty: 'Medium',
    year: 1,
    semester: 2,
    course: 'Object Oriented Concept',
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
  {
    id: '27',
    title: 'Business Management for IT - Strategic IT Management',
    description: 'Understand IT management and strategic business alignment',
    creator: 'Dr. Sarah Johnson',
    questions: [
      {
        id: '1',
        question: 'What is the primary goal of IT management in organizations?',
        options: [
          'To maximize hardware spending',
          'To align IT strategy with business objectives',
          'To eliminate all technology costs',
          'To prevent all system updates',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 20,
    participants: 198,
    category: 'Business',
    difficulty: 'Medium',
    year: 3,
    semester: 2,
    course: 'Business Management for IT',
  },
  {
    id: '28',
    title: 'Data Science & Analytics - Advanced Analytics',
    description: 'Explore data science techniques and analytics methodologies',
    creator: 'Prof. Michael Zhang',
    questions: [
      {
        id: '1',
        question: 'What is the primary purpose of exploratory data analysis?',
        options: [
          'To delete data',
          'To understand data patterns and characteristics',
          'To encrypt sensitive information',
          'To increase data size',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 22,
    participants: 215,
    category: 'Data Science',
    difficulty: 'Hard',
    year: 3,
    semester: 2,
    course: 'Data Science & Analytics',
  },
  {
    id: '29',
    title: 'Information Assurance & Security - Security Fundamentals',
    description: 'Master information security principles and assurance practices',
    creator: 'Prof. James McCarthy',
    questions: [
      {
        id: '1',
        question: 'What are the three pillars of information security (CIA triad)?',
        options: [
          'Confidentiality, Integrity, Availability',
          'Computer, Internet, Application',
          'Centralized, Integrated, Automated',
          'Capability, Implementation, Assessment',
        ],
        correctAnswer: 0,
      },
    ],
    duration: 21,
    participants: 187,
    category: 'Security',
    difficulty: 'Hard',
    year: 3,
    semester: 2,
    course: 'Information Assurance & Security',
  },
  {
    id: '30',
    title: 'Human Computer Interaction - User Experience Design',
    description: 'Learn HCI principles and user experience design methodologies',
    creator: 'Dr. Emma Wilson',
    questions: [
      {
        id: '1',
        question: 'What is the primary focus of user-centered design?',
        options: [
          'Maximizing technical complexity',
          'Understanding user needs and designing accordingly',
          'Reducing design costs',
          'Using the latest technologies only',
        ],
        correctAnswer: 1,
      },
    ],
    duration: 18,
    participants: 172,
    category: 'Design',
    difficulty: 'Medium',
    year: 3,
    semester: 2,
    course: 'Human Computer Interaction',
  },
]

const ensureThreeQuestions = (quiz: Quiz): Quiz => {
  if (quiz.questions.length >= 3) {
    return quiz
  }

  const topic = quiz.course || quiz.category
  const generatedQuestions = [
    {
      id: `auto-${quiz.id}-1`,
      question: `Which statement best describes a core concept in ${topic}?`,
      options: [
        'Only memorizing definitions matters',
        'Understanding concepts and applying them to problems is essential',
        'There is always only one way to solve tasks',
        'Practice is not required if theory is known',
      ],
      correctAnswer: 1,
    },
    {
      id: `auto-${quiz.id}-2`,
      question: `Which practice most improves performance in ${topic}?`,
      options: [
        'Skipping revision',
        'Ignoring feedback',
        'Regular practice with feedback and reflection',
        'Studying only the night before',
      ],
      correctAnswer: 2,
    },
    {
      id: `auto-${quiz.id}-3`,
      question: `When solving a ${topic} problem, what should you do first?`,
      options: [
        'Guess an answer immediately',
        'Identify requirements and constraints',
        'Avoid reading the full question',
        'Pick the longest option',
      ],
      correctAnswer: 1,
    },
  ]

  const needed = 3 - quiz.questions.length
  return {
    ...quiz,
    questions: [...quiz.questions, ...generatedQuestions.slice(0, needed)],
  }
}

const normalizedQuizzes: Quiz[] = mockQuizzes.map(ensureThreeQuestions)

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

const mockParticipantScoresByQuiz: Record<string, ParticipantScoreSummary[]> =
  normalizedQuizzes.reduce((acc, quiz) => {
    acc[quiz.id] = studentNames.map((name, index) => {
      const key = `${quiz.id}-${name}-${index}`
      const scoreSeed = key.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
      const score = scoreSeed % (quiz.questions.length + 1)
      return {
        name,
        score,
        totalQuestions: quiz.questions.length,
      }
    })

    return acc
  }, {} as Record<string, ParticipantScoreSummary[]>)

const baseQuizCommentsByQuiz: Record<string, QuizComment[]> = {
  '1': [
    {
      name: 'Nimal',
      message: 'Good quiz. Questions are clear and useful.',
      date: '3/23/2026, 9:15:00 AM',
    },
    {
      name: 'Sajee',
      message: 'Nice for quick revision before class.',
      date: '3/23/2026, 12:05:00 PM',
    },
  ],
  '2': [
    {
      name: 'Malithi',
      message: 'Algebra section was balanced and fair.',
      date: '3/22/2026, 4:10:00 PM',
    },
  ],
  '6': [
    {
      name: 'Tharushi',
      message: 'Pattern-based questions were very practical.',
      date: '3/21/2026, 8:40:00 AM',
    },
    {
      name: 'Dilan',
      message: 'A bit challenging, but helpful examples.',
      date: '3/21/2026, 9:25:00 AM',
    },
  ],
}

const baseQuizRatingsByQuiz: Record<string, QuizRating[]> = {
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
  '2': [
    {
      name: 'Kasun',
      rating: 4,
      date: '3/22/2026, 4:15:00 PM',
    },
    {
      name: 'Malithi',
      rating: 5,
      date: '3/22/2026, 5:02:00 PM',
    },
  ],
  '6': [
    {
      name: 'Ruvin',
      rating: 5,
      date: '3/21/2026, 10:10:00 AM',
    },
    {
      name: 'Tharushi',
      rating: 4,
      date: '3/21/2026, 10:22:00 AM',
    },
  ],
}

const mockQuizCommentsByQuiz: Record<string, QuizComment[]> = normalizedQuizzes.reduce(
  (acc, quiz, index) => {
    const existing = baseQuizCommentsByQuiz[quiz.id] || []
    const fallbackComments: QuizComment[] = [
      {
        name: `Student ${index + 1}`,
        message: `This ${quiz.course} quiz was helpful for revision.`,
        date: '3/24/2026, 9:00:00 AM',
      },
      {
        name: `Learner ${index + 1}`,
        message: 'Good balance of theory and practical questions.',
        date: '3/24/2026, 10:20:00 AM',
      },
    ]

    acc[quiz.id] = existing.length > 0 ? [...existing, fallbackComments[0]] : fallbackComments
    return acc
  },
  {} as Record<string, QuizComment[]>,
)

const mockQuizRatingsByQuiz: Record<string, QuizRating[]> = normalizedQuizzes.reduce(
  (acc, quiz, index) => {
    const existing = baseQuizRatingsByQuiz[quiz.id] || []
    const fallbackRatings: QuizRating[] = [
      {
        name: `Student ${index + 1}`,
        rating: 4,
        date: '3/24/2026, 10:45:00 AM',
      },
      {
        name: `Learner ${index + 1}`,
        rating: 5,
        date: '3/24/2026, 11:05:00 AM',
      },
    ]

    acc[quiz.id] = existing.length > 0 ? [...existing, fallbackRatings[0]] : fallbackRatings
    return acc
  },
  {} as Record<string, QuizRating[]>,
)

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
  const [quizzes, setQuizzes] = useState<Quiz[]>(normalizedQuizzes)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [quizComments, setQuizComments] = useState<Record<string, QuizComment[]>>({})
  const [quizRatings, setQuizRatings] = useState<Record<string, QuizRating[]>>({})
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [browseCourseSearch, setBrowseCourseSearch] = useState('')
  const [browseQuizSearch, setBrowseQuizSearch] = useState('')
  const [resultsSearch, setResultsSearch] = useState('')
  const [scoreSearch, setScoreSearch] = useState('')
  const [hoveredCourseKey, setHoveredCourseKey] = useState<string | null>(null)

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

  // Fetch quizzes from database on page load
  useEffect(() => {
    const fetchQuizzesFromDatabase = async () => {
      try {
        console.log('📚 Fetching quizzes from database...')
        const response = await fetch('/api/quiz')
        const result = await response.json()

        if (result.status === 'success' && Array.isArray(result.data)) {
          console.log('✅ Quizzes loaded from database:', result.data.length, 'quizzes')
          // Map database quizzes to Quiz type and merge with mock data
          const dbQuizzes = result.data.map((q: any) => ({
            id: q.id.toString(),
            title: q.title,
            description: q.description,
            creator: q.creator,
            questions: [], // Questions will be loaded separately if needed
            duration: q.duration,
            participants: q.participants,
            category: q.category,
            difficulty: q.difficulty,
            year: q.year,
            semester: q.semester,
            course: q.course,
          }))
          
          // Set quizzes from database, then add mock data
          setQuizzes([...dbQuizzes, ...normalizedQuizzes])
        } else {
          console.log('⚠️ No quizzes found in database, using mock data')
          setQuizzes(normalizedQuizzes)
        }
      } catch (error) {
        console.error('❌ Error fetching quizzes from database:', error)
        setQuizzes(normalizedQuizzes)
      }
    }

    fetchQuizzesFromDatabase()
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

  const handleCreateQuiz = async (quizData: any) => {
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
      
      // Add to frontend state
      const newQuiz: Quiz = {
        id: result.data.id.toString(),
        ...quizData,
        participants: 0,
      }
      setQuizzes([newQuiz, ...quizzes])
      setActiveTab('browse')
      alert('Quiz created successfully!')
    } catch (error) {
      console.error('❌ Failed to create quiz:', error)
      alert('Failed to create quiz. Check console for details.')
    }
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

  const participantAttemptRows = [
    ...Object.entries(mockParticipantScoresByQuiz).flatMap(([quizId, entries]) => {
      const quiz = quizzes.find((q) => q.id === quizId)
      if (!quiz) return []

      return entries.map((entry) => ({
        name: entry.name,
        quizId,
        year: quiz.year,
        semester: quiz.semester,
        course: quiz.course,
        quizTitle: quiz.title,
        percentage: Math.round((entry.score / entry.totalQuestions) * 100),
      }))
    }),
    ...quizResults.map((result) => {
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
    }),
  ]

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

  const courseTakerScoreByYearSemester = Array.from(
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

  const createQuizCourseOptions = Array.from(
    quizzes.reduce((map, quiz) => {
      const key = `${quiz.year}-${quiz.semester}-${quiz.course}`
      if (!map.has(key)) {
        map.set(key, {
          year: quiz.year,
          semester: quiz.semester,
          course: quiz.course,
          category: quiz.category,
        })
      }
      return map
    }, new Map<string, { year: number; semester: number; course: string; category: string }>()),
  ).map(([, value]) => value)

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
      <div className="w-full py-6 px-4 md:px-6 lg:px-8">
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
                      q.year === selectedYear &&
                      q.semester === selectedSemester &&
                      q.course === selectedCourse &&
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
                <div>
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
                {filteredResults.map((result, index) => (
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

            <div className="bg-card border border-border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Score View</label>
                <select
                  value={scoreView}
                  onChange={(e) => setScoreView(e.target.value as 'courseByYear' | 'quizTakers')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="courseByYear">Course Scores by Year</option>
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
                    placeholder="Search by course name"
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
                    {availableScoreYears.map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Total Quizzes</p>
                <p className="text-2xl font-bold text-foreground">{quizzes.length}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Year/Semester Groups</p>
                <p className="text-2xl font-bold text-foreground">
                  {scoreView === 'courseByYear'
                    ? searchedCategorizedScoreData.length
                    : searchedCourseTakerScoreByYearSemester.length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
                <p className="text-2xl font-bold text-foreground">
                  {scoreView === 'courseByYear' ? totalAttempts : participantAttemptRows.length}
                </p>
              </div>
            </div>

            {scoreView === 'courseByYear' ? (
              searchedCategorizedScoreData.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">No course score data for the selected year.</p>
                </div>
              ) : (
                searchedCategorizedScoreData.map((group) => (
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
                ))
              )
            ) : (
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="text-lg font-semibold text-foreground mb-1">Quiz Takers Score Summary</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Score summary for students who took quizzes across all courses.
                </p>

                <div className="space-y-4">
                  {searchedCourseTakerScoreByYearSemester.map((yearGroup) => (
                    <div
                      key={`${yearGroup.year}-${yearGroup.semester}`}
                      className="border border-border rounded-lg p-4"
                    >
                      <h5 className="text-base font-semibold text-foreground mb-3">
                        Year {yearGroup.year} - Semester {yearGroup.semester}
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Course</th>
                              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Takers</th>
                              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Attempts</th>
                              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Average Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {yearGroup.rows.map((courseRow) => (
                              <tr
                                key={`${courseRow.year}-${courseRow.semester}-${courseRow.course}`}
                                className="border-b border-border/60"
                              >
                                <td className="py-2 pr-4 text-foreground font-medium">
                                  <div
                                    className="relative inline-block"
                                    onMouseEnter={() =>
                                      setHoveredCourseKey(
                                        `${courseRow.year}-${courseRow.semester}-${courseRow.course}`,
                                      )
                                    }
                                    onMouseLeave={() => setHoveredCourseKey(null)}
                                  >
                                    <span className="cursor-help underline decoration-dotted underline-offset-4">
                                      {courseRow.course}
                                    </span>

                                    {hoveredCourseKey ===
                                      `${courseRow.year}-${courseRow.semester}-${courseRow.course}` && (
                                      <div className="absolute left-0 top-full mt-2 z-20 min-w-[420px] max-w-[520px] rounded-lg border border-border bg-card p-3 shadow-xl">
                                        <p className="text-xs font-semibold text-foreground mb-2">
                                          Child Scores
                                        </p>
                                        {(childScoresByCourseGroup[
                                          `${courseRow.year}-${courseRow.semester}-${courseRow.course}`
                                        ] || []).length === 0 ? (
                                          <p className="text-xs text-muted-foreground">
                                            No child scores yet.
                                          </p>
                                        ) : (
                                          <div>
                                            <p className="text-[11px] text-muted-foreground mb-2">
                                              Student name and score
                                            </p>
                                            <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                                              {(childScoresByCourseGroup[
                                                `${courseRow.year}-${courseRow.semester}-${courseRow.course}`
                                              ] || []).map((child) => (
                                                <div key={child.name} className="space-y-1">
                                                  <div className="flex items-center justify-between gap-3 text-[11px]">
                                                    <span className="text-foreground font-medium truncate">
                                                      {child.name}
                                                    </span>
                                                    <span className="text-foreground font-semibold">
                                                      {child.averageScore}%
                                                    </span>
                                                  </div>
                                                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                      className={`h-full rounded-full transition-all ${
                                                        child.averageScore >= 75
                                                          ? 'bg-green-500'
                                                          : child.averageScore >= 50
                                                          ? 'bg-yellow-500'
                                                          : 'bg-red-500'
                                                      }`}
                                                      style={{ width: `${Math.max(0, Math.min(100, child.averageScore))}%` }}
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 pr-4 text-foreground">{courseRow.takers}</td>
                                <td className="py-2 pr-4 text-foreground">{courseRow.attempts}</td>
                                <td className="py-2 pr-4 text-foreground">{courseRow.averageScore}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {participantScoreData.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-base font-semibold text-foreground mb-2">Top Takers</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Name</th>
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Attempts</th>
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Quizzes Taken</th>
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Average Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participantScoreData.slice(0, 8).map((participant) => (
                            <tr key={participant.name} className="border-b border-border/60">
                              <td className="py-2 pr-4 text-foreground font-medium">{participant.name}</td>
                              <td className="py-2 pr-4 text-foreground">{participant.attempts}</td>
                              <td className="py-2 pr-4 text-foreground">{participant.quizzesTaken}</td>
                              <td className="py-2 pr-4 text-foreground">{participant.averageScore}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
