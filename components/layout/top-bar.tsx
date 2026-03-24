'use client'

import { Search, Bell, User, Menu, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is logged in on mount
    if (typeof window !== 'undefined') {
      const studentId = localStorage.getItem('studentId')
      setIsLoggedIn(!!studentId)

      // Listen for storage changes (when user logs in from another tab or after page reload)
      const handleStorageChange = () => {
        const updatedStudentId = localStorage.getItem('studentId')
        setIsLoggedIn(!!updatedStudentId)
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
    } catch (err) {
      setError('An error occurred while loading profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileClick = () => {
    setShowProfileModal(true)
    if (!userProfile) {
      fetchUserProfile()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('studentId')
    localStorage.removeItem('rememberMe')
    setIsLoggedIn(false)
    setUserProfile(null)
    setShowProfileModal(false)
    window.location.href = '/'
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
              <button className="relative p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
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
              /* User Profile Button - show if logged in */
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">Profile</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
            <DialogDescription>
              Your account information and details
            </DialogDescription>
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
          ) : userProfile ? (
            <div className="space-y-4">
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
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
