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
import { External, Trash2 } from 'lucide-react'
import { ExternalLink } from 'lucide-react'
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
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <Select
                    value={filters.year}
                    onValueChange={(value) =>
                      setFilters(f => ({ ...f, year: value }))
                    }
                  >
                    <SelectTrigger>
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
                  <label className="block text-sm font-medium mb-2">Semester</label>
                  <Select
                    value={filters.semester}
                    onValueChange={(value) =>
                      setFilters(f => ({ ...f, semester: value }))
                    }
                  >
                    <SelectTrigger>
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
                  <label className="block text-sm font-medium mb-2">Module</label>
                  <Select
                    value={filters.moduleName}
                    onValueChange={(value) =>
                      setFilters(f => ({ ...f, moduleName: value }))
                    }
                  >
                    <SelectTrigger>
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
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resources List */}
          <div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {(filters.year || filters.semester || filters.moduleName)
                      ? 'No resources found matching your filters'
                      : 'You have not uploaded any resources yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {resources.map(resource => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {/* Resource Header */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{resource.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {resource.year} | {resource.semester} | {resource.module_name}
                            </p>
                          </div>
                          <div className="bg-secondary px-3 py-1 rounded-full">
                            <span className="text-xs font-medium">{resource.resource_type}</span>
                          </div>
                        </div>

                        {/* Description */}
                        {resource.description && (
                          <p className="text-sm text-gray-600 italic">
                            {resource.description}
                          </p>
                        )}

                        {/* Upload Info */}
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>
                            Uploaded: {new Date(resource.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t">
                          {resource.shareable_link && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleOpenLink(
                                  resource.shareable_link,
                                  resource.name
                                )
                              }
                              className="gap-2 flex-1"
                            >
                              <ExternalLink size={16} />
                              Open Resource
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deleting === resource.id}
                            onClick={() => handleDelete(resource.id)}
                            className="gap-2"
                          >
                            <Trash2 size={16} />
                            {deleting === resource.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Results Count */}
                <div className="text-center text-sm text-muted-foreground py-4">
                  Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
