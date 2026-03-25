import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    let { email, password, rememberMe } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Normalize email to lowercase for consistency
    email = email.toLowerCase().trim()

    // Validate email format
    if (!email.endsWith('@my.sliit.lk')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user by email and get last login (case-insensitive)
    const users = await sql`SELECT id, first_name, password, last_login FROM users WHERE LOWER(email) = LOWER(${email})`

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0] as any
    const previousLastLogin = user.last_login

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login timestamp
    await sql`UPDATE users SET updated_at = NOW(), last_login = NOW() WHERE id = ${user.id}`

    return NextResponse.json(
      {
        message: 'Login successful',
        studentId: user.id,
        firstName: user.first_name,
        email: email,
        lastLogin: previousLastLogin,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    )
  }
}
