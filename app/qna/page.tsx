"use client"

import QuestionCard from "@/components/qna/QuestionCard"
import Link from "next/link"
import { PlusCircle, ArrowLeft } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

interface Question {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  category: string
  categoryName: string
  upvotes: number
  downvotes: number
  answers: number
  createdAt: Date
  userVote?: string | null
}

export default function QnaPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState("1")
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [filterType, setFilterType] = useState<"recent" | "unanswered" | "trending">("recent")

  // Fetch subjects when year or semester changes
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true)
        const params = new URLSearchParams({
          year: selectedYear,
          semester: selectedSemester
        })
        const response = await fetch(`/api/ask-subjects?${params}`)
        const data = await response.json()
        setSubjects(data || [])
        setSelectedSubject("")
      } catch (error) {
        console.error("Failed to fetch subjects:", error)
        setSubjects([])
      } finally {
        setLoadingSubjects(false)
      }
    }
    
    fetchSubjects()
  }, [selectedYear, selectedSemester])

  const fetchQuestions = async (applyFilter: string = "recent") => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('studentId')
      const params = new URLSearchParams()
      
      if (userId) params.append('userId', userId)
      if (selectedSubject) params.append('subjectCode', selectedSubject)
      
      const response = await fetch(`/api/qna/questions?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const rawQuestions = await response.json()
      
      // Sanitize data - ensure votes are never negative
      const questions = rawQuestions.map((q: any) => ({
        ...q,
        upvotes: Math.max(0, parseInt(q.upvotes) || 0),
        downvotes: Math.max(0, parseInt(q.downvotes) || 0)
      }))
      
      setAllQuestions(questions)
      
      // Apply filter
      let filtered = [...questions]
      
      if (applyFilter === "unanswered") {
        filtered = filtered.filter(q => q.answers === 0)
      } else if (applyFilter === "trending") {
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
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions'
      console.error('Error fetching questions:', errorMessage)
      setError(errorMessage)
      setAllQuestions([])
      setFilteredQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleVoteComplete = () => {
    // Refresh questions to get updated vote counts
    fetchQuestions(filterType)
  }

  const handleDeleteQuestion = (questionId: string) => {
    // Remove the question from filtered and all questions
    setFilteredQuestions(prev => prev.filter(q => q.id !== questionId))
    setAllQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const refreshFilteredQuestions = useCallback(async (filter: string) => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('studentId')
      const params = new URLSearchParams()
      
      if (userId) params.append('userId', userId)
      if (selectedSubject) params.append('subjectCode', selectedSubject)
      
      const response = await fetch(`/api/qna/questions?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const rawQuestions = await response.json()
      
      // Sanitize data - ensure votes are never negative
      const questions = rawQuestions.map((q: any) => ({
        ...q,
        upvotes: Math.max(0, parseInt(q.upvotes) || 0),
        downvotes: Math.max(0, parseInt(q.downvotes) || 0)
      }))
      
      setAllQuestions(questions)
      
      // Apply filter
      let filtered = [...questions]
      
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
      
      setFilteredQuestions(filtered)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions'
      console.error('Error fetching questions:', errorMessage)
      setError(errorMessage)
      setFilteredQuestions([])
    } finally {
      setLoading(false)
    }
  }, [selectedSubject])

  // Fetch questions when subject changes
  useEffect(() => {
    fetchQuestions(filterType)
  }, [selectedSubject])

  // Auto-refresh when filter changes
  useEffect(() => {
    refreshFilteredQuestions(filterType)
  }, [filterType, refreshFilteredQuestions])

  return (
    <div className="w-full py-6 px-4 md:px-6 lg:px-8">
      {/* Back button */}
      <Link 
        href="/?section=qna"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Questions & Answers</h1>
        <Link 
          href="/qna/ask"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Ask Question
        </Link>
      </div>

      {/* Year, Semester, Subject Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Year */}
        <div className="space-y-2">
          <label htmlFor="year" className="text-sm font-medium">
            Year
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>

        {/* Semester */}
        <div className="space-y-2">
          <label htmlFor="semester" className="text-sm font-medium">
            Semester
          </label>
          <select
            id="semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium">
            Subject
          </label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={loadingSubjects || subjects.length === 0}
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingSubjects ? "Loading subjects..." : subjects.length === 0 ? "No subjects available" : "All Subjects"}
            </option>
            {subjects.map((subject) => (
              <option key={subject.subject_code} value={subject.subject_code}>
                {subject.subject_code} - {subject.subject_name}
              </option>
            ))}
          </select>
        </div>
      </div>

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

      {/* Questions list */}
      <div className="space-y-4">
        {loading ? (
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
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive">Error: {error}</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {filterType === "unanswered" 
                ? "🎉 No unanswered questions! All questions have answers!" 
                : "No questions found"}
            </p>
            <p className="text-sm text-muted-foreground">
              Be the first to ask a question!
            </p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionCard 
              key={question.id} 
              question={question} 
              onVoteComplete={handleVoteComplete}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}