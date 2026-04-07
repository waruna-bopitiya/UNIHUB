'use client'

import { Search, User, Menu, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/notification-bell'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, Loader } from 'lucide-react'

interface TopBarProps {
  onMenuClick?: () => void
}

interface UserProfile {
  id: string
  first_name: string
  second_name: string
  email: string
  phone_number: string
  address: string
  gender: string
  year_of_university: number
  semester: number
  created_at: string
  last_login: string | null
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState<{
    first_name: string
    second_name: string
    phone_number: string
    address: string
    gender: string
    year_of_university: number
    semester: number
  } | null>(null)

  useEffect(() => {
    // Check if user is logged in on mount
    if (typeof window !== 'undefined') {
      const studentId = localStorage.getItem('studentId')
      const storedFirstName = localStorage.getItem('firstName')
      setIsLoggedIn(!!studentId)
      setFirstName(storedFirstName || '')

      // Listen for storage changes (when user logs in from another tab or after page reload)
      const handleStorageChange = () => {
        const updatedStudentId = localStorage.getItem('studentId')
        const updatedFirstName = localStorage.getItem('firstName')
        setIsLoggedIn(!!updatedStudentId)
        setFirstName(updatedFirstName || '')
        setUserProfile(null) // Clear cached profile
      }

      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const fetchUserProfile = async () => {
    if (!isLoggedIn) return

    setLoading(true)
    setError('')

    try {
      const studentId = localStorage.getItem('studentId')
      if (!studentId) {
        setError('Student ID not found')
        return
      }

      const response = await fetch(`/api/user/profile?id=${studentId}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to load profile')
        return
      }

      setUserProfile(data)
      // Initialize edit data when profile is loaded
      setEditData({
        first_name: data.first_name,
        second_name: data.second_name,
        phone_number: data.phone_number,
        address: data.address,
        gender: data.gender,
        year_of_university: data.year_of_university,
        semester: data.semester,
      })
    } catch (err) {
      setError('An error occurred while loading profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileClick = () => {
    setShowProfileModal(true)
    setIsEditMode(false)
    if (!userProfile) {
      fetchUserProfile()
    }
  }

  const handleEditClick = () => {
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setError('')
    // Reset edit data to current profile
    if (userProfile) {
      setEditData({
        first_name: userProfile.first_name,
        second_name: userProfile.second_name,
        phone_number: userProfile.phone_number,
        address: userProfile.address,
        gender: userProfile.gender,
        year_of_university: userProfile.year_of_university,
        semester: userProfile.semester,
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!editData || !userProfile) return

    setIsSaving(true)
    setError('')

    try {
      const studentId = localStorage.getItem('studentId')
      if (!studentId) {
        setError('Student ID not found')
        return
      }

      const response = await fetch(`/api/user/profile?id=${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save profile')
        return
      }

      setUserProfile(data)
      setIsEditMode(false)
      setError('')
    } catch (err) {
      setError('An error occurred while saving profile')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Get the user ID from localStorage
      const userId = localStorage.getItem('studentId')
      
      if (userId) {
        // Call logout endpoint to record logout time
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Logout time recorded:', data.logoutTime)
        } else {
          console.error('Failed to record logout time')
        }
      }
    } catch (error) {
      console.error('Error recording logout time:', error)
    } finally {
      // Clear localStorage regardless of API success
      localStorage.removeItem('studentId')
      localStorage.removeItem('firstName')
      localStorage.removeItem('rememberMe')
      setIsLoggedIn(false)
      setFirstName('')
      setUserProfile(null)
      setShowProfileModal(false)
      window.location.href = '/'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <header className="h-16 border-b border-border bg-card sticky top-0 z-40">
        <div className="h-full px-6 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses, tutors, materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications - only show if logged in */}
            {isLoggedIn && (
              <NotificationBell />
            )}

            {/* Login/Signup Buttons - show if NOT logged in */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              /* User Profile Button & Logout - show if logged in */
              <div className="flex items-center gap-2">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{firstName || 'Profile'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>My Profile</DialogTitle>
                <DialogDescription>
                  {isEditMode ? 'Edit your profile information' : 'Your account information and details'}
                </DialogDescription>
              </div>
              {!isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditClick}
                  disabled={loading || isSaving}
                >
                  Edit
                </Button>
              )}
            </div>
          </DialogHeader>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : userProfile && editData ? (
            <div className="space-y-4">
              {!isEditMode ? (
                <>
                  {/* View Mode */}
                  {/* Student ID and Name */}
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Student ID</p>
                    <p className="text-lg font-bold text-foreground mb-3">{userProfile.id}</p>
                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                    <p className="text-foreground font-semibold">
                      {userProfile.first_name} {userProfile.second_name || ''}
                    </p>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground">Contact Information</h3>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground">{userProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm text-foreground">{userProfile.phone_number}</p>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-foreground">Academic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Year</p>
                        <p className="text-sm text-foreground font-medium">Year {userProfile.year_of_university}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Semester</p>
                        <p className="text-sm text-foreground font-medium">Semester {userProfile.semester}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {userProfile.address && (
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm text-foreground">{userProfile.address}</p>
                    </div>
                  )}

                  {/* Gender */}
                  {userProfile.gender && (
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="text-sm text-foreground capitalize">{userProfile.gender}</p>
                    </div>
                  )}

                  {/* Account Timestamps */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Member Since</p>
                      <p className="text-foreground font-medium">{formatDate(userProfile.created_at)}</p>
                    </div>
                    {userProfile.last_login && (
                      <div>
                        <p className="text-muted-foreground">Last Login</p>
                        <p className="text-foreground font-medium">{formatDate(userProfile.last_login)}</p>
                      </div>
                    )}
                  </div>

                  {/* Logout Button */}
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="space-y-4">
                    {/* First Name */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">First Name *</label>
                      <input
                        type="text"
                        value={editData.first_name}
                        onChange={(e) =>
                          setEditData({ ...editData, first_name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="First name"
                      />
                    </div>

                    {/* Second Name */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Second Name *</label>
                      <input
                        type="text"
                        value={editData.second_name}
                        onChange={(e) =>
                          setEditData({ ...editData, second_name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Second name"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Phone Number with Country Code *</label>
                      <input
                        type="text"
                        value={editData.phone_number}
                        onChange={(e) =>
                          setEditData({ ...editData, phone_number: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. +94 123456789"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Gender *</label>
                      <select
                        value={editData.gender}
                        onChange={(e) =>
                          setEditData({ ...editData, gender: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Year */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Year *</label>
                      <select
                        value={editData.year_of_university}
                        onChange={(e) =>
                          setEditData({ ...editData, year_of_university: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>

                    {/* Semester */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Semester *</label>
                      <select
                        value={editData.semester}
                        onChange={(e) =>
                          setEditData({ ...editData, semester: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1.5">Address</label>
                      <textarea
                        value={editData.address}
                        onChange={(e) =>
                          setEditData({ ...editData, address: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Your address"
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        disabled={isSaving}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
