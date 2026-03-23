"use client"

import { useState } from "react"
import { AppLayout } from '@/components/layout/app-layout'
import { CreatePost } from '@/components/feed/create-post'
import { PostCard } from '@/components/feed/post-card'
import QuestionCard from '@/components/qna/QuestionCard'
import Link from "next/link"
import { MessageCircle, Users, TrendingUp, Award } from "lucide-react"

// Existing mock posts (general feed)
const mockPosts = [
  {
    id: '1',
    author: {
      name: 'Prof. Sarah Chen',
      avatar: 'SC',
      role: 'Computer Science Tutor',
    },
    timestamp: '2 hours ago',
    content: 'Just wrapped up an advanced React session! Here are some key takeaways: Understanding hooks is crucial for modern React development. Remember to use useCallback and useMemo wisely to avoid performance pitfalls.',
    category: 'Study Material',
    likes: 248,
    comments: 32,
    shares: 18,
  },
  {
    id: '2',
    author: {
      name: 'Alex Kumar',
      avatar: 'AK',
      role: 'Mathematics Student',
    },
    timestamp: '4 hours ago',
    content: "Does anyone have resources on differential equations? I'm struggling with the integration techniques covered in today's lecture. Any study groups forming this semester?",
    category: 'Question',
    likes: 65,
    comments: 18,
    shares: 4,
  },
  {
    id: '3',
    author: {
      name: 'Dr. James Wilson',
      avatar: 'JW',
      role: 'Economics Professor',
    },
    timestamp: '6 hours ago',
    content: 'Exciting opportunity! I\'m organizing a live discussion on "Economic Trends 2024" next Tuesday at 7 PM. We\'ll have industry experts joining us. Register below to get access and submit your questions!',
    category: 'Event',
    likes: 412,
    comments: 89,
    shares: 156,
  },
]

// Q&A mock data (Peer2Peer) - English only
const mockQuestions = [
  {
    id: "q1",
    title: "How to create API routes in Next.js? (Need peer help)",
    content: "I'm new to Next.js. Can someone explain how to create API routes? How do I work with route.ts files in the app directory?",
    author: {
      name: "Kamal Perera",
      avatar: "https://avatar.vercel.sh/kamal",
    },
    upvotes: 15,
    downvotes: 2,
    answers: 3,
    category: "programming",
    categoryName: "Programming",
    createdAt: new Date("2026-03-03T10:00:00")
  },
  {
    id: "q2",
    title: "Calculus is hard! Exam tomorrow 🤯 - Need urgent help",
    content: "I don't understand calculus problems. Can someone explain limits and continuity? Any peer available to help?",
    author: {
      name: "Nimal Silva",
      avatar: "https://avatar.vercel.sh/nimal",
    },
    upvotes: 8,
    downvotes: 1,
    answers: 5,
    category: "mathematics",
    categoryName: "Mathematics",
    createdAt: new Date("2026-03-03T14:30:00")
  },
  {
    id: "q3",
    title: "Quantum Physics basics - Anyone want to form a study group?",
    content: "Looking for peers interested in learning Quantum Physics together. Let's form a study group and help each other.",
    author: {
      name: "Sachini Jayawardena",
      avatar: "https://avatar.vercel.sh/sachini",
    },
    upvotes: 22,
    downvotes: 0,
    answers: 7,
    category: "physics",
    categoryName: "Physics",
    createdAt: new Date("2026-03-03T09:15:00")
  }
]

