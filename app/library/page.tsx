import { AppLayout } from '@/components/layout/app-layout'
import { LibraryFilters } from '@/components/library/library-filters'
import { MaterialCard } from '@/components/library/material-card'
import { Upload } from 'lucide-react'

const mockMaterials = [
  {
    id: '1',
    title: 'Complete Guide to React Hooks - Advanced Patterns',
    subject: 'Computer Science',
    uploader: 'Prof. Sarah Chen',
    downloads: 2341,
    views: 5623,
    likes: 423,
    fileType: 'PDF',
    uploadDate: 'Jan 15, 2024',
  },
  {
    id: '2',
    title: 'Linear Algebra: Matrices & Eigenvalues',
    subject: 'Mathematics',
    uploader: 'Dr. James Wilson',
    downloads: 1876,
    views: 4201,
    likes: 312,
    fileType: 'PDF',
    uploadDate: 'Jan 14, 2024',
  },
  {
    id: '3',
    title: 'Thermodynamics Lecture Notes',
    subject: 'Physics',
    uploader: 'Prof. Michael Brown',
    downloads: 1543,
    views: 3456,
    likes: 287,
    fileType: 'DOCX',
    uploadDate: 'Jan 13, 2024',
  },
  {
    id: '4',
    title: 'Python Data Science Masterclass',
    subject: 'Computer Science',
    uploader: 'Alex Kumar',
    downloads: 3214,
    views: 7821,
    likes: 654,
    fileType: 'ZIP',
    uploadDate: 'Jan 12, 2024',
  },
  {
    id: '5',
    title: 'Organic Chemistry: Reaction Mechanisms',
    subject: 'Chemistry',
    uploader: 'Dr. Emma Roberts',
    downloads: 987,
    views: 2145,
    likes: 156,
    fileType: 'PPT',
    uploadDate: 'Jan 11, 2024',
  },
  {
    id: '6',
    title: 'Biology: Molecular & Cell Structure',
    subject: 'Biology',
    uploader: 'Prof. David Lee',
    downloads: 1654,
    views: 3876,
    likes: 298,
    fileType: 'PDF',
    uploadDate: 'Jan 10, 2024',
  },
]

export default function LibraryPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Study Library
              </h1>
              <p className="text-muted-foreground mt-2">
                Access thousands of shared study materials from tutors and
                students
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
              <Upload className="w-5 h-5" />
              Upload Material
            </button>
          </div>
        </div>

        {/* Filters */}
        <LibraryFilters />

        {/* Materials Grid - Using real resources + mock data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMaterials.map((material) => (
            <MaterialCard key={material.id} {...material} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors font-medium">
            Load More Materials
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
