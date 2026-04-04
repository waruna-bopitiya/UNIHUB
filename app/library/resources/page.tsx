'use client'

import React, { useState, useEffect } from 'react'
import { Star, Download, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/app-layout'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ResourceFeedback } from '@/components/resources/resource-feedback'
import { UserRecentResources } from '@/components/resources/user-recent-resources'
import { useAcademicData, type SelectOption } from '@/hooks/use-academic-data'

type CmpYesSemMod = {
  year: string;
  semester: string;
  module_name: string;
};

const RESOURCE_TYPES = ['PDF', 'PPT', 'Word', 'TXT', 'Excel', 'Image', 'Video', 'Audio', 'Other'] as const;

const resourceSchema = z.object({
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
  module_name: z.string().min(1, 'Module is required'),
  name: z.string().min(1, 'Resource name is required'),
  resourceType: z.enum(RESOURCE_TYPES, { errorMap: () => ({ message: 'Please select a resource type' }) }),
  shareableLink: z.string().url('Please enter a valid URL').min(1, 'Shareable link is required'),
  description: z.string().optional(),
});

type Resource = z.infer<typeof resourceSchema> & { 
  id: number;
  uploader_id: string;
  uploader_name?: string;
  ratings: number[]; 
  review?: string; 
  download_count?: number;
  resource_type?: string;
  file_path?: string;
  created_at?: string;
};

interface FeedbackStats {
  [resourceId: number]: {
    feedback_count: number;
    average_rating: number;
  };
}

export default function ResourcesPage() {
  const { years, semesters, subjects, fetchSemesters, fetchSubjects } = useAcademicData()
  
  const [resources, setResources] = useState<Resource[]>([])
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({})
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)
  const [filter, setFilter] = useState<{ year: string; semester: string; module_name: string; resourceType: string }>({ year: '', semester: '', module_name: '', resourceType: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filterSemesters, setFilterSemesters] = useState<SelectOption[]>([])
  const [filterSubjects, setFilterSubjects] = useState<SelectOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  // Get current user ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem('studentId')
    const userName = localStorage.getItem('firstName') || localStorage.getItem('studentName') || 'Anonymous'
    setCurrentUserId(userId)
    setCurrentUserName(userName)
    console.log('👤 User loaded:', { userId, userName })
  }, [])

  // Fetch feedback stats
  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch('/api/resources/feedback-stats')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        const statsMap: FeedbackStats = {}
        data.forEach((stat: any) => {
          statsMap[stat.resource_id] = {
            feedback_count: stat.feedback_count,
            average_rating: parseFloat(stat.average_rating) || 0,
          }
        })
        setFeedbackStats(statsMap)
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error)
    }
  }

  // Fetch resources on mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/resources')
        const data = await response.json()
        
        if (Array.isArray(data)) {
          console.log('📦 Fetched resources:', data.map(r => ({ id: r.id, name: r.name })))
          setResources(data.map((res: any) => ({
            id: res.id,
            uploader_id: res.uploader_id,
            uploader_name: res.uploader_name,
            year: res.year,
            semester: res.semester,
            module_name: res.module_name,
            name: res.name,
            resourceType: res.resource_type,
            shareableLink: res.shareable_link || res.link || '',
            description: res.description || '',
            ratings: [],
            download_count: res.download_count || 0,
            resource_type: res.resource_type,
            file_path: res.file_path,
            created_at: res.created_at,
          })))
          
          await fetchFeedbackStats()
        } else {
          console.error('Invalid data format:', data)
          setResources([])
        }
      } catch (error) {
        console.error('Error fetching resources:', error)
        setResources([])
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      year: '',
      semester: '',
      module_name: '',
      name: '',
      resourceType: 'PDF',
      shareableLink: '',
      description: '',
    },
  })

  // Handle year change in form
  const handleFormYearChange = (val: string) => {
    form.setValue('year', val, { shouldValidate: false })
    form.setValue('semester', '', { shouldValidate: false })
    form.setValue('module_name', '', { shouldValidate: false })
    fetchSemesters(val)
  }

  // Handle semester change in form
  const handleFormSemesterChange = (val: string) => {
    form.setValue('semester', val, { shouldValidate: false })
    form.setValue('module_name', '', { shouldValidate: false })
    const year = form.watch('year')
    fetchSubjects(year, val)
  }

  // Handle year change in filter
  const handleFilterYearChange = async (year: string) => {
    setFilter({ year, semester: '', module_name: '', resourceType: '' })
    if (year) {
      const response = await fetch(`/api/subjects?year=${year}`)
      const data = await response.json()
      setFilterSemesters(data)
    } else {
      setFilterSemesters([])
    }
    setFilterSubjects([])
  }

  // Handle semester change in filter
  const handleFilterSemesterChange = async (semester: string) => {
    setFilter((f) => ({ ...f, semester, module_name: '' }))
    if (filter.year && semester) {
      const response = await fetch(`/api/subjects?year=${filter.year}&semester=${semester}`)
      const data = await response.json()
      setFilterSubjects(data)
    } else {
      setFilterSubjects([])
    }
  }

  function onSubmit(values: z.infer<typeof resourceSchema>) {
    console.log('=== FORM SUBMISSION START ===')
    console.log('Form values:', values)
    
    if (!currentUserId) {
      console.error('❌ USER NOT LOGGED IN')
      toast.error('Please log in to upload resources')
      setSubmitting(false)
      return
    }
    
    setSubmitting(true)
    
    const payload = {
      year: values.year,
      semester: values.semester,
      module_name: values.module_name,
      name: values.name,
      resource_type: values.resourceType,
      shareable_link: values.shareableLink,
      description: values.description || '',
      uploader_id: currentUserId,
      uploader_name: currentUserName,
    }

    console.log('📤 Sending POST request to /api/resources...')
    fetch('/api/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json()
        
        console.log('↩️ Response received - Status:', res.status)
        console.log('Response data:', data)
        
        if (!res.ok) {
          const errorMsg = data.error || `Server error: ${res.status}`
          console.error('❌ API Error:', errorMsg)
          throw new Error(errorMsg)
        }
        
        return data
      })
      .then((newResource) => {
        console.log('✅ SUCCESS! Resource added:', newResource)
        
        const resourceWithId: Resource = {
          id: newResource.id as number,
          uploader_id: newResource.uploader_id || currentUserId,
          uploader_name: newResource.uploader_name || currentUserName,
          year: newResource.year,
          semester: newResource.semester,
          module_name: newResource.module_name,
          name: newResource.name,
          resourceType: newResource.resource_type,
          shareableLink: newResource.shareable_link || values.shareableLink,
          description: newResource.description || values.description,
          ratings: [],
          download_count: 0,
          resource_type: newResource.resource_type,
          file_path: newResource.file_path,
          created_at: newResource.created_at,
        }
        
        console.log('📝 Resource with ID:', { id: resourceWithId.id, name: resourceWithId.name })
        
        setResources((prev) => [resourceWithId, ...prev])
        
        toast.success(`"${values.name}" has been added successfully!`)
        
        form.reset()
        setShowForm(false)
        
      })
      .catch((err) => {
        console.error('❌ Error saving resource:', err.message)
        toast.error(err.message || 'Failed to save resource. Please try again.')
      })
      .finally(() => {
        console.log('=== FORM SUBMISSION END ===')
        setSubmitting(false)
      })
  }

  // Handle open resource link
  const handleOpenLink = (shareableLink: string, resourceName: string) => {
    // Validate link
    if (!shareableLink || shareableLink.trim() === '') {
      console.error('❌ No shareable link available')
      toast.error('This resource does not have a shareable link')
      return
    }

    try {
      // Ensure URL has protocol
      let url = shareableLink.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      console.log(`🔗 Opening link: ${url}`)
      const newWindow = window.open(url, '_blank')
      
      if (!newWindow) {
        console.error('❌ Failed to open window (popup might be blocked)')
        toast.error('Could not open link - popup may be blocked')
      } else {
        console.log(`✅ Successfully opened ${resourceName}`)
        toast.success(`Opening ${resourceName}...`)
      }
    } catch (error) {
      console.error('❌ Error opening link:', error)
      toast.error('Failed to open resource link')
    }
  }

  // Handle delete
  const handleDelete = async (resourceId: number) => {
    console.log(`🗑️ Starting delete for resource ID: ${resourceId}`)
    console.log(`👤 Current User ID: "${currentUserId}"`)
    
    if (!currentUserId) {
      console.error(`❌ User not logged in`)
      toast.error('Please log in to delete resources')
      return
    }
    
    if (!resourceId || isNaN(resourceId)) {
      console.error(`❌ Invalid resource ID for delete: ${resourceId}`)
      toast.error('Invalid resource ID. Please refresh the page.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return
    }

    setDeleting(resourceId)
    try {
      const deleteUrl = `/api/resources/delete/${resourceId}?userId=${encodeURIComponent(currentUserId)}`
      console.log(`📤 Sending DELETE request to ${deleteUrl}`)
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        console.log(`✅ Resource deleted successfully`)
        toast.success('Resource deleted successfully')
        setResources((prev) => prev.filter((res) => res.id !== resourceId))
      } else {
        const errorMsg = data.error || 'Failed to delete resource'
        console.error(`❌ Delete failed: ${errorMsg}`)
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('❌ Error deleting resource:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete resource')
    } finally {
      setDeleting(null)
    }
  }

  // Filtered resources
  const filtered = resources.filter(
    (r) =>
      (!filter.year || r.year === filter.year) &&
      (!filter.semester || r.semester === filter.semester) &&
      (!filter.module_name || r.module_name === filter.module_name) &&
      (!filter.resourceType || r.resource_type === filter.resourceType) &&
      (!searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.module_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.uploader_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Top resource (highest avg rating)
  const topResource = filtered.length
    ? [...filtered].sort((a, b) => {
        const statA = feedbackStats[a.id];
        const statB = feedbackStats[b.id];
        const avgA = statA ? statA.average_rating : 0;
        const avgB = statB ? statB.average_rating : 0;
        return avgB - avgA;
      })[0]
    : null;

  return (
    <AppLayout>
      <div className="w-full py-12 px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-primary">Resources</h1>
        
        {/* Refresh Button */}
        <div className="flex gap-2 mb-8">
          <Button 
            onClick={() => {
              console.log('🔄 Manually refreshing resources...')
              setLoading(true)
              fetch('/api/resources')
                .then(r => r.json())
                .then(data => {
                  console.log('📚 Refreshed resources:', data)
                  if (Array.isArray(data)) {
                    setResources(data.map((res: any) => ({
                      id: res.id,
                      uploader_id: res.uploader_id,
                      uploader_name: res.uploader_name,
                      year: res.year,
                      semester: res.semester,
                      module_name: res.module_name,
                      name: res.name,
                      resourceType: res.resource_type,
                      shareableLink: res.shareable_link || res.link || '',
                      description: res.description || '',
                      ratings: [],
                      download_count: res.download_count || 0,
                      resource_type: res.resource_type,
                      file_path: res.file_path,
                      created_at: res.created_at,
                    })))
                    
                    return fetch('/api/resources/feedback-stats')
                  } else {
                    throw new Error('Invalid response data')
                  }
                })
                .then(r => r.json())
                .then(statsData => {
                  if (Array.isArray(statsData)) {
                    const statsMap: FeedbackStats = {}
                    statsData.forEach((stat: any) => {
                      statsMap[stat.resource_id] = {
                        feedback_count: stat.feedback_count,
                        average_rating: parseFloat(stat.average_rating) || 0,
                      }
                    })
                    setFeedbackStats(statsMap)
                    console.log('✅ Loaded feedback stats')
                  }
                  setLoading(false)
                })
                .catch(err => {
                  console.error('❌ Refresh failed:', err)
                  setLoading(false)
                })
            }}
            variant="outline"
            size="sm"
          >
            🔄 Refresh Resources
          </Button>
        </div>

        {/* Add Resource Button and Form */}
        {!showForm && (
          <div className="flex justify-end mb-8">
            <Button size="lg" onClick={() => setShowForm(true)}>
              + Add Resource
            </Button>
          </div>
        )}

        {showForm && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 bg-card border rounded-lg p-6 mb-8 relative z-10 animate-in fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Add Resource</h2>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  ✕ Close
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Year Dropdown */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select
                        onValueChange={handleFormYearChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(years || []).map((y) => (
                            <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Semester Dropdown */}
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select
                        onValueChange={handleFormSemesterChange}
                        value={field.value}
                        disabled={!form.watch('year')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(semesters || []).map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Module Dropdown */}
                <FormField
                  control={form.control}
                  name="module_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!form.watch('year') || !form.watch('semester')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Module" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(subjects || []).map((sub) => (
                            <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Resource Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Chapter 3 Notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Resource Type Dropdown */}
                <FormField
                  control={form.control}
                  name="resourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RESOURCE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shareable Link */}
                <FormField
                  control={form.control}
                  name="shareableLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shareable Link</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://drive.google.com/file/d/..." 
                          type="url"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description (Optional) */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief description of the resource" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? '⏳ Saving...' : '✓ Save Resource'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)} 
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* User's Recent Resources Section */}
        {currentUserId && currentUserName && (
          <div className="my-12 py-8 border-t border-b bg-secondary/20 rounded-lg p-8 mb-10">
            <UserRecentResources 
              uploaderId={currentUserId} 
              uploaderName={currentUserName}
            />
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Filter Resources</h2>
          
          {/* Search Bar */}
          <div className="mb-6">
            <Input
              placeholder="🔍 Search resources by name, description, module, or uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-1/2"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear Search
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="mb-1 block">Year</Label>
              <select 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary transition" 
                value={filter.year} 
                onChange={(e) => handleFilterYearChange(e.target.value)}
              >
                <option value="">Select Year</option>
                {(years || []).map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1 block">Semester</Label>
              <select 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary transition" 
                value={filter.semester} 
                onChange={(e) => handleFilterSemesterChange(e.target.value)}
                disabled={!filter.year}
              >
                <option value="">Select Semester</option>
                {(filterSemesters || []).map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1 block">Module</Label>
              <select 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary transition" 
                value={filter.module_name} 
                onChange={(e) => setFilter((f) => ({ ...f, module_name: e.target.value }))}
                disabled={!filter.year || !filter.semester}
              >
                <option value="">Select Module</option>
                {(filterSubjects || []).map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1 block">Resource Type</Label>
              <select 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary transition" 
                value={filter.resourceType} 
                onChange={(e) => setFilter((f) => ({ ...f, resourceType: e.target.value }))}
              >
                <option value="">All Types</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Top Resource */}
        {!loading && topResource && (
          <div className="border-2 border-primary rounded-xl p-6 mb-10 bg-card shadow-lg">
            <div className="font-bold text-xl mb-2 text-primary">⭐ Top Resource: {topResource.name}</div>
            <div className="text-sm mb-2 text-muted-foreground">
              Year: {topResource.year} | Semester: {topResource.semester} | Module: {topResource.module_name} | Type: {topResource.resource_type}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Uploaded by: <span className="font-medium">{topResource.uploader_name || 'Anonymous'}</span>
            </div>
            
            {topResource.description && (
              <div className="mb-3 text-sm text-gray-700 italic">
                {topResource.description}
              </div>
            )}
            
            {/* Top Resource Rating */}
            <div className="mb-3 bg-secondary/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(feedbackStats[topResource.id]?.average_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {feedbackStats[topResource.id]?.average_rating.toFixed(1) || 0}/5 ({feedbackStats[topResource.id]?.feedback_count || 0} reviews)
                </div>
              </div>
            </div>

            {topResource.review && (
              <div className="italic text-base mb-2 text-gray-700">
                Review: {topResource.review}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={() => handleOpenLink(topResource.shareableLink, topResource.name)}
                className="gap-2"
              >
                <ExternalLink size={18} />
                Open Resource
              </Button>
              <Button
                onClick={() => setSelectedResource(topResource)}
                variant="outline"
              >
                📊 View Feedback
              </Button>
            </div>
          </div>
        )}

        {/* All Resources Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Resources List</h2>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading resources...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">No resources found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((res) => {
                const stat = feedbackStats[res.id] || { feedback_count: 0, average_rating: 0 };
                const avg = stat.average_rating || 0;
                const isOwner = currentUserId === res.uploader_id;

                return (
                  <div key={res.id} className="border rounded-xl p-6 bg-card flex flex-col justify-between h-full shadow-sm hover:shadow-lg transition-shadow">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-2">{res.name}</h3>
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded whitespace-nowrap ml-2">
                          {res.resource_type}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <div>Year: {res.year} | Sem: {res.semester}</div>
                        <div>{res.module_name}</div>
                        <div className="text-xs mt-1">By: {res.uploader_name || 'Anonymous'}</div>
                      </div>

                      {res.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{res.description}</p>
                      )}

                      {/* Rating Section */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold">{avg.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{stat.feedback_count} reviews</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        onClick={() => handleOpenLink(res.shareableLink, res.name)}
                        size="sm"
                        className="flex-1 gap-2"
                      >
                        <ExternalLink size={16} />
                        Open
                      </Button>
                      <Button
                        onClick={() => setSelectedResource(res)}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        💬 Feedback
                      </Button>
                      {isOwner && (
                        <Button
                          onClick={() => handleDelete(res.id)}
                          size="sm"
                          variant="destructive"
                          disabled={deleting === res.id}
                          className="gap-1"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resource Detail Modal */}
        {selectedResource && (
          <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedResource.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="bg-secondary/30 rounded-lg p-3 space-y-2 text-sm">
                    <div><strong>Type:</strong> {selectedResource.resource_type}</div>
                    <div><strong>Year/Semester:</strong> {selectedResource.year}/{selectedResource.semester}</div>
                    <div><strong>Module:</strong> {selectedResource.module_name}</div>
                    <div><strong>Uploaded by:</strong> {selectedResource.uploader_name || 'Anonymous'}</div>
                    {selectedResource.description && (
                      <div><strong>Description:</strong> {selectedResource.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-secondary/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < Math.round(feedbackStats[selectedResource.id]?.average_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <div className="text-sm">
                      {feedbackStats[selectedResource.id]?.average_rating.toFixed(1) || 0}/5 ({feedbackStats[selectedResource.id]?.feedback_count || 0} reviews)
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleOpenLink(selectedResource.shareableLink, selectedResource.name)}
                  className="w-full gap-2"
                  size="lg"
                >
                  <ExternalLink size={20} />
                  Open Resource
                </Button>

                <ResourceFeedback 
                  resourceId={selectedResource.id} 
                  resourceName={selectedResource.name}
                  onFeedbackAdded={fetchFeedbackStats}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
