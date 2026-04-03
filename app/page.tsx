"use client"

import { useEffect, useState, Suspense } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { CreatePost } from '@/components/feed/create-post'
import { PostCard } from '@/components/feed/post-card'
import QuestionCard from '@/components/qna/QuestionCard'
import Link from "next/link"
import { MessageCircle, Users, TrendingUp, Award } from "lucide-react"

interface Post {
  id: number
  author_name: string
  author_avatar: string
  author_role: string
  content: string
  category: string
  likes_count: number
  comments_count: number
  shares_count: number
  stream_video_id: string | null
  stream_title: string | null
  created_at: string
}

// Mock Q&A Data (Peer2Peer) - English only
const mockQuestions = [
  {
    id: "1",
    title: "Best practices for building scalable web applications?",
    content: "I'm starting a new project using modern frameworks. What are the best practices for building scalable applications?",
    author: {
      name: "Kamal Perera",
      avatar: "https://avatar.vercel.sh/kamal",
    },
    upvotes: 15,
    downvotes: 2,
    answers: 3,
    category: "it3030",
    categoryName: "IT3030 - Programming Applications and Frameworks",
    createdAt: new Date("2026-03-03T10:00:00")
  },
  {
    id: "2",
    title: "Database design for large-scale systems?",
    content: "What are the key considerations when designing a database for a large-scale system? SQL vs NoSQL?",
    author: {
      name: "Nimal Silva",
      avatar: "https://avatar.vercel.sh/nimal",
    },
    upvotes: 8,
    downvotes: 1,
    answers: 5,
    category: "it3020",
    categoryName: "IT3020 - Database Systems",
    createdAt: new Date("2026-03-03T14:30:00")
  },
  {
    id: "3",
    title: "Network architecture for distributed systems?",
    content: "How do I design a network that can handle distributed systems? Any best practices for network management?",
    author: {
      name: "Sachini Jayawardena",
      avatar: "https://avatar.vercel.sh/sachini",
    },
    upvotes: 22,
    downvotes: 0,
    answers: 7,
    category: "it3010",
    categoryName: "IT3010 - Network Design and Management",
    createdAt: new Date("2026-03-03T09:15:00")
  },
  {
    id: "4",
    title: "How to manage IT project timelines effectively?",
    content: "Any tips on managing project timelines and scope in IT projects? How to handle scope creep?",
    author: {
      name: "Janaka Wijesinghe",
      avatar: "https://avatar.vercel.sh/janaka",
    },
    upvotes: 32,
    downvotes: 1,
    answers: 8,
    category: "it3040",
    categoryName: "IT3040 - IT Project Management",
    createdAt: new Date("2026-03-02T16:45:00")
  },
  {
    id: "5",
    title: "Key employability skills for IT professionals?",
    content: "What are the most important employability skills I should focus on developing for my IT career?",
    author: {
      name: "Ravindra Karunarathne",
      avatar: "https://avatar.vercel.sh/ravindra",
    },
    upvotes: 11,
    downvotes: 0,
    answers: 4,
    category: "it3050",
    categoryName: "IT3050 - Employability Skills Development - Seminar",
    createdAt: new Date("2026-03-02T11:20:00")
  }
]

// Mock Online Peers
const mockOnlinePeers = [
  { name: "Chamara", avatar: "https://avatar.vercel.sh/chamara", status: "online" },
  { name: "Dinesh", avatar: "https://avatar.vercel.sh/dinesh", status: "online" },
  { name: "Kasun", avatar: "https://avatar.vercel.sh/kasun", status: "away" },
  { name: "Nadee", avatar: "https://avatar.vercel.sh/nadee", status: "online" },
  { name: "Priya", avatar: "https://avatar.vercel.sh/priya", status: "online" },
  { name: "Anura", avatar: "https://avatar.vercel.sh/anura", status: "online" },
  { name: "Suresh", avatar: "https://avatar.vercel.sh/suresh", status: "away" },
]

// Mock Categories with counts
const mockCategories = [
  { id: "it3050", name: "IT3050 - Employability Skills", emoji: "💼", count: 18 },
  { id: "it3040", name: "IT3040 - IT Project Management", emoji: "📊", count: 15 },
  { id: "it3030", name: "IT3030 - Programming & Frameworks", emoji: "💻", count: 24 },
  { id: "it3020", name: "IT3020 - Database Systems", emoji: "🗄️", count: 21 },
  { id: "it3010", name: "IT3010 - Network Design & Management", emoji: "🌐", count: 19 },
]

