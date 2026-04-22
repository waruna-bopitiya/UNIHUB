"use client"

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { AppLayout } from '@/components/layout/app-layout'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const tutorFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .refine(
      (value) => {
        const lowerValue = value.toLowerCase()
        return lowerValue.endsWith('@my.sliit.lk') || lowerValue.endsWith('@sliit.lk')
      },
      {
        message: 'Only SLIIT student email addresses are allowed',
      }
    )
    .refine(
      (value) => {
        const lowerValue = value.toLowerCase()
        const pattern = /^it\d{8}@/
        return pattern.test(lowerValue)
      },
      {
        message: 'Email format must be itXXXXXXXX@my.sliit.lk (where X are digits)',
      }
    ),
  degreeProgram: z.string().min(2, 'Degree / Major is required'),
  cgpa: z
    .coerce.number({ invalid_type_error: 'CGPA must be a number' })
    .min(1.5, 'CGPA must be between 1.5 and 4.2')
    .max(4.2, 'CGPA must be between 1.5 and 4.2'),
  experienceYears: z
    .coerce.number({ invalid_type_error: 'Experience must be a number' })
    .min(0, 'Experience cannot be negative')
    .max(3.99, 'Experience must be less than 4 years'),
  bio: z.string().min(20, 'Tell students a bit more about you (at least 20 characters)'),
  expertiseAreas: z
    .string()
    .min(3, 'List at least one subject or area'),
})

type TutorFormValues = z.infer<typeof tutorFormSchema>

