'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, CheckCircle, Eye, EyeOff, Home } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastLoginData, setLastLoginData] = useState<{firstName: string; lastLogin: string | null} | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Pre-fill email from signup page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const signupEmail = localStorage.getItem('signupEmail')
      if (signupEmail) {
        setFormData(prev => ({
          ...prev,
          email: signupEmail
        }))
        // Clear the stored email after using it
        localStorage.removeItem('signupEmail')
      }
    }
  }, [])

  const formatLastLogin = (dateString: string | null): string => {
    if (!dateString) {
      return 'First time logging in!'
    }
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      // Format: "March 24, 2026 at 10:30 AM"
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }
      
      const formattedDate = date.toLocaleString('en-US', options)
      
      // Add relative time
      if (diffInSeconds < 60) {
        return `${formattedDate} (just now)`
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `${formattedDate} (${minutes} minute${minutes > 1 ? 's' : ''} ago)`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `${formattedDate} (${hours} hour${hours > 1 ? 's' : ''} ago)`
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `${formattedDate} (${days} day${days > 1 ? 's' : ''} ago)`
      }
    } catch (e) {
      return 'Last login date unavailable'
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }

    if (!formData.email.toLowerCase().endsWith('@my.sliit.lk')) {
      setError('Email must end with @my.sliit.lk')
      return false
    }

    if (!formData.password) {
      setError('Password is required')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      setSuccess(`Welcome back, ${data.firstName}!`)
      setLastLoginData({
        firstName: data.firstName,
        lastLogin: data.lastLogin
      })
      
      // Store student ID and first name (always, to keep user logged in)
      localStorage.setItem('studentId', data.studentId)
      localStorage.setItem('firstName', data.firstName)
      
      // Also store in remember me if checked
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }

      // Redirect after 3 seconds (full page reload to update top-bar)
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your UniHub account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <div className="space-y-3 mb-6">
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
              </Alert>
              {lastLoginData && (
                <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-600 dark:text-blue-400">
                    Last login: {formatLastLogin(lastLoginData.lastLogin)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.name@my.sliit.lk"
                value={formData.email}
                onChange={handleChange}
                className="border-border focus:ring-ring"
                autoComplete="email"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-border focus:ring-ring pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="rememberMe" className="font-normal cursor-pointer">
                Remember me
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-auto"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Signup Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/auth/signup" className="text-primary hover:underline font-semibold">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
