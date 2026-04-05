'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle, Eye, EyeOff, Home } from 'lucide-react'

// Country codes list with flags
const COUNTRIES = [
  { id: 'lk', code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { id: 'us', code: '+1', name: 'United States', flag: '🇺🇸' },
  { id: 'gb', code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'in', code: '+91', name: 'India', flag: '🇮🇳' },
  { id: 'cn', code: '+86', name: 'China', flag: '🇨🇳' },
  { id: 'jp', code: '+81', name: 'Japan', flag: '🇯🇵' },
  { id: 'fr', code: '+33', name: 'France', flag: '🇫🇷' },
  { id: 'de', code: '+49', name: 'Germany', flag: '🇩🇪' },
  { id: 'it', code: '+39', name: 'Italy', flag: '🇮🇹' },
  { id: 'es', code: '+34', name: 'Spain', flag: '🇪🇸' },
  { id: 'au', code: '+61', name: 'Australia', flag: '🇦🇺' },
  { id: 'nz', code: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { id: 'za', code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { id: 'br', code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { id: 'ca', code: '+1', name: 'Canada', flag: '🇨🇦' },
  { id: 'hk', code: '+852', name: 'Hong Kong', flag: '🇭🇰' },
  { id: 'sg', code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { id: 'my', code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { id: 'id', code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { id: 'th', code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { id: 'vn', code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { id: 'ph', code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { id: 'bd', code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { id: 'ae', code: '+971', name: 'UAE', flag: '🇦🇪' },
  { id: 'sa', code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
]

// Helper function to get country code from ID
function getCountryCodeById(countryId: string): string {
  const country = COUNTRIES.find(c => c.id === countryId)
  return country ? country.code : '+94' // Default to Sri Lanka
}

// Helper function to get country ID from code (for initialization)
function getCountryIdByCode(code: string): string {
  const country = COUNTRIES.find(c => c.code === code && c.id !== 'ca') // Skip Canada for +1
  return country ? country.id : 'lk' // Default to Sri Lanka
}

// Password strength calculator
function calculatePasswordStrength(password: string) {
  if (!password) return { score: 0, level: 'None', color: 'bg-gray-300' }
  
  let score = 0
  
  // Length checks
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  
  // Character type checks
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score <= 2) return { score, level: 'Weak', color: 'bg-destructive' }
  if (score <= 4) return { score, level: 'Fair', color: 'bg-yellow-500' }
  if (score <= 5) return { score, level: 'Good', color: 'bg-blue-500' }
  return { score, level: 'Strong', color: 'bg-green-500' }
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)

  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    email: '',
    countryId: 'lk',
    phoneNumber: '',
    address: '',
    gender: '',
    yearOfUniversity: '',
    semester: '',
    password: '',
  })

  const passwordStrength = calculatePasswordStrength(formData.password)

  // OTP Timer
  useEffect(() => {
    if (otpTimer <= 0) return

    const timer = setTimeout(() => {
      setOtpTimer(otpTimer - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [otpTimer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }

    if (!formData.email.toLowerCase().endsWith('@my.sliit.lk')) {
      setError('Email must end with @my.sliit.lk')
      return false
    }

    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required')
      return false
    }

    if (!formData.password) {
      setError('Password is required')
      return false
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }

    if (!formData.yearOfUniversity) {
      setError('Year of university is required')
      return false
    }

    if (!formData.semester) {
      setError('Semester is required')
      return false
    }

    return true
  }

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const countryCode = getCountryCodeById(formData.countryId)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          countryCode: countryCode,
          action: 'send-otp',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }

      setSuccess(data.message || 'OTP sent successfully')
      setStep('otp')
      setOtpTimer(120) // 2 minutes
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP and Create Account
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      setError('OTP is required')
      return
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const countryCode = getCountryCodeById(formData.countryId)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          countryCode: countryCode,
          otp,
          action: 'verify-otp-and-create',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      setSuccess(`Account created successfully! Your ID: ${data.studentId}`)
      
      // Store email for login page pre-fill
      localStorage.setItem('signupEmail', formData.email)
      
      // Redirect to login page immediately
      router.push('/auth/login')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToForm = () => {
    setStep('form')
    setOtp('')
    setError('')
    setSuccess('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-secondary to-background">
      {/* Top Navigation */}
      <div className="w-full border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full py-2 px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm">
            <Home className="h-4 w-4" />
            <span className="font-semibold">Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-2 px-4 md:px-6 lg:px-8 flex-shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Column - Benefits */}
          <div className="flex flex-col justify-center items-start space-y-3">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">Welcome to UniHub</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Join thousands of students sharing knowledge, asking questions, and learning together in one unified platform.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">Learn from Community</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Access resources and get answers from peers</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">Share Your Knowledge</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Upload resources and help others succeed</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base">Live Learning Sessions</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Participate in Q&As and live tutoring</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form (2/3 width) */}
          <Card className="shadow-lg border border-border h-fit lg:col-span-2">
            <div className="p-4 md:p-5">
          {/* Header */}
          <div className="mb-3 text-center">
            <h1 className="text-xl font-bold text-foreground mb-0.5">Create Your Account</h1>
            <p className="text-sm text-muted-foreground">
              {step === 'form' && 'Join UniHub and start learning'}
              {step === 'otp' && 'Verify your email'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="mb-3 border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
            </Alert>
          )}

          {/* STEP 1: Signup Form */}
          {step === 'form' && (
            <form onSubmit={handleSendOTP} className="space-y-2">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="font-semibold text-xs">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="border-border focus:ring-ring h-8 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="secondName" className="font-semibold text-xs">
                    Last Name
                  </Label>
                  <Input
                    id="secondName"
                    name="secondName"
                    type="text"
                    placeholder="Doe"
                    value={formData.secondName}
                    onChange={handleChange}
                    className="border-border focus:ring-ring h-8 text-xs"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="font-semibold text-xs">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.name@my.sliit.lk"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-border focus:ring-ring h-8 text-xs"
                  required
                />
                <p className="text-xs text-muted-foreground">Must be user@my.sliit.lk</p>
              </div>

              {/* Phone Number with Country Code */}
              <div className="space-y-1">
                <Label className="font-semibold text-xs">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-1">
                  {/* Country Code Dropdown */}
                  <Select value={formData.countryId} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, countryId: value }))
                  }>
                    <SelectTrigger className="w-24 sm:w-28 border-border focus:ring-ring h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          <span className="flex items-center gap-1">
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm">{country.code}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Phone Number Input */}
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="712345678"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="flex-1 border-border focus:ring-ring h-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">{getCountryCodeById(formData.countryId)} {formData.phoneNumber || '—'}</p>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="font-semibold text-xs">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="border-border focus:ring-ring pr-10 h-8 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Strength:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.level === 'Weak' ? 'text-destructive' :
                        passwordStrength.level === 'Fair' ? 'text-yellow-600 dark:text-yellow-500' :
                        passwordStrength.level === 'Good' ? 'text-blue-600 dark:text-blue-500' :
                        'text-green-600 dark:text-green-500'
                      }`}>
                        {passwordStrength.level}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label htmlFor="address" className="font-semibold text-xs">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={handleChange}
                  className="border-border focus:ring-ring h-8 text-xs"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <Label className="font-semibold text-xs block">Gender</Label>
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2">
                  <RadioGroup value={formData.gender} onValueChange={(value) => handleRadioChange('gender', value)}>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-1 p-1 rounded-md border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                        <RadioGroupItem value={option.value} id={option.value} className="h-3 w-3" />
                          <Label htmlFor={option.value} className="font-normal cursor-pointer text-xs flex-1">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Year of University */}
              <div className="space-y-1">
                <Label className="font-semibold text-xs block">
                  Year <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2">
                  <RadioGroup value={formData.yearOfUniversity} onValueChange={(value) => handleRadioChange('yearOfUniversity', value)}>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map((year) => (
                        <div key={year} className="flex items-center justify-center space-x-1 p-1 rounded-md border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                          <RadioGroupItem value={year.toString()} id={`year-${year}`} className="h-3 w-3" />
                          <Label htmlFor={`year-${year}`} className="font-normal cursor-pointer text-xs">
                            {year}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Semester */}
              <div className="space-y-1">
                <Label className="font-semibold text-xs block">
                  Semester <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2">
                  <RadioGroup value={formData.semester} onValueChange={(value) => handleRadioChange('semester', value)}>
                    <div className="grid grid-cols-2 gap-1">
                      {[1, 2].map((semester) => (
                        <div key={semester} className="flex items-center space-x-1 p-1 rounded-md border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                          <RadioGroupItem value={semester.toString()} id={`semester-${semester}`} className="h-3 w-3" />
                          <Label htmlFor={`semester-${semester}`} className="font-normal cursor-pointer text-xs flex-1">
                            Semester {semester}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-1 h-8 text-xs mt-1"
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </Button>

              {/* Login Link */}
              <div className="pt-1 text-center text-xs border-t border-border">
                <span className="text-muted-foreground">Already have account? </span>
                <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  OTP sent to <strong className="font-semibold break-all">{formData.email}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="otp" className="font-semibold text-xs">
                  Enter 6-Digit OTP
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(val)
                    setError('')
                  }}
                  maxLength={6}
                  inputMode="numeric"
                  className="border-border focus:ring-ring text-center text-3xl tracking-widest font-mono h-12"
                  required
                />
              </div>

              {otpTimer > 0 && (
                <div className="text-xs text-center p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <span className="text-amber-900 dark:text-amber-100">
                    Expires in: <strong className="font-semibold">{formatTime(otpTimer)}</strong>
                  </span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-1 h-9 text-sm"
              >
                {loading ? 'Verifying...' : 'Verify & Create'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleBackToForm}
                className="w-full h-9 text-sm"
              >
                Back
              </Button>

              <div className="pt-1 text-center text-xs border-t border-border">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </div>
            </form>
          )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
