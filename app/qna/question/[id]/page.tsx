"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ArrowBigUp, ArrowBigDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import AnswerCard from "@/components/qna/AnswerCard"

// All mock questions data
const allMockQuestions = [
  {
    id: "1",
    title: "Best practices for building scalable web applications?",
    content: "I'm starting a new project using modern frameworks. What are the best practices for building scalable applications?",
    author: {
      id: "user1",
      name: "Kamal Perera",
      avatar: "https://avatar.vercel.sh/kamal"
    },
    upvotes: 15,
    downvotes: 2,
    category: "it3030",
    categoryName: "IT3030 - Programming Applications and Frameworks",
    createdAt: new Date("2026-03-01T10:00:00"),
    answers: [
      {
        id: "a1",
        content: "Use modular architecture with separation of concerns. Consider using design patterns like MVC, clean architecture, or microservices for large-scale applications.",
        author: {
          id: "user4",
          name: "Chamara Wickramasinghe",
          avatar: "https://avatar.vercel.sh/chamara"
        },
        upvotes: 8,
        downvotes: 0,
        createdAt: new Date("2026-03-01T14:30:00"),
        comments: []
      },
      {
        id: "a2",
        content: "Implement caching strategies and use load balancing. Also consider using containerization with Docker and orchestration with Kubernetes.",
        author: {
          id: "user10",
          name: "Alex Kumar",
          avatar: "https://avatar.vercel.sh/alex"
        },
        upvotes: 6,
        downvotes: 0,
        createdAt: new Date("2026-03-01T15:00:00"),
        comments: []
      },
      {
        id: "a3",
        content: "Don't forget about monitoring and logging. Use tools like Prometheus, ELK stack, or similar for observability.",
        author: {
          id: "user11",
          name: "Sarah Chen",
          avatar: "https://avatar.vercel.sh/sarah"
        },
        upvotes: 4,
        downvotes: 0,
        createdAt: new Date("2026-03-01T16:00:00"),
        comments: []
      }
    ]
  },
  {
    id: "2",
    title: "Database design for large-scale systems?",
    content: "What are the key considerations when designing a database for a large-scale system? SQL vs NoSQL?",
    author: {
      id: "user2",
      name: "Nimal Silva",
      avatar: "https://avatar.vercel.sh/nimal"
    },
    upvotes: 8,
    downvotes: 1,
    category: "it3020",
    categoryName: "IT3020 - Database Systems",
    createdAt: new Date("2026-03-02T14:30:00"),
    answers: [
      {
        id: "a1",
        content: "Choose SQL for structured data with ACID requirements. NoSQL is better for unstructured, rapidly evolving data. Consider data consistency, scalability, and query patterns.",
        author: {
          id: "user6",
          name: "Priya Sharma",
          avatar: "https://avatar.vercel.sh/priya"
        },
        upvotes: 12,
        downvotes: 0,
        createdAt: new Date("2026-03-02T15:00:00"),
        comments: []
      },
      {
        id: "a2",
        content: "Think about sharding and partitioning strategies for scaling horizontally. Indexing is also crucial for query performance.",
        author: {
          id: "user12",
          name: "James Wilson",
          avatar: "https://avatar.vercel.sh/james"
        },
        upvotes: 9,
        downvotes: 0,
        createdAt: new Date("2026-03-02T16:00:00"),
        comments: []
      },
      {
        id: "a3",
        content: "Consider using a combination - SQL for transactional data and NoSQL for caching and analytics.",
        author: {
          id: "user13",
          name: "Monica Perera",
          avatar: "https://avatar.vercel.sh/monica"
        },
        upvotes: 7,
        downvotes: 0,
        createdAt: new Date("2026-03-02T16:30:00"),
        comments: []
      },
      {
        id: "a4",
        content: "Always backup your data and test your disaster recovery plan before going live.",
        author: {
          id: "user14",
          name: "David Lee",
          avatar: "https://avatar.vercel.sh/david"
        },
        upvotes: 5,
        downvotes: 0,
        createdAt: new Date("2026-03-02T17:00:00"),
        comments: []
      },
      {
        id: "a5",
        content: "Use connection pooling to manage database connections efficiently and reduce overhead.",
        author: {
          id: "user15",
          name: "Emma Brown",
          avatar: "https://avatar.vercel.sh/emma"
        },
        upvotes: 3,
        downvotes: 0,
        createdAt: new Date("2026-03-02T17:30:00"),
        comments: []
      }
    ]
  },
  {
    id: "3",
    title: "Network architecture for distributed systems?",
    content: "How do I design a network that can handle distributed systems? Any best practices for network management?",
    author: {
      id: "user3",
      name: "Sachini Jayawardena",
      avatar: "https://avatar.vercel.sh/sachini"
    },
    upvotes: 22,
    downvotes: 0,
    category: "it3010",
    categoryName: "IT3010 - Network Design and Management",
    createdAt: new Date("2026-03-03T09:15:00"),
    answers: [
      {
        id: "a1",
        content: "Implement load balancing, use CDNs for geographic distribution, ensure redundancy, and monitor network health. Consider latency, bandwidth, and fault tolerance.",
        author: {
          id: "user7",
          name: "Kasun Perera",
          avatar: "https://avatar.vercel.sh/kasun"
        },
        upvotes: 15,
        downvotes: 0,
        createdAt: new Date("2026-03-03T11:00:00"),
        comments: []
      },
      {
        id: "a2",
        content: "Use service mesh architecture like Istio for better traffic management and observability.",
        author: {
          id: "user16",
          name: "Ravi Nair",
          avatar: "https://avatar.vercel.sh/ravi"
        },
        upvotes: 11,
        downvotes: 0,
        createdAt: new Date("2026-03-03T11:30:00"),
        comments: []
      },
      {
        id: "a3",
        content: "Implement circuit breakers and retry logic to handle failures gracefully.",
        author: {
          id: "user17",
          name: "Sophie Martin",
          avatar: "https://avatar.vercel.sh/sophie"
        },
        upvotes: 9,
        downvotes: 0,
        createdAt: new Date("2026-03-03T12:00:00"),
        comments: []
      },
      {
        id: "a4",
        content: "Consider API gateways for centralized request routing and authentication.",
        author: {
          id: "user18",
          name: "Marcus Johnson",
          avatar: "https://avatar.vercel.sh/marcus"
        },
        upvotes: 8,
        downvotes: 0,
        createdAt: new Date("2026-03-03T12:30:00"),
        comments: []
      },
      {
        id: "a5",
        content: "Use message queues like RabbitMQ or Kafka for asynchronous communication between services.",
        author: {
          id: "user19",
          name: "Lisa Anderson",
          avatar: "https://avatar.vercel.sh/lisa"
        },
        upvotes: 6,
        downvotes: 0,
        createdAt: new Date("2026-03-03T13:00:00"),
        comments: []
      },
      {
        id: "a6",
        content: "Implement proper logging and trace IDs to track requests across services.",
        author: {
          id: "user20",
          name: "Chris Taylor",
          avatar: "https://avatar.vercel.sh/chris"
        },
        upvotes: 5,
        downvotes: 0,
        createdAt: new Date("2026-03-03T13:30:00"),
        comments: []
      },
      {
        id: "a7",
        content: "Don't forget about security - implement TLS/SSL, VPNs, and network isolation.",
        author: {
          id: "user21",
          name: "Nina White",
          avatar: "https://avatar.vercel.sh/nina"
        },
        upvotes: 4,
        downvotes: 0,
        createdAt: new Date("2026-03-03T14:00:00"),
        comments: []
      }
    ]
  },
  {
    id: "4",
    title: "How to manage IT project timelines effectively?",
    content: "Any tips on managing project timelines and scope in IT projects? How to handle scope creep?",
    author: {
      id: "user4",
      name: "Janaka Wijesinghe",
      avatar: "https://avatar.vercel.sh/janaka"
    },
    upvotes: 32,
    downvotes: 1,
    category: "it3040",
    categoryName: "IT3040 - IT Project Management",
    createdAt: new Date("2026-03-02T16:45:00"),
    answers: [
      {
        id: "a1",
        content: "Use Agile or Scrum methodologies. Define clear requirements upfront, use time-boxing for sprints, maintain a prioritized backlog, and communicate scope changes early.",
        author: {
          id: "user8",
          name: "Nadee Silva",
          avatar: "https://avatar.vercel.sh/nadee"
        },
        upvotes: 18,
        downvotes: 0,
        createdAt: new Date("2026-03-02T17:30:00"),
        comments: []
      },
      {
        id: "a2",
        content: "Implement risk management - identify potential risks early and create mitigation strategies.",
        author: {
          id: "user22",
          name: "Robert Garcia",
          avatar: "https://avatar.vercel.sh/robert"
        },
        upvotes: 14,
        downvotes: 0,
        createdAt: new Date("2026-03-02T18:00:00"),
        comments: []
      },
      {
        id: "a3",
        content: "Use project management tools like Jira, Asana, or Monday.com for better tracking and visibility.",
        author: {
          id: "user23",
          name: "Catherine Zhou",
          avatar: "https://avatar.vercel.sh/catherine"
        },
        upvotes: 12,
        downvotes: 0,
        createdAt: new Date("2026-03-02T18:30:00"),
        comments: []
      },
      {
        id: "a4",
        content: "Regular status meetings and stakeholder communication are essential. Keep everyone aligned.",
        author: {
          id: "user24",
          name: "Michael Brown",
          avatar: "https://avatar.vercel.sh/michael"
        },
        upvotes: 10,
        downvotes: 0,
        createdAt: new Date("2026-03-02T19:00:00"),
        comments: []
      },
      {
        id: "a5",
        content: "Buffer for unknown delays - add contingency time to estimates. Most projects slip timelines.",
        author: {
          id: "user25",
          name: "Jessica Peters",
          avatar: "https://avatar.vercel.sh/jessica"
        },
        upvotes: 9,
        downvotes: 0,
        createdAt: new Date("2026-03-02T19:30:00"),
        comments: []
      },
      {
        id: "a6",
        content: "Document everything - requirements, decisions, changes, and their impact on timeline.",
        author: {
          id: "user26",
          name: "Kevin Park",
          avatar: "https://avatar.vercel.sh/kevin"
        },
        upvotes: 7,
        downvotes: 0,
        createdAt: new Date("2026-03-02T20:00:00"),
        comments: []
      },
      {
        id: "a7",
        content: "Use velocity tracking to measure team productivity and improve estimates.",
        author: {
          id: "user27",
          name: "Laura Martinez",
          avatar: "https://avatar.vercel.sh/laura"
        },
        upvotes: 5,
        downvotes: 0,
        createdAt: new Date("2026-03-02T20:30:00"),
        comments: []
      },
      {
        id: "a8",
        content: "Escalate issues immediately when you see timeline risks. Don't wait until it's critical.",
        author: {
          id: "user28",
          name: "Thomas Fischer",
          avatar: "https://avatar.vercel.sh/thomas"
        },
        upvotes: 3,
        downvotes: 0,
        createdAt: new Date("2026-03-02T21:00:00"),
        comments: []
      }
    ]
  },
  {
    id: "5",
    title: "Key employability skills for IT professionals?",
    content: "What are the most important employability skills I should focus on developing for my IT career?",
    author: {
      id: "user5",
      name: "Ravindra Karunarathne",
      avatar: "https://avatar.vercel.sh/ravindra"
    },
    upvotes: 11,
    downvotes: 0,
    category: "it3050",
    categoryName: "IT3050 - Employability Skills Development - Seminar",
    createdAt: new Date("2026-03-02T11:20:00"),
    answers: [
      {
        id: "a1",
        content: "Communication, teamwork, time management, continuous learning, problem-solving, and adaptability. Also develop soft skills like leadership and emotional intelligence.",
        author: {
          id: "user9",
          name: "Anura Gunawardena",
          avatar: "https://avatar.vercel.sh/anura"
        },
        upvotes: 20,
        downvotes: 0,
        createdAt: new Date("2026-03-02T12:00:00"),
        comments: []
      },
      {
        id: "a2",
        content: "Build a strong portfolio showcasing your projects and contributions. GitHub is your best friend.",
        author: {
          id: "user29",
          name: "Victoria Hall",
          avatar: "https://avatar.vercel.sh/victoria"
        },
        upvotes: 15,
        downvotes: 0,
        createdAt: new Date("2026-03-02T12:30:00"),
        comments: []
      },
      {
        id: "a3",
        content: "Networking is key - attend conferences, meetups, and connect with other professionals in your field.",
        author: {
          id: "user30",
          name: "Oliver Schmidt",
          avatar: "https://avatar.vercel.sh/oliver"
        },
        upvotes: 11,
        downvotes: 0,
        createdAt: new Date("2026-03-02T13:00:00"),
        comments: []
      },
      {
        id: "a4",
        content: "Don't just focus on technical skills - develop presentation, writing, and business acumen too.",
        author: {
          id: "user31",
          name: "Rachel Thompson",
          avatar: "https://avatar.vercel.sh/rachel"
        },
        upvotes: 8,
        downvotes: 0,
        createdAt: new Date("2026-03-02T13:30:00"),
        comments: []
      }
    ]
  }
]