type BadgeState = {
  label: string
  description: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

function evaluateTutorApplication(values: TutorFormValues): {
  approved: boolean
  badge: BadgeState
} {
  const cgpa = values.cgpa
  const experience = values.experienceYears
  const bioLength = values.bio.trim().length

  // Auto-approval rules
  if (cgpa >= 1.5 && experience >= 0 && bioLength >= 20) {
    return {
      approved: true,
      badge: {
        label: 'Verified Tutor',
        description:
          'Automatically verified based on your CGPA, experience, and profile completeness.',
        variant: 'default',
      },
    }
  }

  if (cgpa >= 3.0 && bioLength >= 20) {
    return {
      approved: true,
      badge: {
        label: 'Community Tutor',
        description:
          'You meet the minimum CGPA and profile requirements to help peers on UniHub.',
        variant: 'secondary',
      },
    }
  }

  return {
    approved: false,
    badge: {
      label: 'Tutor Candidate',
      description:
        'Update your CGPA, experience or bio to reach the verification criteria.',
      variant: 'outline',
    },
  }
}

export default function TutorFormPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [badgeState, setBadgeState] = useState<BadgeState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [existingTutorId, setExistingTutorId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      degreeProgram: '',
      cgpa: 0,
      experienceYears: 0,
      bio: '',
      expertiseAreas: '',
    },
  })

  // Fetch user data from session on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First, try to get studentId from localStorage
        const studentIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null
        const firstNameFromStorage = typeof window !== 'undefined' ? localStorage.getItem('firstName') : null
        
        // If we have localStorage data, use it directly
        if (studentIdFromStorage && firstNameFromStorage) {
          // Fetch full user data from API using studentId
          const response = await fetch(`/api/user/me?userId=${studentIdFromStorage}`)
          
          if (response.ok) {
            const data = await response.json()
            setUserData({
              name: data.name,
              email: data.email,
            })
            form.setValue('fullName', data.name)
            form.setValue('email', data.email)
            setAuthError(null)
            
            // Also fetch existing tutor data if it exists
            const tutorResponse = await fetch(`/api/tutor/get?userId=${studentIdFromStorage}`)
            if (tutorResponse.ok) {
              const tutorData = await tutorResponse.json()
              // Populate form with existing tutor data
              form.setValue('degreeProgram', tutorData.degree_program)
              form.setValue('cgpa', tutorData.cgpa)
              form.setValue('experienceYears', tutorData.experience_years)
              form.setValue('bio', tutorData.bio)
              form.setValue('expertiseAreas', tutorData.expertise_areas)
              
              setIsVerified(true)
              setExistingTutorId(tutorData.id)
              
              // Set badge based on status
              const result = evaluateTutorApplication({
                fullName: data.name,
                email: data.email,
                degreeProgram: tutorData.degree_program,
                cgpa: tutorData.cgpa,
                experienceYears: tutorData.experience_years,
                bio: tutorData.bio,
                expertiseAreas: tutorData.expertise_areas,
              })
              setBadgeState(result.badge)
            }
            
            setIsLoading(false)
            return
          }
        }
        
        // Fallback: try the regular endpoint
        const response = await fetch('/api/user/me')
        
        if (response.status === 401) {
          setAuthError('Please log in first to become a tutor')
          setIsLoading(false)
          return
        }
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch user data')
        }
        
        const data = await response.json()
        
        // Set user data and auto-fill form
        setUserData({
          name: data.name,
          email: data.email,
        })
        
        form.setValue('fullName', data.name)
        form.setValue('email', data.email)
        setAuthError(null)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        const errorMsg = error instanceof Error ? error.message : 'Failed to load your profile'
        setAuthError(errorMsg)
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [form])

  const onSubmit = async (values: TutorFormValues) => {
    setIsSubmitting(true)

    try {
      // Get studentId from localStorage
      const studentId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null
      
      if (!studentId) {
        toast.error('Authentication required. Please log in again.')
        setIsSubmitting(false)
        return
      }

      // Call the tutor submission API
      const response = await fetch('/api/tutor/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: studentId,
          fullName: values.fullName,
          email: values.email,
          degreeProgram: values.degreeProgram,
          cgpa: values.cgpa,
          experienceYears: values.experienceYears,
          bio: values.bio,
          expertiseAreas: values.expertiseAreas,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit form')
      }

      const result = evaluateTutorApplication(values)
      setIsVerified(result.approved)
      setBadgeState(result.badge)
      setIsEditing(false)

      if (result.approved) {
        const messageText = isVerified ? 'Profile updated successfully!' : "✅ Verification successful! You're now a tutor!"
        toast.success(messageText, { duration: 3000 })
        
        if (!isVerified) {
          setTimeout(() => window.location.reload(), 2000)
        }
      } else {
        const { cgpa, bio } = values
        const bioLength = bio.trim().length
        const missing: string[] = []

        if (cgpa < 1.5) missing.push(`CGPA ${cgpa} (minimum 1.5 required)`)
        if (bioLength < 20) missing.push(`Bio characters ${bioLength} (minimum 20 required)`)

        if (missing.length) {
          toast.warning(
            `Required updates to verify: ${missing.join(', ')}.`,
            { duration: 8000 }
          )
        } else {
          toast.success(
            '✅ Profile updated!',
            { duration: 5000 }
          )
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit form'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your tutor profile? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const studentId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null
      
      if (!studentId) {
        toast.error('Authentication required.')
        return
      }

      const response = await fetch('/api/tutor/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: studentId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete profile')
      }

      const data = await response.json()
      console.log('✅ Profile deleted:', data.message)
      
      toast.success('Your tutor profile has been deleted', { duration: 3000 })
      
      // Refresh the page after 1.5 seconds to show clean state
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Error deleting profile:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete profile'
      toast.error(errorMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  const currentBadge =
    badgeState ?? ({
      label: 'Tutor Candidate',
      description: 'Fill in your details to see your tutor badge.',
      variant: 'outline',
    } as BadgeState)

  return (
    <AppLayout>
      <div className="w-full p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Become a Tutor on UniHub
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Anyone who signs in with their university email can share knowledge.
            Complete this tutor form so our system can automatically review your
            profile and assign you a badge.
          </p>
        </header>

        <section className="border border-border rounded-lg bg-card p-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center gap-2">
              Tutor status:
              <span
                className={
                  isVerified
                    ? 'text-emerald-500 font-semibold'
                    : 'text-amber-500 font-semibold'
                }
              >
                {isVerified ? 'Verified Tutor' : 'Not yet verified'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Your status is decided automatically by UniHub based on the
              information you provide. No admin review is required.
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={currentBadge.variant} className="cursor-default">
                {isVerified ? <CheckCircle2 className="size-3" /> : null}
                {currentBadge.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>{currentBadge.description}</TooltipContent>
          </Tooltip>
        </section>

        {authError && (
          <section className="border border-amber-500/50 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-amber-900 dark:text-amber-100">{authError}</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  You can still fill out the form below to prepare your tutor profile.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                  className="mt-2"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </section>
        )}

        <section className="border border-border rounded-lg bg-card p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {isLoading && (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading your profile...
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g. Kavindu Perera"
                          {...field}
                          disabled={authError ? false : true}
                          className={authError ? '' : 'bg-muted/50 cursor-not-allowed'}
                          title={authError ? 'Enter your full name' : 'Your name is auto-filled from your university profile'}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription className="text-xs">
                        {authError 
                          ? 'Please enter your full name manually' 
                          : 'Auto-filled from your university account (read-only)'}
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="itXXXXXXX@my.sliit.lk"
                          type="email"
                          {...field}
                          disabled={authError ? false : true}
                          className={authError ? '' : 'bg-muted/50 cursor-not-allowed'}
                          title={authError ? 'Enter your university email' : 'Your email is auto-filled from your university profile'}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription className="text-xs">
                        {authError 
                          ? 'Please enter your SLIIT email (itXXXXXXXX@my.sliit.lk)' 
                          : 'Auto-filled from your university account (read-only)'}
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="degreeProgram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree / Major</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g. BSc in Computer Science"
                          {...field}
                          disabled={isLoading || (isVerified && !isEditing)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cgpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current CGPA</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="1.5"
                          max="4.2"
                          placeholder="E.g. 3.45"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          disabled={isLoading || (isVerified && !isEditing)}
                        />
                      </FormControl>
                      <FormDescription>
                        CGPA must be between 1.5 and 4.0. Higher CGPA improves your chance of being auto-verified.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tutoring experience (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max="3.99"
                          placeholder="E.g. 0"
                          value={field.value !== undefined && field.value !== null ? field.value : ''}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === '' || val === null) {
                              field.onChange('')
                            } else {
                              field.onChange(parseFloat(val))
                            }
                          }}
                          disabled={isLoading || (isVerified && !isEditing)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum 4 years. Include informal peer tutoring and mentoring.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short bio</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Tell students who you are, how you like to teach, and what kind of help they can expect from you."
                        {...field}
                        disabled={isLoading || (isVerified && !isEditing)}
                      />
                    </FormControl>
                    <FormDescription>
                      At least 20 characters helps our system understand your profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expertiseAreas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects / expertise areas</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g. Data Structures, Calculus, Physics 1"
                        {...field}
                        disabled={isLoading || (isVerified && !isEditing)}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate multiple areas with commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between gap-4">
                {!isVerified && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="size-4 text-amber-500 mt-0.5" />
                    <p>
                      Once our system verifies your details, your status will
                      change to <span className="font-semibold">Verified Tutor</span>{' '}
                      and your badge will be visible across UniHub.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 ml-auto">
                  {/* Delete Button - Always visible when verified */}
                  {isVerified && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleDeleteProfile}
                      disabled={isSubmitting || isDeleting || isEditing}
                      className="min-w-[140px] text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          Delete Profile
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Edit Button */}
                  {isVerified && !isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      disabled={isSubmitting || isDeleting}
                    >
                      Edit Profile
                    </Button>
                  )}
                  
                  {/* Cancel Edit Button */}
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                    >
                      Cancel Edit
                    </Button>
                  )}
                  
                  {/* Submit/Update Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    variant={isVerified && !isEditing ? 'outline' : 'default'}
                    className="min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        {isVerified ? 'Updating...' : 'Checking...'}
                      </>
                    ) : isVerified && isEditing ? (
                      'Update Profile'
                    ) : isVerified ? (
                      <>
                        <CheckCircle2 className="size-4 mr-2" />
                        Verified Tutor
                      </>
                    ) : (
                      'Submit for verification'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </section>
      </div>
    </AppLayout>
  )
}