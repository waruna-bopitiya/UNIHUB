"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Award, MessageCircle, TrendingUp, Download, Trash2, Star, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import QuestionCard from "@/components/qna/QuestionCard"
import AnswerCard from "@/components/qna/AnswerCard"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ResourceFeedback } from '@/components/resources/resource-feedback'

export default function ProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"questions" | "answers" | "resources" | "about">("questions")
  const [loading, setLoading] = useState(true)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const userId = params.id

        // Fetch user profile
        const userRes = await fetch(`/api/user/profile?id=${userId}`)
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        } else {
          console.error('Failed to fetch user profile')
        }

        // Fetch user's questions
        const questionsRes = await fetch(`/api/qna/questions?userId=${userId}`)
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json()
          setQuestions(questionsData)
        }

        // Fetch user's answers
        const answersRes = await fetch(`/api/qna/answers?userId=${userId}`)
        if (answersRes.ok) {
          const answersData = await answersRes.json()
          setAnswers(answersData)
        }

        // Fetch ALL resources first, then filter by uploader_id
        const allResourcesRes = await fetch(`/api/resources`)
        if (allResourcesRes.ok) {
          const allResourcesData = await allResourcesRes.json()
          const userResources = allResourcesData.filter((r: any) => r.uploader_id === userId)
          console.log(`Found ${userResources.length} resources for user ${userId}:`, userResources)
          setResources(userResources)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUserData()
    }
  }, [params.id])

  // Get current user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('studentId')
      setCurrentUserId(userId)
    }
  }, [])

  // Download resource
  const handleDownload = async (resource: any) => {
    try {
      // If resource has a shareable link, navigate to it
      if (resource.shareable_link || resource.link) {
        const link = resource.shareable_link || resource.link
        window.open(link, '_blank')
        return
      }

      // Otherwise, try to download the file from API
      const response = await fetch(`/api/resources/download/${resource.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = resource.name || resource.title || 'resource'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading resource:', error)
      alert('Failed to download resource')
    }
  }

  // Delete resource
  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const response = await fetch(`/api/resources/delete/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      })

      if (response.ok) {
        setResources(resources.filter(r => r.id !== resourceId))
        alert('Resource deleted successfully!')
      } else {
        alert('Failed to delete resource')
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Error deleting resource')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-6 px-4 text-center">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container max-w-5xl mx-auto py-6 px-4">
        <Link 
          href="/qna"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to questions
        </Link>
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4">
      {/* Back button */}
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img 
              src={user.avatar || `https://avatar.vercel.sh/${user.first_name}`}
              alt={user.first_name || 'User'}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/20"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">
              {user.first_name} {user.second_name || ''}
            </h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
            
            {user.bio && (
              <p className="mt-3 text-sm">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {user.year_of_university && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Year {user.year_of_university}, Semester {user.semester}</span>
                </div>
              )}
              {user.address && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{user.address}</span>
                </div>
              )}
              {user.created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </div>
              )}
            </div>

            {/* Badges */}
            {user.badges && user.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {user.badges.map((badge: string, i: number) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    🏆 {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-3 min-w-[200px]">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">{questions.length}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">{answers.length}</div>
                <div className="text-xs text-muted-foreground">Answers</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold">{resources.length}</div>
                <div className="text-xs text-muted-foreground">Resources</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-2 px-1 transition-colors ${
              activeTab === "questions" 
                ? "border-b-2 border-primary text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab("answers")}
            className={`pb-2 px-1 transition-colors ${
              activeTab === "answers" 
                ? "border-b-2 border-primary text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Answers ({answers.length})
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`pb-2 px-1 transition-colors ${
              activeTab === "resources" 
                ? "border-b-2 border-primary text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-2 px-1 transition-colors ${
              activeTab === "about" 
                ? "border-b-2 border-primary text-primary font-medium" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            About
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No questions asked yet</p>
              <Link 
                href="/qna/ask"
                className="inline-block mt-2 text-primary hover:underline text-sm"
              >
                Ask a question →
              </Link>
            </div>
          ) : (
            questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          )}
        </div>
      )}

      {activeTab === "answers" && (
        <div className="space-y-4">
          {answers.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No answers given yet</p>
            </div>
          ) : (
            answers.map((answer) => (
              <div key={answer.id} className="border border-border rounded-lg bg-card p-4">
                <div className="flex items-start gap-3">
                  {/* Vote count */}
                  <div className="flex flex-col items-center min-w-[40px]">
                    <span className="text-sm font-medium">{answer.upvotes - answer.downvotes}</span>
                    <span className="text-xs text-muted-foreground">votes</span>
                  </div>
                  
                  {/* Answer content */}
                  <div className="flex-1">
                    <Link 
                      href={`/qna/question/${answer.questionId}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {answer.questionTitle}
                    </Link>
                    <div className="prose prose-sm max-w-none mt-2">
                      <p className="text-sm whitespace-pre-wrap line-clamp-2">{answer.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      <span>{answer.comments?.length || 0} comments</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(answer.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "resources" && (
        <div className="space-y-3">
          {resources.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No resources uploaded yet</p>
              <Link 
                href="/library/resources"
                className="inline-block mt-2 text-primary hover:underline text-sm"
              >
                Upload a resource →
              </Link>
            </div>
          ) : (
            resources.map((resource) => {
              return (
                <button
                  key={resource.id}
                  onClick={() => setSelectedResource(resource)}
                  className="w-full text-left bg-card border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{resource.name || resource.title}</h4>
                      <p className="text-muted-foreground text-sm line-clamp-2">{resource.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    <span className="bg-secondary/50 px-2 py-0.5 rounded-full">
                      {resource.resource_type || 'Resource'}
                    </span>
                    <span className="text-muted-foreground">
                      📅 {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <Dialog open={!!selectedResource} onOpenChange={(open) => {
          if (!open) {
            setSelectedResource(null)
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedResource.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Resource Info */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedResource.description || 'No description'}</p>
              </div>

              {/* Resource Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedResource.subject || 'General'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{formatDistanceToNow(new Date(selectedResource.created_at), { addSuffix: true })}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {currentUserId === user.id && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      handleDeleteResource(selectedResource.id)
                      setSelectedResource(null)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(selectedResource)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Feedback Section - Using ResourceFeedback Component */}
              <ResourceFeedback
                resourceId={selectedResource.id}
                resourceName={selectedResource.title}
                onFeedbackAdded={() => setRefreshKey(refreshKey + 1)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {activeTab === "about" && (
        <div className="space-y-4">
          {/* Bio */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Bio</h3>
            <p className="text-sm text-muted-foreground">
              {user.bio || "No bio provided yet."}
            </p>
          </div>
          
          {/* Academic Information */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Academic Information</h3>
            <p className="text-sm text-muted-foreground">
              {user.year_of_university && `Year ${user.year_of_university}`}
              {user.semester && `, Semester ${user.semester}`}
              {!user.year_of_university && !user.semester && "Not specified"}
            </p>
          </div>
          
          {/* Location */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">📍 Location</h3>
            <p className="text-sm text-muted-foreground">
              {user.address || "Not specified"}
            </p>
          </div>

          {/* Gender */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Gender</h3>
            <p className="text-sm text-muted-foreground">
              {user.gender ? (user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : 'Other') : "Not specified"}
            </p>
          </div>

          {/* Member Since */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">📅 Member Since</h3>
            <p className="text-sm text-muted-foreground">
              {user.created_at && new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}