'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface SelectOption {
  value: string
  label: string
}

interface UserResource {
  id: number
  name: string
  year: string
  semester: string
  module_name: string
  resource_type: string
  shareable_link: string
  description: string
  uploader_name: string
  created_at: string
}

interface UserRecentResourcesProps {
  uploaderId: string
  uploaderName: string
}

export function UserRecentResources({ uploaderId, uploaderName }: UserRecentResourcesProps) {
  const [resources, setResources] = useState<UserResource[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    year: '',
    semester: '',
    moduleName: '',
  })
  
  // Filter options
  const [yearOptions, setYearOptions] = useState<SelectOption[]>([])
  const [semesterOptions, setSemesterOptions] = useState<SelectOption[]>([])
  const [moduleOptions, setModuleOptions] = useState<SelectOption[]>([])

  // Fetch filter options and resources
  useEffect(() => {
    fetchFilterOptions()
  }, [uploaderId])

  // Fetch resources when filters change
  useEffect(() => {
    fetchResources()
  }, [filters])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`/api/resources/user-filters?uploaderId=${uploaderId}`)
      const data = await response.json()
      
      setYearOptions(data.years || [])
      setSemesterOptions(data.semesters || [])
      setModuleOptions(data.modules || [])
      
      console.log('✅ Filter options loaded:', data)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const fetchResources = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({ uploaderId })
      if (filters.year) params.append('year', filters.year)
      if (filters.semester) params.append('semester', filters.semester)
      if (filters.moduleName) params.append('moduleName', filters.moduleName)
      
      const response = await fetch(`/api/resources/my-resources?${params.toString()}`)
      const data = await response.json()
      
      setResources(Array.isArray(data) ? data : [])
      console.log(`✅ Loaded ${data.length} resources`)
    } catch (error) {
      console.error('Error fetching resources:', error)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenLink = (shareableLink: string, resourceName: string) => {
    if (!shareableLink || shareableLink.trim() === '') {
      toast.error('This resource does not have a shareable link')
      return
    }

    try {
      let url = shareableLink.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      window.open(url, '_blank')
      toast.success(`Opening ${resourceName}...`)
    } catch (error) {
      console.error('Error opening link:', error)
      toast.error('Failed to open resource link')
    }
  }

  const handleDelete = async (resourceId: number) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return
    }

    setDeleting(resourceId)
    try {
      const response = await fetch(`/api/resources/delete/${resourceId}?userId=${uploaderId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Resource deleted successfully')
        setResources(prev => prev.filter(r => r.id !== resourceId))
      } else {
        toast.error(data.error || 'Failed to delete resource')
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Failed to delete resource')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📚 My Resources</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {resources.length} resource{resources.length !== 1 ? 's' : ''} uploaded by {uploaderName}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          {isExpanded ? '▼' : '▶'} {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-secondary/5 border border-border/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">🔍 Filter Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Year</label>
                <Select
                  value={filters.year}
                  onValueChange={(value) =>
                    setFilters(f => ({ ...f, year: value }))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Semester</label>
                <Select
                  value={filters.semester}
                  onValueChange={(value) =>
                    setFilters(f => ({ ...f, semester: value }))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map(semester => (
                      <SelectItem key={semester.value} value={semester.value}>
                        {semester.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Module Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Module</label>
                <Select
                  value={filters.moduleName}
                  onValueChange={(value) =>
                    setFilters(f => ({ ...f, moduleName: value }))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Modules" />
                  </SelectTrigger>
                  <SelectContent>
                    {moduleOptions.map(module => (
                      <SelectItem key={module.value} value={module.value}>
                        {module.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filters.year || filters.semester || filters.moduleName) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({ year: '', semester: '', moduleName: '' })
                  }
                  className="text-xs"
                >
                  ✕ Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Resources Grid */}
          <div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="bg-secondary/5 border border-border/30 rounded-xl p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  {(filters.year || filters.semester || filters.moduleName)
                    ? 'No resources found matching your filters'
                    : 'You have not uploaded any resources yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map(resource => (
                    <div key={resource.id} className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-border transition-all duration-200 flex flex-col">
                      {/* Header */}
                      <div className="mb-4 pb-4 border-b border-border/30">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-lg text-foreground line-clamp-2 flex-1">{resource.name}</h3>
                          <span className="flex-shrink-0 bg-primary/10 text-primary text-xs px-3 py-1 rounded-md font-medium whitespace-nowrap">
                            {resource.resource_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-md font-medium">
                            {resource.module_name}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                        <div>📅 <span className="font-medium text-foreground">{resource.year}</span> - Semester <span className="font-medium text-foreground">{resource.semester}</span></div>
                        <div>📤 <span className="font-medium text-foreground">{new Date(resource.created_at).toLocaleDateString()}</span></div>
                        {resource.description && (
                          <p className="italic text-xs text-muted-foreground line-clamp-2 mt-2">
                            "{resource.description}"
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-auto">
                        {resource.shareable_link && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleOpenLink(
                                resource.shareable_link,
                                resource.name
                              )
                            }
                            className="w-full gap-1 shadow-sm hover:shadow-md"
                          >
                            <ExternalLink size={16} />
                            View Resource
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleting === resource.id}
                          onClick={() => handleDelete(resource.id)}
                          className="w-full gap-1"
                        >
                          <Trash2 size={16} />
                          {deleting === resource.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Results Count */}
                <div className="text-center text-sm text-muted-foreground py-4 border-t border-border/30">
                  Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
