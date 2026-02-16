'use client'

import { Search, Filter } from 'lucide-react'
import { useState } from 'react'

interface LibraryFiltersProps {
  onFilterChange?: (filters: FilterState) => void
}

interface FilterState {
  search: string
  subject: string
  fileType: string
  sortBy: string
}

export function LibraryFilters({ onFilterChange }: LibraryFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    subject: '',
    fileType: '',
    sortBy: 'recent',
  })

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-foreground" />
        <h3 className="font-semibold text-foreground">Filter & Search</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Search Materials
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                handleFilterChange('search', e.target.value)
              }
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Subject
          </label>
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Subjects</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Engineering">Engineering</option>
          </select>
        </div>

        {/* File Type Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            File Type
          </label>
          <select
            value={filters.fileType}
            onChange={(e) => handleFilterChange('fileType', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">Word Document</option>
            <option value="PPT">Presentation</option>
            <option value="ZIP">Archive</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Downloaded</option>
            <option value="rated">Highest Rated</option>
            <option value="views">Most Views</option>
          </select>
        </div>
      </div>
    </div>
  )
}
