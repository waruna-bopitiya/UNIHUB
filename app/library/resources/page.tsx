'use client'

import React, { useState, useEffect } from 'react'
import { Star, Download, Trash2 } from 'lucide-react'
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
import { useAcademicData, type SelectOption } from '@/hooks/use-academic-data'

type CmpYesSemMod = {
  year: string;
  semester: string;
  module_name: string;
};

const resourceSchema = z.object({
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
  module_name: z.string().min(1, 'Module is required'),
  name: z.string().min(1, 'Resource name is required'),
  resourceType: z.enum(['file', 'link']),
  file: z.instanceof(File).nullable().optional(),
  link: z.string().optional(),
});

type Resource = z.infer<typeof resourceSchema> & { 
  id: number;
  uploader_id: string;
  ratings: number[]; 
  review?: string; 
  download_count?: number;
  resource_type?: string;
  file_path?: string;
};

interface FeedbackStats {
  [resourceId: number]: {
    feedback_count: number;
    average_rating: number;
  };
}

export default function ResourcesPage() {
  const { years, semesters, subjects, fetchSemesters, fetchSubjects } = useAcademicData()
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const [resources, setResources] = useState<Resource[]>([])
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({})
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<{ year: string; semester: string; module_name: string }>({ year: '', semester: '', module_name: '' })
  const [showForm, setShowForm] = useState(true)
  const [resourceType, setResourceType] = useState<'file' | 'link'>('file')
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [filterSemesters, setFilterSemesters] = useState<SelectOption[]>([])
  const [filterSubjects, setFilterSubjects] = useState<SelectOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  // Get current user ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem('studentId')
    setCurrentUserId(userId)
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
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          console.log('📦 Raw API Response - First Resource:', data[0])
          console.log('📦 Fetched resources:', data.map(r => ({ id: r.id, name: r.name })))
          setResources(data.map((res: any) => {
            if (!res.id) {
              console.warn('⚠️ Resource missing ID:', res)
            }
            return {
              id: res.id,
              uploader_id: res.uploader_id,
              year: res.year,
              semester: res.semester,
              module_name: res.module_name,
              name: res.name,
              resourceType: res.resource_type,
              file: null as any,
              link: res.link || '',
              ratings: [],
              download_count: res.download_count || 0,
              resource_type: res.resource_type,
              file_path: res.file_path,
            }
          }))
          
          // Fetch feedback stats after resources are loaded
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
      resourceType: 'file',
      file: null,
      link: '',
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
    setFilter({ year, semester: '', module_name: '' })
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
    console.log('ResourceType:', values.resourceType)
    console.log('File:', values.file instanceof File ? { name: values.file.name, size: values.file.size } : `NOT A FILE (${typeof values.file}):`, values.file)
    console.log('Link:', values.link)
    console.log('All values:', values)
    
    // Check if user is logged in
    if (!currentUserId) {
      console.error('❌ USER NOT LOGGED IN')
      toast.error('Please log in to upload resources')
      setSubmitting(false)
      return
    }
    
    setSubmitting(true)
    
    // Final validation before submit
    if (values.resourceType === 'file') {
      if (!(values.file instanceof File)) {
        console.error('❌ FILE MODE VALIDATION FAILED - File is not a File object:', values.file)
        toast.error('Please select a file to upload')
        setSubmitting(false)
        return
      }
      console.log('✅ File validation passed:', values.file.name)
    } else if (values.resourceType === 'link') {
      if (!values.link || values.link.trim() === '') {
        console.error('❌ LINK MODE VALIDATION FAILED - Link is empty')
        toast.error('Please enter a valid resource link')
        setSubmitting(false)
        return
      }
      console.log('✅ Link validation passed:', values.link)
    }
    
    console.log('✅ All validations passed, preparing FormData...')
    
    // Show loading toast
    toast.loading('Saving your resource...')
    
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('year', values.year)
    formData.append('semester', values.semester)
    formData.append('module_name', values.module_name)
    formData.append('name', values.name)
    formData.append('resourceType', values.resourceType)
    formData.append('uploaderId', currentUserId)
    
    if (values.resourceType === 'file' && values.file instanceof File) {
      console.log('📁 Adding file to FormData:', values.file.name, `(${values.file.size} bytes)`)
      formData.append('file', values.file)
    } else if (values.resourceType === 'link' && values.link) {
      console.log('🔗 Adding link to FormData:', values.link)
      formData.append('link', values.link)
    }

    console.log('📤 Sending POST request to /api/resources...')
    fetch('/api/resources', {
      method: 'POST',
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json()
        
        console.log('↩️ Response received - Status:', res.status)
        console.log('Response data:', data)
        
        // Check if response is not ok
        if (!res.ok) {
          const errorMsg = data.error || `Server error: ${res.status}`
          console.error('❌ API Error:', errorMsg)
          throw new Error(errorMsg)
        }
        
        return data
      })
      .then((newResource) => {
        console.log('✅ SUCCESS! Resource added:', newResource)
        
        // Ensure id is properly set and all fields are mapped
        const resourceWithId: Resource = {
          id: newResource.id as number,
          uploader_id: newResource.uploader_id || currentUserId,
          year: newResource.year,
          semester: newResource.semester,
          module_name: newResource.module_name,
          name: newResource.name,
          resourceType: newResource.resource_type,
          file: null as any,
          link: newResource.link || '',
          ratings: [],
          download_count: newResource.download_count || 0,
          resource_type: newResource.resource_type,
          file_path: newResource.file_path,
        }
        
        console.log('📝 Resource with ID:', { id: resourceWithId.id, name: resourceWithId.name, uploader_id: resourceWithId.uploader_id })
        
        setResources((prev) => [resourceWithId, ...prev])
        
        // Show success toast
        toast.success(`"${values.name}" has been added successfully!`)
        
        // Reset form for next entry
        form.reset()
        setResourceType('file')
        setSelectedFileName('')
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        // Keep the form open so user can add more resources
        // User can click "Close" button to close it manually
      })
      .catch((err) => {
        console.error('❌ Error saving resource:', err.message)
        // Show error toast with actual error message
        toast.error(err.message || 'Failed to save resource. Please try again.')
        // KEEP FORM OPEN ON ERROR so user can retry
      })
      .finally(() => {
        console.log('=== FORM SUBMISSION END ===')
        setSubmitting(false)
      })
  }

  // Handle download
  const handleDownload = async (resourceId: number, resourceName: string) => {
    try {
      console.log(`📥 Starting download for resource ID: ${resourceId}, Name: ${resourceName}`)
      
      // Validate resourceId
      if (!resourceId || isNaN(resourceId)) {
        console.error(`❌ Invalid resource ID: ${resourceId}`)
        toast.error('Invalid resource ID. Please refresh the page.')
        return
      }

      console.log(`📤 Fetching: /api/resources/download/${resourceId}`)
      const response = await fetch(`/api/resources/download/${resourceId}`)

      // Check if response is ok first
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to download resource')
      }

      // Update download count in local state
      setResources((prev) =>
        prev.map((res) =>
          res.id === resourceId
            ? { ...res, download_count: (res.download_count || 0) + 1 }
            : res
        )
      )

      // Check content type to determine response type
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        // It's a link resource
        const data = await response.json()
        if (data.url) {
          window.open(data.url, '_blank')
        }
      } else if (contentType && contentType.includes('application/octet-stream')) {
        // It's a file resource - download it
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = resourceName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // Default: try to download as file
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = resourceName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading resource:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to download resource')
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
        console.error(`📊 Response status: ${response.status}`)
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
      (!filter.module_name || r.module_name === filter.module_name)
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
      <div className="max-w-6xl mx-auto py-12 px-6">
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
                    const mappedResources = data.map((res: any) => {
                      console.log(`📋 Resource: id=${res.id}, name=${res.name}`)
                      return {
                        id: res.id,
                        uploader_id: res.uploader_id,
                        year: res.year,
                        semester: res.semester,
                        module_name: res.module_name,
                        name: res.name,
                        resourceType: res.resource_type,
                        file: null as any,
                        link: res.link || '',
                        ratings: [],
                        download_count: res.download_count || 0,
                        resource_type: res.resource_type,
                        file_path: res.file_path,
                      }
                    })
                    console.log(`✅ Loaded ${mappedResources.length} resources`)
                    setResources(mappedResources)
                    
                    // Also fetch feedback stats
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
              Add Resource
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
                        defaultValue=""
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
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
                        defaultValue=""
                        disabled={!form.watch('year')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((s) => (
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
                        defaultValue=""
                        disabled={!form.watch('year') || !form.watch('semester')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Module" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Resource Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Resource Type Switch */}
                <div className="col-span-1 md:col-span-2">
                  <FormLabel className="mb-3 block">Resource Type</FormLabel>
                  <div className="flex gap-3 items-center">
                    <Button
                      type="button"
                      variant={resourceType === 'file' ? 'default' : 'outline'}
                      onClick={() => {
                        console.log('Switching to FILE mode')
                        setResourceType('file')
                        setSelectedFileName('')
                        form.setValue('resourceType', 'file')
                        form.setValue('file', null)
                        form.setValue('link', '')
                        // Reset file input
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="flex-1"
                    >
                      📁 Upload File
                    </Button>
                    <Button
                      type="button"
                      variant={resourceType === 'link' ? 'default' : 'outline'}
                      onClick={() => {
                        console.log('Switching to LINK mode')
                        setResourceType('link')
                        setSelectedFileName('')
                        form.setValue('resourceType', 'link')
                        form.setValue('file', null)
                        form.setValue('link', '')
                        // Reset file input
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="flex-1"
                    >
                      🔗 Resource Link
                    </Button>
                  </div>
                </div>
                {/* File or Link Input */}
                {resourceType === 'file' ? (
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="file-input" className="mb-3 block">Select File to Upload</Label>
                    <div className="space-y-2">
                      <label htmlFor="file-input" className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                        <div className="text-center">
                          <p className="font-medium">📤 Click to select file</p>
                          <p className="text-sm text-muted-foreground">or drag and drop</p>
                          {selectedFileName && (
                            <p className="text-sm text-green-600 font-medium mt-2">✓ {selectedFileName}</p>
                          )}
                        </div>
                        <input 
                          id="file-input"
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0]
                            console.log('📁 File input changed:', selectedFile?.name, 'Size:', selectedFile?.size)
                            if (selectedFile) {
                              console.log('📝 Setting file in form:', selectedFile.name)
                              form.setValue('file', selectedFile, { shouldValidate: true })
                              setSelectedFileName(selectedFile.name)
                              console.log('✅ File set successfully')
                            }
                          }}
                          accept="*"
                        />
                      </label>
                      {form.formState.errors.file && (
                        <p className="text-sm text-red-500">{form.formState.errors.file.message}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Resource Link URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/resource" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1"
                  onClick={async () => {
                    console.log('🔘 Add Resource button clicked')
                    // Trigger validation on all fields
                    const isValid = await form.trigger()
                    console.log('Form valid after trigger:', isValid)
                    console.log('Form errors:', form.formState.errors)
                    console.log('Current form values:', form.getValues())
                  }}
                >
                  {submitting ? 'Saving...' : 'Add Resource'}
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

        {/* Filter Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Filter Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="mb-1 block">Year</Label>
              <select 
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary transition" 
                value={filter.year} 
                onChange={(e) => handleFilterYearChange(e.target.value)}
              >
                <option value="">Select Year</option>
                {years.map((y) => (
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
                {filterSemesters.map((s) => (
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
                {filterSubjects.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Top Resource */}
        {!loading && topResource && (
          <div className="border-2 border-primary rounded-xl p-6 mb-10 bg-card shadow-lg">
            <div className="font-bold text-xl mb-2 text-primary">Top Resource: {topResource.name}</div>
            <div className="text-sm mb-2 text-muted-foreground">Year: {topResource.year}, Semester: {topResource.semester}, Module: {topResource.module_name}</div>
            
            {/* Top Resource Rating */}
            <div className="mb-3 bg-secondary/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const topStat = feedbackStats[topResource.id];
                    const avg = topStat ? topStat.average_rating : 0;
                    return (
                      <Star
                        key={star}
                        size={20}
                        className={
                          avg >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    );
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const topStat = feedbackStats[topResource.id];
                    if (topStat && topStat.feedback_count > 0) {
                      return (
                        <>
                          <span className="font-semibold text-foreground">{topStat.average_rating.toFixed(1)}</span>
                          <span> ({topStat.feedback_count} reviews)</span>
                        </>
                      );
                    } else {
                      return <span>No ratings yet</span>;
                    }
                  })()}
                </div>
              </div>
            </div>
            
            {topResource.review && <div className="italic text-base mb-2 text-gray-700">Review: {topResource.review}</div>}
            <div className="flex gap-3">
              {topResource.resource_type === 'file' && topResource.file_path && (
                <Button
                  onClick={() => handleDownload(topResource.id!, topResource.name)}
                  className="flex items-center gap-2"
                >
                  <Download size={18} />
                  Download ({topResource.download_count || 0})
                </Button>
              )}
              {topResource.resource_type === 'link' && topResource.link && (
                <a
                  href={topResource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium"
                >
                  Visit Resource
                </a>
              )}
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
              {filtered.map((res, idx) => {
                const stat = feedbackStats[res.id] || { feedback_count: 0, average_rating: 0 };
                const avg = stat.average_rating || 0;
                return (
                  <div key={res.id || res.name + idx} className="border rounded-xl p-6 bg-card flex flex-col justify-between h-full shadow-sm hover:shadow-lg transition-shadow">
                    <div>
                      <div className="font-semibold text-lg mb-2 text-primary truncate" title={res.name}>{res.name}</div>
                      <div className="text-sm mb-2 text-muted-foreground">Year: {res.year}, Semester: {res.semester}, Module: {res.module_name}</div>
                      
                      {/* Rating Summary */}
                      <div className="mb-3 bg-secondary/30 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={
                                  avg >= star
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stat.feedback_count > 0 ? (
                              <>
                                <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
                                <span> ({stat.feedback_count})</span>
                              </>
                            ) : (
                              <span>No ratings</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {res.review && <div className="italic text-base mb-2 text-gray-700">Review: {res.review}</div>}
                    </div>
                    <div className="flex flex-col gap-2">
                      {res.resource_type === 'file' && res.file_path && res.id && (
                        <Button
                          onClick={() => handleDownload(res.id, res.name)}
                          className="w-full flex items-center justify-center gap-2"
                          disabled={deleting === res.id}
                        >
                          <Download size={18} />
                          Download ({res.download_count || 0})
                        </Button>
                      )}
                      {res.resource_type === 'link' && res.link && res.id && (
                        <a
                          href={res.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline font-medium text-center p-2"
                        >
                          Visit Link (Downloads: {res.download_count || 0})
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedResource(res)}
                        className="w-full"
                      >
                        View Details & Feedback
                      </Button>
                      {/* Delete button only for uploader */}
                      {currentUserId && currentUserId === res.uploader_id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(res.id)}
                          disabled={deleting === res.id}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Trash2 size={18} />
                          {deleting === res.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      )}
                      {/* Message for non-uploaders */}
                      {currentUserId && currentUserId !== res.uploader_id && (
                        <div className="w-full px-4 py-2 bg-secondary/50 rounded-lg text-center text-xs text-muted-foreground">
                          Only uploader can delete
                        </div>
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
                  <p className="text-sm text-muted-foreground">Year: {selectedResource.year}</p>
                  <p className="text-sm text-muted-foreground">Semester: {selectedResource.semester}</p>
                  <p className="text-sm text-muted-foreground">Module: {selectedResource.module_name}</p>
                  <p className="text-sm text-muted-foreground">Type: {selectedResource.resource_type}</p>
                  <p className="text-sm text-muted-foreground">Downloads: {selectedResource.download_count || 0}</p>
                </div>
                
                <div className="bg-secondary/30 rounded-lg p-4">
                  {selectedResource.resource_type === 'file' && selectedResource.file_path && (
                    <Button
                      onClick={() => handleDownload(selectedResource.id, selectedResource.name)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download
                    </Button>
                  )}
                  {selectedResource.resource_type === 'link' && selectedResource.link && (
                    <a
                      href={selectedResource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
                    >
                      Visit Resource Link
                    </a>
                  )}
                </div>

                {/* Feedback Component */}
                <ResourceFeedback 
                  resourceId={selectedResource.id} 
                  resourceName={selectedResource.name}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}
