"use client"

import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
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

  const onSubmit = async (values: TutorFormValues) => {
    setIsSubmitting(true)

    // Simulate async processing (like API call)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const result = evaluateTutorApplication(values)
    setIsVerified(result.approved)
    setBadgeState(result.badge)

    if (result.approved) {
      toast.success("✅ Verification successful! You're now a tutor!", {
        duration: 3000,
      })
      setTimeout(() => router.push('/'), 2000)
    } else {
      // Build detailed missing requirements message in Sinhala
      const { cgpa, experienceYears, bio } = values
      const bioLength = bio.trim().length
      const missing: string[] = []

      if (cgpa < 1.5) missing.push(`CGPA ${cgpa} (අවම 1.5 අවශ්‍යයි)`)
      if (bioLength < 20) missing.push(`Bio characters ${bioLength} (අවම 20 අවශ්‍යයි)`)

      if (missing.length) {
        toast.warning(
          `Verify වීමට අවශ්‍ය දේ: ${missing.join(', ')}.`,
          { duration: 8000 }
        )
      } else {
        toast.success(
          '✅ Congratulations! You are now verified as a Tutor!',
          { duration: 5000 }
        )
      }
    }

    setIsSubmitting(false)
  }

  const currentBadge =
    badgeState ?? ({
      label: 'Tutor Candidate',
      description: 'Fill in your details to see your tutor badge.',
      variant: 'outline',
    } as BadgeState)

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
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

        <section className="border border-border rounded-lg bg-card p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          disabled={isVerified}
                        />
                      </FormControl>
                      <FormMessage />
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
                          disabled={isVerified}
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
                  name="degreeProgram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree / Major</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g. BSc in Computer Science"
                          {...field}
                          disabled={isVerified}
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
                          disabled={isVerified}
                        />
                      </FormControl>
                      <FormDescription>
                        CGPA must be between 1.5 and 4.2. Higher CGPA improves your chance of being auto-verified.
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
                          disabled={isVerified}
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
                        disabled={isVerified}
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
                        disabled={isVerified}
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

                <Button
                  type="submit"
                  disabled={isSubmitting || isVerified}
                  variant={isVerified ? 'outline' : 'default'}
                >
                  {isVerified ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      Verified Tutor
                    </>
                  ) : isSubmitting ? (
                    'Checking with system...'
                  ) : (
                    'Submit for verification'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </section>
      </div>
    </AppLayout>
  )
}