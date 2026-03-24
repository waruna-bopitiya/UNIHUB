'use client'

import { useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

    if (!formData.email.endsWith('@my.sliit.lk')) {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        return
      }

      setSuccess(`Account created successfully! Your ID: ${data.studentId}`)
      
      // Store email for login page pre-fill
      localStorage.setItem('signupEmail', formData.email)
      
      // Reset form
      setFormData({
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

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
            <p className="text-muted-foreground">Join UniHub and start learning with your community</p>
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
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-semibold">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border-border focus:ring-ring"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondName" className="font-semibold">
                  Second Name
                </Label>
                <Input
                  id="secondName"
                  name="secondName"
                  type="text"
                  placeholder="Doe"
                  value={formData.secondName}
                  onChange={handleChange}
                  className="border-border focus:ring-ring"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.name@my.sliit.lk"
                value={formData.email}
                onChange={handleChange}
                className="border-border focus:ring-ring"
                required
              />
              <p className="text-xs text-muted-foreground">Must be in format: user@my.sliit.lk</p>
            </div>

            {/* Phone Number with Country Code */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="font-semibold">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <Select value={formData.countryId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, countryId: value }))
                }>
                  <SelectTrigger className="w-32 border-border focus:ring-ring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        <span className="flex items-center gap-2">
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
                  placeholder="71 234 5678"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="flex-1 border-border focus:ring-ring"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your full number will be: {getCountryCodeById(formData.countryId)} {formData.phoneNumber}
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter a strong password (min 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-border focus:ring-ring pr-10"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Password Strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.level === 'Weak' ? 'text-destructive' :
                      passwordStrength.level === 'Fair' ? 'text-yellow-600 dark:text-yellow-500' :
                      passwordStrength.level === 'Good' ? 'text-blue-600 dark:text-blue-500' :
                      'text-green-600 dark:text-green-500'
                    }`}>
                      {passwordStrength.level}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use uppercase, lowercase, numbers, and symbols for a stronger password
                  </p>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="font-semibold">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Your address"
                value={formData.address}
                onChange={handleChange}
                className="border-border focus:ring-ring"
              />
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <Label className="font-semibold">Gender</Label>
              <RadioGroup value={formData.gender} onValueChange={(value) => handleRadioChange('gender', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="font-normal cursor-pointer">
                    Male
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="font-normal cursor-pointer">
                    Female
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal cursor-pointer">
                    Other
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Year of University */}
            <div className="space-y-3">
              <Label className="font-semibold">
                Year of University <span className="text-destructive">*</span>
              </Label>
              <RadioGroup value={formData.yearOfUniversity} onValueChange={(value) => handleRadioChange('yearOfUniversity', value)}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <RadioGroupItem value={year.toString()} id={`year-${year}`} />
                      <Label htmlFor={`year-${year}`} className="font-normal cursor-pointer">
                        Year {year}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Semester */}
            <div className="space-y-3">
              <Label className="font-semibold">
                Semester <span className="text-destructive">*</span>
              </Label>
              <RadioGroup value={formData.semester} onValueChange={(value) => handleRadioChange('semester', value)}>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  {[1, 2].map((semester) => (
                    <div key={semester} className="flex items-center space-x-2">
                      <RadioGroupItem value={semester.toString()} id={`semester-${semester}`} />
                      <Label htmlFor={`semester-${semester}`} className="font-normal cursor-pointer">
                        Semester {semester}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-auto"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Required Fields Note */}
            <p className="text-xs text-muted-foreground text-center">
              <span className="text-destructive">*</span> indicates required fields
            </p>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
