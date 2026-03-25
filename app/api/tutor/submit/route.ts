import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

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
		if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 4.2) {
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
		if (bio.trim().length < 30) {
			return NextResponse.json(
				{ message: 'Bio must be at least 30 characters' },
				{ status: 400 }
			)
		}

		// TODO: Save to database
		// For now, we just validate and return success
		console.log('Tutor form submitted:', {
			fullName,
			email,
			degreeProgram,
			cgpa: cgpaNum,
			experienceYears: expNum,
			bio,
			expertiseAreas,
			submittedAt: new Date().toISOString(),
		})

		return NextResponse.json(
			{
				message: 'Tutor form submitted successfully',
				success: true,
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
