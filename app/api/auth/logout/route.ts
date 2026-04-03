import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update logout time for the user
    const result = await sql`
      UPDATE users 
      SET logouttime = NOW(), updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, logouttime
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`✅ User ${userId} logged out at ${result[0].logouttime}`)

    return NextResponse.json(
      {
        message: 'Logout successful',
        logoutTime: result[0].logouttime,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout. Please try again.' },
      { status: 500 }
    )
  }
}