export default function QuestionDetailPage() {
  const params = useParams()
  const [question, setQuestion] = useState<typeof allMockQuestions[0] | null>(null)
  const [answerContent, setAnswerContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  // Fetch the correct question based on ID parameter
  useEffect(() => {
    if (params.id) {
      // Load saved questions from localStorage
      const savedQuestions = JSON.parse(localStorage.getItem("qna_questions") || "[]")
      const allQuestions = [...allMockQuestions, ...savedQuestions]
      
      // Find the question matching the ID
      let foundQuestion = allQuestions.find((q: any) => q.id === params.id)
      
      // Ensure the question has answers array
      if (foundQuestion) {
        if (!foundQuestion.answers) {
          foundQuestion.answers = []
        }
        setQuestion(foundQuestion)
      } else {
        setQuestion(null)
      }
    }
  }, [params.id])

  const handleVote = (type: "up" | "down") => {
    // TODO: API call to vote
    console.log("Vote:", type)
  }

  const handlePostAnswer = async () => {
    if (!answerContent.trim() || !question) return
    
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
    if (!question) return
    
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

  const netQuestionVotes = question ? question.upvotes - question.downvotes : 0

  if (!question) {
    return (
      <div className="container max-w-3xl mx-auto py-6 px-4">
        <Link 
          href="/qna"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to questions
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Question not found</p>
        </div>
      </div>
    )
  }

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