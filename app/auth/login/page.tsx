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
import { AlertCircle, CheckCircle, Eye, EyeOff, Home, GraduationCap } from 'lucide-react'

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

  // ─── Shared style tokens (matching signup page) ────────────────────────────
  const inputCls =
    'h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800'

  const labelCls = 'block text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300 mb-1'

  const primaryBtn =
    'w-full h-9 rounded-lg bg-indigo-600 text-white text-sm font-semibold tracking-wide shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex flex-col">

      {/* ── Top Nav ── */}
      <header className="w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/80 flex-shrink-0">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">UniHub</span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-3 py-10">
        <div className="w-full max-w-md">

          {/* ── Form Card ── */}
          <div className="w-full rounded-2xl border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/90 dark:shadow-none overflow-hidden">

            {/* Card Header Strip */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sign in to your UniHub account</p>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="rounded-lg border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 py-2.5 px-3">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-xs text-red-700 dark:text-red-300 ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alerts */}
              {success && (
                <div className="space-y-2">
                  <Alert className="rounded-lg border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 py-2.5 px-3">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <AlertDescription className="text-xs text-emerald-700 dark:text-emerald-300 ml-2">{success}</AlertDescription>
                  </Alert>
                  {lastLoginData && (
                    <Alert className="rounded-lg border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/40 py-2.5 px-3">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <AlertDescription className="text-xs text-indigo-700 dark:text-indigo-300 ml-2">
                        Last login: {formatLastLogin(lastLoginData.lastLogin)}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelCls}>Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.name@my.sliit.lk"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputCls}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                      Password
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputCls} pr-9`}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="h-3.5 w-3.5 rounded border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 dark:border-slate-800" />

                {/* Submit */}
                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>

                {/* Signup Link */}
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 pb-1">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">
                    Sign up
                  </Link>
                </p>

              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
