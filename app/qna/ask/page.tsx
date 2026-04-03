"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface FormErrors {
  title: string
  category: string
  content: string
}

export default function AskQuestionPage() {
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState("1")
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: ""
  })
  const [errors, setErrors] = useState<FormErrors>({
    title: "",
    category: "",
    content: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch subjects when year or semester changes
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          year: selectedYear,
          semester: selectedSemester
        })
        const response = await fetch(`/api/ask-subjects?${params}`)
        const data = await response.json()
        setSubjects(data || [])
        setFormData(prev => ({ ...prev, category: "" }))
      } catch (error) {
        console.error("Failed to fetch subjects:", error)
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubjects()
  }, [selectedYear, selectedSemester])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      title: "",
      category: "",
      content: ""
    }
    let isValid = true

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
      isValid = false
    } else if (formData.title.trim().length < 10) {
      newErrors.title = "Title must be at least 10 characters"
      isValid = false
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Title must be less than 200 characters"
      isValid = false
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Please select a category"
      isValid = false
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
      isValid = false
    } else if (formData.content.trim().length < 20) {
      newErrors.content = "Content must be at least 20 characters"
      isValid = false
    } else if (formData.content.trim().length > 5000) {
      newErrors.content = "Content must be less than 5000 characters"
      isValid = false
    }

    setErrors(newErrors)
    
    // Show toast if validation fails
    if (!isValid) {
      toast.error("Please fix the errors before submitting")
    }
    
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    // Show loading toast
    const loadingToast = toast.loading("Posting your question...")
    
    try {
      // Get the selected subject details
      const selectedSubject = subjects.find(s => s.subject_code === formData.category)
      
      // Get current user info (mock)
      const newQuestion = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        category: formData.category,
        categoryName: selectedSubject ? `${selectedSubject.subject_code} - ${selectedSubject.subject_name}` : "Unknown",
        author: {
          id: "current-user",
          name: "You",
          avatar: "https://avatar.vercel.sh/user"
        },
        upvotes: 0,
        downvotes: 0,
        answers: [],
        createdAt: new Date()
      }

      // Save to localStorage
      const existingQuestions = JSON.parse(localStorage.getItem("qna_questions") || "[]")
      existingQuestions.push(newQuestion)
      localStorage.setItem("qna_questions", JSON.stringify(existingQuestions))

      // Mock submit delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dismiss loading and show success
      toast.dismiss(loadingToast)
      toast.success("Question posted successfully! 🎉")
      
      router.push("/qna")
    } catch (error) {
      console.error("Error posting question:", error)
      toast.dismiss(loadingToast)
      toast.error("Failed to post question. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
    
    // Clear error when user starts typing
    if (errors[id as keyof FormErrors]) {
      setErrors({ ...errors, [id]: "" })
    }
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

      <h1 className="text-2xl font-bold mb-6">Ask a Question</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. How does useState work in React?"
            className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
              errors.title ? "border-destructive focus:ring-destructive" : "border-border"
            }`}
          />
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Be specific and imagine you're asking a question to another person (min. 10 characters)
            </p>
          )}
        </div>

        {/* Year, Semester, Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Year */}
          <div className="space-y-2">
            <label htmlFor="year" className="text-sm font-medium">
              Year <span className="text-destructive">*</span>
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
              Semester <span className="text-destructive">*</span>
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
            <label htmlFor="category" className="text-sm font-medium">
              Subject <span className="text-destructive">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loading || subjects.length === 0}
              className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.category ? "border-destructive focus:ring-destructive" : "border-border"
              }`}
            >
              <option value="">
                {loading ? "Loading subjects..." : subjects.length === 0 ? "No subjects available" : "Select a subject"}
              </option>
              {subjects.map((subject) => (
                <option key={subject.subject_code} value={subject.subject_code}>
                  {subject.subject_code} - {subject.subject_name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Content <span className="text-destructive">*</span>
          </label>
          <textarea
            id="content"
            rows={8}
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Explain your question in detail... Include what you've tried and what you're expecting."
            className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y ${
              errors.content ? "border-destructive focus:ring-destructive" : "border-border"
            }`}
          />
          {errors.content ? (
            <p className="text-xs text-destructive">{errors.content}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Provide detailed information about your question (min. 20 characters, max. 5000)
            </p>
          )}
        </div>

        {/* Form summary */}
        <div className="bg-secondary/30 rounded-lg p-3 text-sm">
          <p className="text-muted-foreground">
            <span className="text-destructive">*</span> Required fields
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Your question will be visible to all peers. Be respectful and helpful.
          </p>
        </div>

        {/* Submit button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post Your Question"}
          </button>
          <Link
            href="/qna"
            className="px-6 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}