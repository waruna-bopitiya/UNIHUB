"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { CreatePost } from '@/components/feed/create-post'
import { PostCard } from '@/components/feed/post-card'
import QuestionCard from '@/components/qna/QuestionCard'
import { Badge } from '@/components/ui/badge'
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

interface TopHelper {
  id: string
  name: string
  avatar: string
  answerCount: number
  badges: string[]
  rank: number
  medal: string
}

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
  { name: "Programming", emoji: "💻", count: 24 },
  { name: "Mathematics", emoji: "📐", count: 18 },
  { name: "Physics", emoji: "⚛️", count: 12 },
  { name: "Chemistry", emoji: "🧪", count: 9 },
  { name: "Biology", emoji: "🧬", count: 7 },
]

// Mock Trending Questions
const mockTrendings = [
  { title: "React vs Next.js? Which one to learn first?", answers: 12, time: "2h ago" },
  { title: "Calculus exam tips please!", answers: 8, time: "30m ago" },
  { title: "Quantum physics study group", answers: 5, time: "1h ago" },
  { title: "How to prepare for programming interviews?", answers: 15, time: "3h ago" },
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

export default function HomePageContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"feed" | "qna">("feed")
  const [filterType, setFilterType] = useState<"recent" | "unanswered" | "trending">("recent")
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])
  const [topHelpers, setTopHelpers] = useState<TopHelper[]>([])
  const searchParams = useSearchParams()

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      if (res.ok) setPosts(await res.json())
    } catch {}
    setLoading(false)
  }

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true)
      const res = await fetch('/api/qna/questions')
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
      } else {
        setQuestions([])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    } finally {
      setQuestionsLoading(false)
    }
  }

  const fetchTopHelpers = async () => {
    try {
      const res = await fetch('/api/top-helpers')
      if (res.ok) {
        const data = await res.json()
        console.log('✅ Fetched top helpers:', data)
        setTopHelpers(data)
      } else {
        const error = await res.json()
        console.error('API Error:', error.details || error.error)
      }
    } catch (error) {
      console.error('Error fetching top helpers:', error)
    }
  }

  useEffect(() => { 
    fetchPosts()
    fetchQuestions()
    fetchTopHelpers()
    // Auto-select Q&A tab if section=qna in query params
    const section = searchParams.get('section')
    if (section === 'qna') {
      setActiveTab('qna')
    }
  }, [searchParams])

  // Filter questions based on selected filter
  useEffect(() => {
    let filtered = [...questions]
    
    if (filterType === "unanswered") {
      filtered = filtered.filter(q => q.answers === 0)
    } else if (filterType === "trending") {
      filtered = [...filtered].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    } else {
      // Recent - sort by newest first
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
    }
    
    setFilteredQuestions(filtered)
  }, [filterType, questions])

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
                {mockOnlinePeers.map((peer, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="relative">
                      <img src={peer.avatar} className="w-8 h-8 rounded-full" alt={peer.name} />
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
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answers</span>
                  <span className="font-medium">{questions.reduce((sum, q) => sum + q.answers, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online Peers</span>
                  <span className="font-medium text-emerald-500">12</span>
                </div>
              </div>
            </div>

            {/* Top Helpers - Sorted by Answer Count */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Top Helpers
              </h3>
              <div className="space-y-2 text-sm">
                {topHelpers.length > 0 ? (
                  topHelpers.map((helper) => (
                    <Link
                      key={helper.id}
                      href={`/qna/profile/${helper.id}`}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <span>{helper.medal}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground hover:text-primary">{helper.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-1 whitespace-nowrap">{helper.answerCount}</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No helpers yet</p>
                )}
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

                {/* Filter Tabs */}
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

                {/* Questions List */}
                <div className="space-y-4">
                  {questionsLoading ? (
                    <div className="text-center py-12 bg-card border border-border rounded-lg">
                      <p className="text-muted-foreground">Loading questions...</p>
                    </div>
                  ) : filteredQuestions.length === 0 ? (
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

          {/* Right Sidebar - Categories & Trending (Shown in both tabs) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Popular Categories */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Subjects
              </h3>
              <div className="space-y-2">
                {mockCategories.map((cat, i) => (
                  <Link key={i} href={`/qna/category/${cat.name.toLowerCase()}`} className="flex justify-between items-center hover:text-primary">
                    <span>{cat.emoji} {cat.name}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{cat.count}</span>
                  </Link>
                ))}
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
