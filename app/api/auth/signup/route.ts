import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Generate student ID in format STU00000001
async function generateStudentId() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM users`
    const count = (result[0] as any).count
    const nextId = count + 1
    return `STU${String(nextId).padStart(8, '0')}`
  } catch {
    // If table doesn't exist yet, start from 1
    return 'STU00000001'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { firstName, secondName, email, countryCode, phoneNumber, address, gender, yearOfUniversity, semester, password } = body

    // Validate required fields
    if (!firstName || !email || !countryCode || !phoneNumber || !yearOfUniversity || !semester || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Combine country code and phone number
    const fullPhoneNumber = `${countryCode} ${phoneNumber}`

    // Validate email format
    if (!email.endsWith('@my.sliit.lk')) {
      return NextResponse.json(
        { error: 'Email must end with @my.sliit.lk' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate student ID
    const studentId = await generateStudentId()

    // Insert user into database
    const result = await sql`
      INSERT INTO users (id, first_name, second_name, email, phone_number, country_code, address, gender, year_of_university, semester, password, created_at)
      VALUES (${studentId}, ${firstName}, ${secondName}, ${email}, ${fullPhoneNumber}, ${countryCode}, ${address}, ${gender}, ${yearOfUniversity}, ${semester}, ${hashedPassword}, NOW())
      RETURNING id
    `

    return NextResponse.json(
      {
        message: 'User created successfully',
        studentId: result[0].id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    
    // Provide specific error messages based on error type
    let errorMessage = 'An error occurred during signup'
    let statusCode = 500

    if (error.message) {
      const msg = error.message.toLowerCase()
      
      // Database connection errors
      if (msg.includes('connection') || msg.includes('econnrefused')) {
        errorMessage = 'Database connection failed. Please check your database connection.'
        statusCode = 503
      }
      // Duplicate email error
      else if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('email')) {
        errorMessage = 'This email is already registered'
        statusCode = 409
      }
      // Column/schema errors
      else if (msg.includes('column') || msg.includes('does not exist')) {
        errorMessage = 'Database schema error. Please ensure the users table is created with the correct columns.'
        statusCode = 500
      }
      // Data type errors
      else if (msg.includes('integer') || msg.includes('numeric')) {
        errorMessage = 'Invalid data format. Year and Semester must be numbers.'
        statusCode = 400
      }
      // Check constraint errors
      else if (msg.includes('check')) {
        errorMessage = 'Invalid year (must be 1-4) or semester (must be 1-2)'
        statusCode = 400
      }
      // Generic message
      else {
        errorMessage = error.message || 'An error occurred during signup. Please try again.'
        statusCode = 500
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
