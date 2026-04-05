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
import { AlertCircle, CheckCircle, Eye, EyeOff, Home, GraduationCap } from 'lucide-react'

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

function getCountryCodeById(countryId: string): string {
  const country = COUNTRIES.find(c => c.id === countryId)
  return country ? country.code : '+94'
}

function getCountryIdByCode(code: string): string {
  const country = COUNTRIES.find(c => c.code === code && c.id !== 'ca')
  return country ? country.id : 'lk'
}

function calculatePasswordStrength(password: string) {
  if (!password) return { score: 0, level: 'None', color: 'bg-gray-200' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return { score, level: 'Weak', color: 'bg-red-500' }
  if (score <= 4) return { score, level: 'Fair', color: 'bg-amber-400' }
  if (score <= 5) return { score, level: 'Good', color: 'bg-sky-500' }
  return { score, level: 'Strong', color: 'bg-emerald-500' }
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

  useEffect(() => {
    if (otpTimer <= 0) return
    const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpTimer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) { setError('First name is required'); return false }
    if (!formData.email.trim()) { setError('Email is required'); return false }
    if (!formData.email.toLowerCase().endsWith('@my.sliit.lk')) { setError('Email must end with @my.sliit.lk'); return false }
    if (!formData.phoneNumber.trim()) { setError('Phone number is required'); return false }
    if (!formData.password) { setError('Password is required'); return false }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return false }
    if (!formData.yearOfUniversity) { setError('Year of university is required'); return false }
    if (!formData.semester) { setError('Semester is required'); return false }
    return true
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const countryCode = getCountryCodeById(formData.countryId)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, countryCode, action: 'send-otp' }),
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to send OTP'); return }
      setSuccess(data.message || 'OTP sent successfully')
      setStep('otp')
      setOtpTimer(120)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) { setError('OTP is required'); return }
    if (otp.length !== 6) { setError('OTP must be 6 digits'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const countryCode = getCountryCodeById(formData.countryId)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, countryCode, otp, action: 'verify-otp-and-create' }),
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to create account'); return }
      setSuccess(`Account created successfully! Your ID: ${data.studentId}`)
      localStorage.setItem('signupEmail', formData.email)
      router.push('/auth/login')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToForm = () => {
    setStep('form'); setOtp(''); setError(''); setSuccess('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // ─── Shared style tokens ───────────────────────────────────────────────────
  const inputCls =
    'h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800'

  const labelCls = 'block text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300 mb-1'

  const radioOptionCls =
    'flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/60 transition-all dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20'

  const primaryBtn =
    'w-full h-9 rounded-lg bg-indigo-600 text-white text-sm font-semibold tracking-wide shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed'

  const outlineBtn =
    'w-full h-9 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800'

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex flex-col">

      {/* ── Top Nav ── */}
      <header className="w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/80 flex-shrink-0">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="flex items-center gap-2 text-indigo-600">
            <GraduationCap className="h-5 w-5" />
            <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">UniHub</span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-start justify-center px-3 py-6 sm:py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Left Panel ── */}
          <aside className="hidden lg:flex lg:col-span-2 flex-col gap-6 pt-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">Student Portal</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                Start your<br />journey today.
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Join thousands of students learning, sharing, and growing together on UniHub.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Learn from Community', desc: 'Get answers from peers and seniors instantly.' },
                { title: 'Share Knowledge', desc: 'Help others and build your reputation.' },
                { title: 'Live Sessions', desc: 'Attend Q&As, tutoring, and workshops.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 items-start p-3 rounded-xl bg-white/70 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 shadow-sm">
                  <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Form Card ── */}
          <div className="lg:col-span-3 w-full rounded-2xl border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/90 dark:shadow-none overflow-hidden">

            {/* Card Header Strip */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {step === 'form' ? 'Create your account' : 'Verify your email'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {step === 'form' ? 'Fill in your details to get started.' : `We sent a 6-digit code to ${formData.email}`}
              </p>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[72vh] scroll-smooth">

              {/* Alerts */}
              {error && (
                <Alert variant="destructive" className="mb-4 rounded-lg border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 py-2.5 px-3">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-xs text-red-700 dark:text-red-300 ml-2">{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 rounded-lg border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 py-2.5 px-3">
                  <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <AlertDescription className="text-xs text-emerald-700 dark:text-emerald-300 ml-2">{success}</AlertDescription>
                </Alert>
              )}

              {/* ── STEP 1: Form ── */}
              {step === 'form' && (
                <form onSubmit={handleSendOTP} className="space-y-4">

                  {/* Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
                      <input id="firstName" name="firstName" type="text" placeholder="John" value={formData.firstName} onChange={handleChange} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name</label>
                      <input id="secondName" name="secondName" type="text" placeholder="Doe" value={formData.secondName} onChange={handleChange} className={inputCls} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                    <input id="email" name="email" type="email" placeholder="user@my.sliit.lk" value={formData.email} onChange={handleChange} className={inputCls} required />
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Must end with @my.sliit.lk</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={labelCls}>Phone <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <Select value={formData.countryId} onValueChange={(value) => setFormData(prev => ({ ...prev, countryId: value }))}>
                        <SelectTrigger className="w-[5.5rem] flex-shrink-0 h-9 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:border-slate-700 dark:bg-slate-800/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-52 text-xs">
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.id} value={country.id} className="text-xs">
                              <span className="flex items-center gap-1.5">
                                <span>{country.flag}</span>
                                <span className="text-slate-600 dark:text-slate-400">{country.code}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input id="phoneNumber" name="phoneNumber" type="tel" placeholder="712345678" value={formData.phoneNumber} onChange={handleChange} className={`${inputCls} flex-1`} required />
                    </div>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{getCountryCodeById(formData.countryId)} {formData.phoneNumber || '—'}</p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className={labelCls}>Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        id="password" name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        value={formData.password} onChange={handleChange}
                        className={`${inputCls} pr-9`}
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
                    {formData.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Strength</span>
                          <span className={`text-xs font-semibold ${
                            passwordStrength.level === 'Weak' ? 'text-red-500' :
                            passwordStrength.level === 'Fair' ? 'text-amber-500' :
                            passwordStrength.level === 'Good' ? 'text-sky-500' : 'text-emerald-500'
                          }`}>{passwordStrength.level}</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className={labelCls}>Address</label>
                    <input id="address" name="address" type="text" placeholder="Street address" value={formData.address} onChange={handleChange} className={inputCls} />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className={labelCls}>Gender</label>
                    <RadioGroup value={formData.gender} onValueChange={(v) => handleRadioChange('gender', v)}>
                      <div className="grid grid-cols-3 gap-2">
                        {[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }].map((opt) => (
                          <label key={opt.value} htmlFor={opt.value} className={radioOptionCls}>
                            <RadioGroupItem value={opt.value} id={opt.value} className="h-3.5 w-3.5 flex-shrink-0 text-indigo-600" />
                            <span className="text-xs text-slate-700 dark:text-slate-300">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Year */}
                  <div>
                    <label className={labelCls}>Year <span className="text-red-500">*</span></label>
                    <RadioGroup value={formData.yearOfUniversity} onValueChange={(v) => handleRadioChange('yearOfUniversity', v)}>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((year) => (
                          <label key={year} htmlFor={`year-${year}`} className={`${radioOptionCls} justify-center`}>
                            <RadioGroupItem value={year.toString()} id={`year-${year}`} className="h-3.5 w-3.5 flex-shrink-0 text-indigo-600" />
                            <span className="text-xs text-slate-700 dark:text-slate-300">{year}</span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className={labelCls}>Semester <span className="text-red-500">*</span></label>
                    <RadioGroup value={formData.semester} onValueChange={(v) => handleRadioChange('semester', v)}>
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((sem) => (
                          <label key={sem} htmlFor={`semester-${sem}`} className={radioOptionCls}>
                            <RadioGroupItem value={sem.toString()} id={`semester-${sem}`} className="h-3.5 w-3.5 flex-shrink-0 text-indigo-600" />
                            <span className="text-xs text-slate-700 dark:text-slate-300">Semester {sem}</span>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Divider */}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800" />

                  <button type="submit" disabled={loading} className={primaryBtn}>
                    {loading ? 'Sending OTP…' : 'Continue →'}
                  </button>

                  <p className="text-center text-xs text-slate-500 dark:text-slate-400 pb-1">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">
                      Sign in
                    </Link>
                  </p>
                </form>
              )}

              {/* ── STEP 2: OTP ── */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/60 dark:bg-indigo-950/30 px-4 py-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      OTP sent to <strong className="font-semibold text-slate-900 dark:text-white">{formData.email}</strong>
                    </p>
                  </div>

                  <div>
                    <label className={labelCls}>6-Digit OTP</label>
                    <input
                      id="otp" name="otp" type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setOtp(val); setError('')
                      }}
                      maxLength={6}
                      inputMode="numeric"
                      className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-3xl font-mono tracking-[0.5em] text-slate-800 placeholder:text-slate-300 placeholder:tracking-[0.5em] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                      required
                    />
                  </div>

                  {otpTimer > 0 && (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-800/50 dark:bg-amber-950/20 px-4 py-2.5">
                      <span className="text-xs text-amber-700 dark:text-amber-400">
                        Code expires in <strong className="font-semibold tabular-nums">{formatTime(otpTimer)}</strong>
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className={primaryBtn}
                  >
                    {loading ? 'Verifying…' : 'Verify & Create Account'}
                  </button>

                  <button type="button" onClick={handleBackToForm} className={outlineBtn}>
                    ← Back to form
                  </button>

                  <p className="text-center text-xs text-slate-500 dark:text-slate-400 pb-1">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">
                      Sign in
                    </Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
