"use client"

import QuestionCard from "@/components/qna/QuestionCard"
import Link from "next/link"
import { PlusCircle, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"

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
  createdAt: string | Date
}

export default function QnaPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState("1")
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [loadingSubjects, setLoadingSubjects] = useState(false)

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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        let url = '/api/qna/questions'
        if (selectedSubject) {
          url += `?subjectCode=${selectedSubject}`
        }
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }

        const questions = await response.json()
        setAllQuestions(questions)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load questions'
        console.error('Error fetching questions:', errorMessage)
        setError(errorMessage)
        setAllQuestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [selectedSubject])

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
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

      {/* Questions list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive">Error: {error}</p>
          </div>
        ) : allQuestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No questions found</p>
            <p className="text-sm text-muted-foreground">
              Be the first to ask a question!
            </p>
          </div>
        ) : (
          allQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))
        )}
      </div>
    </div>
  )
}