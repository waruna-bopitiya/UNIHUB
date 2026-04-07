"use client"

import { useEffect, useState, Suspense, useCallback } from 'react'
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

interface OnlineUser {
  id: string
  name: string
  lastLogin: string | null
  logoutTime: string | null
  avatar: string
}

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
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [currentUser, setCurrentUser] = useState<OnlineUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"feed" | "qna">("feed")
  const [filterType, setFilterType] = useState<"recent" | "unanswered" | "trending">("recent")
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState<string | number>(1)
  const [selectedSemester, setSelectedSemester] = useState<string | number>(1)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [years, setYears] = useState<Array<{ value: string; label: string }>>([])
  const [semesters, setSemesters] = useState<Array<{ value: string; label: string }>>([])
  const [yearsLoading, setYearsLoading] = useState(false)
  const [semestersLoading, setSemestersLoading] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())
  const [onlineUsersSearch, setOnlineUsersSearch] = useState('')

  // Get real-time status based on last_login and logouttime
  const getOnlineStatus = (lastLogin: string | null, logoutTime: string | null) => {
    if (!lastLogin) return 'away'
    
    // If no logout time, user is still online
    if (!logoutTime) return 'online'
    
    // Compare timestamps - whichever is more recent determines status
    const lastLoginTime = new Date(lastLogin).getTime()
    const logoutTimeStamp = new Date(logoutTime).getTime()
    
    // If last_login is after logouttime, user is online
    if (lastLoginTime > logoutTimeStamp) return 'online'
    
    // If logouttime is after or equal to last_login, user is away
    return 'away'
  }

  // Sort users: current user first, then online, then away/offline
  const sortedOnlineUsers = (() => {
    let allUsers = [...onlineUsers]
    
    // Add current user to the list if they exist and not already in the list
    if (currentUser && !allUsers.find(u => u.id === currentUser.id)) {
      allUsers = [currentUser, ...allUsers]
    }
    
    // Sort: current user first, then by status (online first)
    return allUsers.sort((a, b) => {
      // Current user always first
      if (currentUser && a.id === currentUser.id) return -1
      if (currentUser && b.id === currentUser.id) return 1
      
      // Then sort by status
      const statusA = getOnlineStatus(a.lastLogin, a.logoutTime)
      const statusB = getOnlineStatus(b.lastLogin, b.logoutTime)
      if (statusA === 'online' && statusB !== 'online') return -1
      if (statusA !== 'online' && statusB === 'online') return 1
      return 0
    })
  })()

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
        console.log('✅ Fetched online users:', data)
        setOnlineUsers(data)
        setLastRefreshTime(new Date())
      } else {
        const error = await res.json()
        console.error('API Error:', error.details || error.error)
      }
    } catch (error) {
      console.error('Error fetching online users:', error)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      // Get user ID from localStorage (set during login)
      const userId = localStorage.getItem('studentId')
      const email = localStorage.getItem('email')
      
      if (!userId && !email) {
        console.warn('⚠️ No user ID or email in localStorage')
        return
      }

      // Fetch current user with userId as query parameter
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (email) params.append('email', email)

      const res = await fetch(`/api/user/me?${params.toString()}`)
      if (res.ok) {
        const user = await res.json()
        console.log('👤 Current user:', user)
        setCurrentUser(user)
      } else {
        console.warn('Could not fetch current user:', res.status)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
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

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true)
      const res = await fetch('/api/qna/questions')
      if (res.ok) {
        const data = await res.json()
        // Sanitize data - ensure votes are never negative
        const sanitizedData = data.map((q: any) => ({
          ...q,
          upvotes: Math.max(0, parseInt(q.upvotes) || 0),
          downvotes: Math.max(0, parseInt(q.downvotes) || 0)
        }))
        console.log('Fetched questions:', sanitizedData)
        setAllQuestions(sanitizedData)
        setFilteredQuestions(sanitizedData)
      } else {
        console.error('Failed to fetch questions')
        setAllQuestions([])
        setFilteredQuestions([])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setAllQuestions([])
      setFilteredQuestions([])
    } finally {
      setQuestionsLoading(false)
    }
  }

  const refreshFilteredQuestions = useCallback(async (filter: string) => {
    try {
      setQuestionsLoading(true)
      const res = await fetch('/api/qna/questions')
      if (res.ok) {
        const rawData = await res.json()
        // Sanitize data - ensure votes are never negative
        const data = rawData.map((q: any) => ({
          ...q,
          upvotes: Math.max(0, parseInt(q.upvotes) || 0),
          downvotes: Math.max(0, parseInt(q.downvotes) || 0)
        }))
        console.log(`📊 Fetching ${filter} questions:`, data)
        let filtered = [...data]
        
        if (filter === "unanswered") {
          filtered = filtered.filter(q => q.answers === 0)
        } else if (filter === "trending") {
          filtered = [...filtered].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
        } else {
          // Recent - sort by newest first
          filtered = [...filtered].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            return dateB - dateA
          })
        }
        
        setAllQuestions(data)
        setFilteredQuestions(filtered)
      } else {
        console.error('Failed to fetch questions')
        setFilteredQuestions([])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setFilteredQuestions([])
    } finally {
      setQuestionsLoading(false)
    }
  }, [])

  const fetchYears = async () => {
    try {
      setYearsLoading(true)
      const res = await fetch('/api/subjects')
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched years:', data)
        setYears(data)
        // Set first year as default if available
        if (data.length > 0) {
          setSelectedYear(data[0].value)
        }
      }
    } catch (error) {
      console.error('Error fetching years:', error)
    } finally {
      setYearsLoading(false)
    }
  }

  const fetchSemesters = async (year: string | number) => {
    try {
      setSemestersLoading(true)
      const params = new URLSearchParams({ year: String(year) })
      const res = await fetch(`/api/subjects?${params}`)
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched semesters:', data)
        setSemesters(data)
        // Set first semester as default if available
        if (data.length > 0) {
          setSelectedSemester(data[0].value)
        }
      }
    } catch (error) {
      console.error('Error fetching semesters:', error)
    } finally {
      setSemestersLoading(false)
    }
  }

  useEffect(() => { 
    // Fetch all initial data
    fetchPosts()
    fetchOnlineUsers()
    fetchCurrentUser() // Fetch current user info
    fetchQuestions()
    fetchYears()
    
    // Set up auto-refresh interval for online users only (no full page refresh)
    const onlineUsersInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing online users...')
      fetchOnlineUsers()
    }, 40000) // Refresh every 40 seconds
    
    return () => {
      clearInterval(onlineUsersInterval)
    }
  }, [])

  useEffect(() => {
    // Fetch semesters when year changes
    if (selectedYear) {
      fetchSemesters(selectedYear)
    }
  }, [selectedYear])

  useEffect(() => {
    // Fetch subjects when year and semester change
    if (selectedYear && selectedSemester) {
      fetchSubjects()
    }
  }, [selectedYear, selectedSemester])

  // Auto-refresh when filter changes
  useEffect(() => {
    refreshFilteredQuestions(filterType)
  }, [filterType, refreshFilteredQuestions])

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev])
  }

  const handleVoteComplete = () => {
    // Refresh questions to get updated vote counts
    fetchQuestions()
  }

  return (
    <AppLayout>
      <div className="w-full py-6 px-4 md:px-6 lg:px-8">
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Online Now
                </h3>
                <span className="text-xs text-muted-foreground">
                  Updated: {lastRefreshTime.toLocaleTimeString()}
                </span>
              </div>
              
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by first or last name..."
                value={onlineUsersSearch}
                onChange={(e) => setOnlineUsersSearch(e.target.value)}
                className="w-full px-3 py-2 mb-3 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <div className="space-y-3">
                {sortedOnlineUsers.length > 0 ? (
                  <>
                    {/* Online Users Section */}
                    {sortedOnlineUsers.some(u => getOnlineStatus(u.lastLogin, u.logoutTime) === 'online' && u.name?.toLowerCase().includes(onlineUsersSearch.toLowerCase())) && (
                      <div>
                        <p className="text-xs font-semibold text-emerald-500 mb-2 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          ONLINE ({sortedOnlineUsers.filter(u => getOnlineStatus(u.lastLogin, u.logoutTime) === 'online' && u.name?.toLowerCase().includes(onlineUsersSearch.toLowerCase())).length})
                        </p>
                        {sortedOnlineUsers
                          .filter(u => getOnlineStatus(u.lastLogin, u.logoutTime) === 'online' && u.name?.toLowerCase().includes(onlineUsersSearch.toLowerCase()))
                          .map((peer: any, i: number) => {
                            const isCurrentUser = currentUser && peer.id === currentUser.id
                            return (
                              <Link
                                key={`online-${i}`}
                                href={`/qna/profile/${peer.id}`}
                                className={`flex items-center gap-2 mb-2 transition-all hover:opacity-80 ${isCurrentUser ? 'bg-primary/10 px-2 py-1 rounded' : ''}`}
                              >
                                <div className="relative">
                                  <img src={peer.avatar} className="w-8 h-8 rounded-full" alt={peer.name} />
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                                </div>
                                <span className={`text-sm ${isCurrentUser ? 'font-semibold' : ''}`}>
                                  {peer.name}
                                  {isCurrentUser && <span className="text-xs text-primary ml-1">(You)</span>}
                                </span>
                              </Link>
                            )
                          })}
                      </div>
                    )}

                    {/* Away/Offline Users Section */}
                    {sortedOnlineUsers.some(u => getOnlineStatus(u.lastLogin, u.logoutTime) !== 'online' && u.name?.toLowerCase().includes(onlineUsersSearch.toLowerCase())) && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 pt-2 border-t border-border flex items-center gap-1">
                          AWAY ({sortedOnlineUsers.filter(u => getOnlineStatus(u.lastLogin, u.logoutTime) !== 'online' && u.name?.toLowerCase().includes(onlineUsersSearch.toLowerCase())).length})
                        </p>
                        {sortedOnlineUsers
                          .filter(u => getOnlineStatus(u.lastLogin, u.logoutTime) !== 'online' && u.name?.toLowerCase().includes(onlineUsersSearch.toLowerCase()))
                          .map((peer: any, i: number) => {
                            const isCurrentUser = currentUser && peer.id === currentUser.id
                            return (
                              <Link
                                key={`away-${i}`}
                                href={`/qna/profile/${peer.id}`}
                                className={`flex items-center gap-2 mb-2 transition-all hover:opacity-80 ${isCurrentUser ? '' : 'opacity-60'}`}
                              >
                                <div className="relative">
                                  <img src={peer.avatar} className="w-8 h-8 rounded-full" alt={peer.name} />
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-gray-400 ring-2 ring-background" />
                                </div>
                                <span className={`text-sm ${isCurrentUser ? 'font-semibold text-primary' : ''}`}>
                                  {peer.name}
                                  {isCurrentUser && <span className="text-xs text-primary ml-1">(You)</span>}
                                </span>
                              </Link>
                            )
                          })}
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
                  <span className="font-medium">{allQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answers</span>
                  <span className="font-medium">{allQuestions.reduce((sum, q) => sum + q.answers, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online Peers</span>
                  <span className="font-medium text-emerald-500">{sortedOnlineUsers.filter(u => getOnlineStatus(u.lastLogin, u.logoutTime) === 'online').length}</span>
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
                {filteredQuestions.length > 0 ? (
                  sortedOnlineUsers.slice(0, 3).map((user, i) => (
                    <div key={user.id || i} className="flex items-center gap-2">
                      <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                      <span>{user.name || 'Anonymous'}</span>
                    </div>
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
                  {questionsLoading ? (
                    // Loading skeleton
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-6 h-6 bg-muted rounded" />
                              <div className="w-6 h-4 bg-muted rounded" />
                              <div className="w-6 h-6 bg-muted rounded" />
                            </div>
                            <div className="flex-1">
                              <div className="h-5 bg-muted rounded mb-2 w-3/4" />
                              <div className="h-3 bg-muted rounded mb-2 w-full" />
                              <div className="h-3 bg-muted rounded w-5/6" />
                              <div className="flex gap-2 mt-3">
                                <div className="h-3 bg-muted rounded w-20" />
                                <div className="h-3 bg-muted rounded w-20" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      <QuestionCard key={question.id} question={question} onVoteComplete={handleVoteComplete} />
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
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                    disabled={yearsLoading}
                  >
                    {yearsLoading ? (
                      <option>Loading years...</option>
                    ) : years.length > 0 ? (
                      years.map((year, i) => (
                        <option key={i} value={year.value}>
                          {year.label}
                        </option>
                      ))
                    ) : (
                      <option>No years available</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Semester</label>
                  <select 
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-2 py-1.5 border border-border rounded bg-background text-sm"
                    disabled={semestersLoading || years.length === 0}
                  >
                    {semestersLoading ? (
                      <option>Loading semesters...</option>
                    ) : semesters.length > 0 ? (
                      semesters.map((semester, i) => (
                        <option key={i} value={semester.value}>
                          {semester.label}
                        </option>
                      ))
                    ) : (
                      <option>No semesters available</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Subjects List */}
              <div className="space-y-2 border-t border-border pt-3">
                {subjects.length > 0 ? (
                  subjects.map((cat: any, i: number) => (
                    <Link key={i} href={`/qna/category/${cat.value}`} className="flex justify-between items-center px-3 py-2 rounded hover:bg-secondary transition-colors">
                      <span>{cat.emoji} {cat.label}</span>
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{cat.count}</span>
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
                {filteredQuestions.slice(0, 5).map((question, i) => (
                  <Link
                    key={question.id}
                    href={`/qna/question/${question.id}`}
                    className="block text-sm hover:text-primary transition-colors"
                  >
                    <p className="font-medium line-clamp-2">{question.title}</p>
                    <p className="text-xs text-muted-foreground">
                      By {question.askerName || 'Anonymous'} · {timeAgo(question.createdAt)}
                    </p>
                  </Link>
                ))}
                {filteredQuestions.length === 0 && (
                  <p className="text-xs text-muted-foreground">No trending questions yet</p>
                )}
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