// Online peers
const onlinePeers = [
  { name: "Chamara", avatar: "https://avatar.vercel.sh/chamara", status: "online" },
  { name: "Dinesh", avatar: "https://avatar.vercel.sh/dinesh", status: "online" },
  { name: "Kasun", avatar: "https://avatar.vercel.sh/kasun", status: "away" },
  { name: "Nadee", avatar: "https://avatar.vercel.sh/nadee", status: "online" },
  { name: "Priya", avatar: "https://avatar.vercel.sh/priya", status: "online" }
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<"feed" | "qna">("feed")
  const [questionText, setQuestionText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section with Tab Navigation */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                👋 Welcome to <span className="text-primary">UniHub</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Learn together, grow together
              </p>
            </div>
            <div className="flex gap-2 bg-background rounded-lg p-1">
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "feed" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-secondary"
                }`}
              >
                📰 Feed
              </button>
              <button
                onClick={() => setActiveTab("qna")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "qna" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-secondary"
                }`}
              >
                ❓ Peer2Peer Q&A
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Online Peers & Stats */}
          <div className="lg:col-span-3 space-y-4">
            {/* Online Peers */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Online Now
              </h3>
              <div className="space-y-3">
                {onlinePeers.map((peer, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="relative">
                      <img src={peer.avatar} className="w-8 h-8 rounded-full" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${
                        peer.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                      } ring-2 ring-background`} />
                    </div>
                    <span className="text-sm">{peer.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Today's Activity
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answers</span>
                  <span className="font-medium">132</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online Peers</span>
                  <span className="font-medium text-emerald-500">12</span>
                </div>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Top Helpers
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">🥇</span>
                  <span>Prof. Sarah Chen</span>
                  <span className="ml-auto text-muted-foreground">342 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">🥈</span>
                  <span>Dr. James Wilson</span>
                  <span className="ml-auto text-muted-foreground">287 pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">🥉</span>
                  <span>Alex Kumar</span>
                  <span className="ml-auto text-muted-foreground">198 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - Changes based on active tab */}
          <div className="lg:col-span-6">
            {activeTab === "feed" ? (
              /* FEED TAB - Existing Feed */
              <>
                <CreatePost />
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Latest in Your Network
                  </h2>
                  {mockPosts.map((post) => (
                    <PostCard key={post.id} {...post} />
                  ))}
                </div>
              </>
            ) : (
              /* Q&A TAB - Peer2Peer Q&A */
              <>
                {/* Ask Question Box */}
                <div className="bg-card border border-border rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <img 
                      src="https://avatar.vercel.sh/me" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <textarea
                        placeholder="Ask your question here... Get help from peers"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                      />
                      <div className="flex gap-2 items-center">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-3 py-1.5 border border-border rounded-md bg-background text-sm"
                        >
                          <option value="">Select subject</option>
                          <option value="programming">💻 Programming</option>
                          <option value="mathematics">📐 Mathematics</option>
                          <option value="physics">⚛️ Physics</option>
                          <option value="chemistry">🧪 Chemistry</option>
                          <option value="biology">🧬 Biology</option>
                        </select>
                        <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                          Post Question
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Q&A Feed Tabs */}
                <div className="flex gap-4 border-b border-border mb-4">
                  <button className="pb-2 px-1 border-b-2 border-primary text-primary font-medium">
                    Recent
                  </button>
                  <button className="pb-2 px-1 text-muted-foreground hover:text-foreground">
                    Unanswered
                  </button>
                  <button className="pb-2 px-1 text-muted-foreground hover:text-foreground">
                    Trending
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {mockQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>

                {/* View All Link */}
                <div className="text-center mt-6">
                  <Link 
                    href="/qna" 
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View all questions
                    <span>→</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Categories & Trending (Shown in both tabs) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Popular Categories */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Subjects
              </h3>
              <div className="space-y-2">
                <Link href="/qna/category/programming" className="flex justify-between items-center hover:text-primary">
                  <span>💻 Programming</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">24</span>
                </Link>
                <Link href="/qna/category/mathematics" className="flex justify-between items-center hover:text-primary">
                  <span>📐 Mathematics</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">18</span>
                </Link>
                <Link href="/qna/category/physics" className="flex justify-between items-center hover:text-primary">
                  <span>⚛️ Physics</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">12</span>
                </Link>
                <Link href="/qna/category/chemistry" className="flex justify-between items-center hover:text-primary">
                  <span>🧪 Chemistry</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">9</span>
                </Link>
                <Link href="/qna/category/biology" className="flex justify-between items-center hover:text-primary">
                  <span>🧬 Biology</span>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">7</span>
                </Link>
              </div>
            </div>

            {/* Trending Questions */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3">🔥 Trending Now</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium line-clamp-1">React vs Next.js? Which one to learn first?</p>
                  <p className="text-xs text-muted-foreground">12 answers · 2h ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium line-clamp-1">Calculus exam tips please!</p>
                  <p className="text-xs text-muted-foreground">8 answers · 30m ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium line-clamp-1">Quantum physics study group</p>
                  <p className="text-xs text-muted-foreground">5 answers · 1h ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium line-clamp-1">How to prepare for programming interviews?</p>
                  <p className="text-xs text-muted-foreground">15 answers · 3h ago</p>
                </div>
              </div>
            </div>

            {/* Study Group Suggestion */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-medium mb-2">👥 Start a Study Group</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Find peers studying the same subject
              </p>
              <button className="w-full px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20">
                Create Group
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}