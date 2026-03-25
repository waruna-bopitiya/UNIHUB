'use client'

import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

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
		.email('Please enter a valid university email address')
		.refine(
			(value) =>
				value.toLowerCase().endsWith('@my.sliit.lk') ||
				value.toLowerCase().endsWith('@sliit.lk'),
			{
				message: 'Only SLIIT student email addresses are allowed (e.g. itXXXXXXX@my.sliit.lk)',
			},
		),
	degreeProgram: z.string().min(2, 'Degree / Major is required'),
	cgpa: z
		.coerce.number({ invalid_type_error: 'CGPA must be a number' })
		.min(0, 'CGPA cannot be negative')
		.max(4.2, 'CGPA seems too high'),
	experienceYears: z
		.coerce.number({ invalid_type_error: 'Experience must be a number' })
		.min(0, 'Experience cannot be negative'),
	bio: z.string().min(30, 'Tell students a bit more about you'),
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

	// Simple auto-approval rules
	if (cgpa >= 3.5 && experience >= 1 && bioLength >= 80) {
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

	if (cgpa >= 3.0 && bioLength >= 50) {
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

	const onSubmit = (values: TutorFormValues) => {
		setIsSubmitting(true)

		const result = evaluateTutorApplication(values)
		setIsVerified(result.approved)
		setBadgeState(result.badge)

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
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6"
						>
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
													min={0}
													max={4.2}
													placeholder="E.g. 3.45"
													{...field}
													disabled={isVerified}
												/>
											</FormControl>
											<FormDescription>
												Higher CGPA improves your chance of being auto-verified.
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
													min={0}
													placeholder="E.g. 1.5"
													{...field}
													disabled={isVerified}
												/>
											</FormControl>
											<FormDescription>
												Include informal peer tutoring and mentoring.
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
											At least a few sentences helps our system understand your
											profile.
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