// Mock Trending Questions
const mockTrendings = [
  { title: "Best frameworks for web applications?", answers: 12, time: "2h ago" },
  { title: "Database design best practices?", answers: 8, time: "30m ago" },
  { title: "Network security fundamentals?", answers: 5, time: "1h ago" },
  { title: "How to manage IT project timelines?", answers: 15, time: "3h ago" },
]

// Mock Top Helpers/Contributors
const mockTopHelpers = [
  { name: "Prof. Sarah Chen", points: 342, medal: "🥇" },
  { name: "Dr. James Wilson", points: 287, medal: "🥈" },
  { name: "Alex Kumar", points: 198, medal: "🥉" },
]

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [subjects, setSubjects] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"feed" | "qna">("feed")
  const [filterType, setFilterType] = useState<"recent" | "unanswered" | "trending">("recent")
  const [filteredQuestions, setFilteredQuestions] = useState(mockQuestions)
  const [selectedYear, setSelectedYear] = useState(1)
  const [selectedSemester, setSelectedSemester] = useState(1)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Get real-time status based on current time
  const getOnlineStatus = (lastLogin: string | null) => {
    if (!lastLogin) return 'offline'
    const lastLoginTime = new Date(lastLogin).getTime()
    const timeDifference = currentTime.getTime() - lastLoginTime
    const fiveMinutesInMs = 5 * 60 * 1000
    return timeDifference < fiveMinutesInMs ? 'online' : 'away'
  }

  // Sort users: online first, then away/offline
  const sortedOnlineUsers = [...onlineUsers].sort((a, b) => {
    const statusA = getOnlineStatus(a.lastLogin)
    const statusB = getOnlineStatus(b.lastLogin)
    if (statusA === 'online' && statusB !== 'online') return -1
    if (statusA !== 'online' && statusB === 'online') return 1
    return 0
  })

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      if (res.ok) setPosts(await res.json())
    } catch {}
    setLoading(false)
  }

  const fetchOnlineUsers = async () => {
    try {
      const res = await fetch('/api/online-users')
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched online users:', data)
        setOnlineUsers(data)
      } else {
        const error = await res.json()
        console.error('API Error:', error.details || error.error)
      }
    } catch (error) {
      console.error('Error fetching online users:', error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        semester: selectedSemester.toString(),
      })
      const res = await fetch(`/api/subjects?${params}`)
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched subjects:', data)
        setSubjects(data)
      } else {
        const error = await res.json()
        console.error('API Error:', error.details || error.error)
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  useEffect(() => { 
    fetchPosts()
    fetchOnlineUsers()
    // Refresh user list every 10 seconds to catch logouts and new logins immediately
    const interval = setInterval(fetchOnlineUsers, 10 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchSubjects()
  }, [selectedYear, selectedSemester])

  // Update current time every second for real-time status
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Filter questions based on selected filter
  useEffect(() => {
    let filtered = [...mockQuestions]
    
    if (filterType === "unanswered") {
      // Show questions with 0 answers
      filtered = filtered.filter(q => q.answers === 0)
    } else if (filterType === "trending") {
      // Sort by most upvotes (trending)
      filtered = [...filtered].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    } else {
      // Recent - sort by newest first
      filtered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }
    
    setFilteredQuestions(filtered)
  }, [filterType])

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev])
  }

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
                {sortedOnlineUsers.length > 0 ? (
                  <>
                    {/* Online Users Section */}
                    {sortedOnlineUsers.some(u => getOnlineStatus(u.lastLogin) === 'online') && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">ONLINE</p>
                        {sortedOnlineUsers
                          .filter(u => getOnlineStatus(u.lastLogin) === 'online')
                          .map((peer: any, i: number) => (
                            <div key={`online-${i}`} className="flex items-center gap-2 mb-2">
                              <div className="relative">
                                <img src={peer.avatar} className="w-8 h-8 rounded-full" alt={peer.name} />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                              </div>
                              <span className="text-sm">{peer.name}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Away/Offline Users Section */}
                    {sortedOnlineUsers.some(u => getOnlineStatus(u.lastLogin) !== 'online') && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 pt-2 border-t border-border">AWAY</p>
                        {sortedOnlineUsers
                          .filter(u => getOnlineStatus(u.lastLogin) !== 'online')
                          .map((peer: any, i: number) => (
                            <div key={`away-${i}`} className="flex items-center gap-2 mb-2 opacity-60">
                              <div className="relative">
                                <img src={peer.avatar} className="w-8 h-8 rounded-full" alt={peer.name} />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                              </div>
                              <span className="text-sm">{peer.name}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No users found</p>
                )}
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
                  <span className="font-medium text-emerald-500">{sortedOnlineUsers.filter(u => getOnlineStatus(u.lastLogin) === 'online').length}</span>
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
                {mockTopHelpers.map((helper, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span>{helper.medal}</span>
                    <span>{helper.name}</span>
                    <span className="ml-auto text-muted-foreground">{helper.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area - Changes based on active tab */}
          <div className="lg:col-span-6">
            {activeTab === "feed" ? (
              /* FEED TAB - Real Feed Data */
              <>
                <CreatePost onPostCreated={handlePostCreated} />

                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Latest in Your Network</h2>

                  {loading && (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                          <div className="flex gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-muted" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-1/3" />
                              <div className="h-3 bg-muted rounded w-1/4" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded" />
                            <div className="h-3 bg-muted rounded w-5/6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!loading && posts.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <p className="text-lg font-medium">No posts yet</p>
                      <p className="text-sm mt-1">Be the first to share something with the community!</p>
                    </div>
                  )}

                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      id={String(post.id)}
                      author={{ name: post.author_name, avatar: post.author_avatar, role: post.author_role }}
                      timestamp={timeAgo(post.created_at)}
                      content={post.content}
                      category={post.category}
                      likes={post.likes_count}
                      comments={post.comments_count}
                      shares={post.shares_count}
                      streamVideoId={post.stream_video_id ?? undefined}
                      streamTitle={post.stream_title ?? undefined}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Q&A TAB - Peer2Peer Q&A with Simplified Ask Button */
              <>
                {/* Ask Question Button - Link to full page */}
                <Link 
                  href="/qna/ask"
                  className="block bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-4 hover:bg-primary/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <span className="text-xl">✏️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">Ask a Question</h3>
                      <p className="text-xs text-muted-foreground">
                        Get help from peers, share knowledge, and learn together
                      </p>
                    </div>
                    <span className="text-primary text-sm group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>

                {/* Filter Tabs - Working */}
                <div className="flex gap-4 border-b border-border mb-4">
                  <button
                    onClick={() => setFilterType("recent")}
                    className={`pb-2 px-1 transition-colors ${
                      filterType === "recent" 
                        ? "border-b-2 border-primary text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setFilterType("unanswered")}
                    className={`pb-2 px-1 transition-colors ${
                      filterType === "unanswered" 
                        ? "border-b-2 border-primary text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Unanswered
                  </button>
                  <button
                    onClick={() => setFilterType("trending")}
                    className={`pb-2 px-1 transition-colors ${
                      filterType === "trending" 
                        ? "border-b-2 border-primary text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Trending
                  </button>
                </div>

                {/* Questions List - Filtered */}
                <div className="space-y-4">
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-12 bg-card border border-border rounded-lg">
                      <p className="text-muted-foreground">
                        {filterType === "unanswered" 
                          ? "🎉 No unanswered questions! All questions have answers!" 
                          : "No questions found"}
                      </p>
                      <Link 
                        href="/qna/ask"
                        className="inline-block mt-3 text-primary hover:underline text-sm"
                      >
                        Be the first to ask a question →
                      </Link>
                    </div>
                  ) : (
                    filteredQuestions.map((question) => (
                      <QuestionCard key={question.id} question={question} />
                    ))
                  )}
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

          {/* Right Sidebar - Categories & Trending */}
          <div className="lg:col-span-3 space-y-4">
            {/* Popular Categories */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Subjects
              </h3>
              
              {/* Year & Semester Filters */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Year</label>
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Semester</label>
                  <select 
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>
              </div>

              {/* Subjects List */}
              <div className="space-y-2 border-t border-border pt-3">
                {subjects.length > 0 ? (
                  subjects.map((cat: any, i: number) => (
                    <Link key={i} href={`/qna/category/${cat.id}`} className="block px-3 py-2 rounded hover:bg-secondary transition-colors">
                      <span className="text-sm">{cat.name}</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No subjects found</p>
                )}
              </div>
            </div>

            {/* Trending Questions */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3">🔥 Trending Now</h3>
              <div className="space-y-3">
                {mockTrendings.map((item, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium line-clamp-2">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.answers} answers · {item.time}</p>
                  </div>
                ))}
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
