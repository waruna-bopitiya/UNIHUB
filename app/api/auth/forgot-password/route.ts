import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || !email.endsWith('@my.sliit.lk')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user exists
    const users = await sql`SELECT id FROM users WHERE email = ${email}`

    // Always return success message for security (don't reveal if email exists)
    // In production, you would:
    // 1. Generate a reset token
    // 2. Store it in database with expiration
    // 3. Send email with reset link
    // 4. Handle verification of token on reset page

    if (users.length > 0) {
      // TODO: Implement email sending with reset token
      // For now, just log that a reset was requested
      console.log(`Password reset requested for: ${email}`)
    }

    return NextResponse.json(
      {
        message: 'If an account exists with this email, a password reset link has been sent',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
