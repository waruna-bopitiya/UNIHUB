import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		// Get user ID from request body or cookies
		let userId = body.userId
		if (!userId) {
			userId = request.cookies.get('studentId')?.value
		}
		
		if (!userId) {
			console.error('❌ No userId provided in request or cookies')
			return NextResponse.json(
				{ message: 'User not authenticated. Please log in and try again.' },
				{ status: 401 }
			)
		}

		// Validate required fields
		const { fullName, email, degreeProgram, cgpa, experienceYears, bio, expertiseAreas } = body

		if (!fullName || !email || !degreeProgram || cgpa === undefined || experienceYears === undefined || !bio || !expertiseAreas) {
			return NextResponse.json(
				{ message: 'Missing required fields' },
				{ status: 400 }
			)
		}

		// Validate email format
		if (!email.includes('@')) {
			return NextResponse.json(
				{ message: 'Invalid email address' },
				{ status: 400 }
			)
		}

		// Validate SLIIT email domain
		if (!email.toLowerCase().endsWith('@my.sliit.lk') && !email.toLowerCase().endsWith('@sliit.lk')) {
			return NextResponse.json(
				{ message: 'Only SLIIT student email addresses are allowed' },
				{ status: 400 }
			)
		}

		// Validate CGPA
		const cgpaNum = parseFloat(cgpa)
		if (isNaN(cgpaNum) || cgpaNum < 1.5 || cgpaNum > 4.2) {
			return NextResponse.json(
				{ message: 'Invalid CGPA value' },
				{ status: 400 }
			)
		}

		// Validate experience
		const expNum = parseFloat(experienceYears)
		if (isNaN(expNum) || expNum < 0) {
			return NextResponse.json(
				{ message: 'Invalid experience value' },
				{ status: 400 }
			)
		}

		// Validate bio length
		if (bio.trim().length < 20) {
			return NextResponse.json(
				{ message: 'Bio must be at least 20 characters' },
				{ status: 400 }
			)
		}

		// Validate expertise areas
		if (!expertiseAreas || expertiseAreas.trim().length < 3) {
			return NextResponse.json(
				{ message: 'Please provide at least one expertise area' },
				{ status: 400 }
			)
		}

		// Save to database - use upsert to update if already exists
		const result = await sql`
			INSERT INTO tutors (user_id, email, full_name, degree_program, cgpa, experience_years, bio, expertise_areas, status)
			VALUES (${userId}, ${email}, ${fullName}, ${degreeProgram}, ${cgpaNum}, ${expNum}, ${bio}, ${expertiseAreas}, 'approved')
			ON CONFLICT (user_id) DO UPDATE SET
				email = EXCLUDED.email,
				full_name = EXCLUDED.full_name,
				degree_program = EXCLUDED.degree_program,
				cgpa = EXCLUDED.cgpa,
				experience_years = EXCLUDED.experience_years,
				bio = EXCLUDED.bio,
				expertise_areas = EXCLUDED.expertise_areas,
				updated_at = CURRENT_TIMESTAMP
			RETURNING id, status
		`

		// Also update the users table with the GPA to trigger badge calculation
		await sql`
			UPDATE users
			SET gpa = ${cgpaNum}
			WHERE id = ${userId}
		`

		console.log('✅ Tutor form submitted and saved to database:', {
			userId,
			fullName,
			email,
			degreeProgram,
			cgpa: cgpaNum,
			experienceYears: expNum,
			submittedAt: new Date().toISOString(),
		})

		return NextResponse.json(
			{
				message: 'Tutor form submitted successfully',
				success: true,
				tutorId: result[0]?.id,
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error submitting tutor form:', error)
		return NextResponse.json(
			{ message: 'Failed to submit form. Please try again.' },
			{ status: 500 }
		)
	}
}
