import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID required' },
        { status: 400 }
      )
    }

    // Delete tutor profile
    const result = await sql`
      DELETE FROM tutors
      WHERE user_id = ${userId}
      RETURNING id, full_name
    `

    if (result.length === 0) {
      return NextResponse.json(
        { message: 'No tutor profile found to delete' },
        { status: 404 }
      )
    }

    // Clear GPA and badges from users table (trigger will recalculate badges as empty)
    await sql`
      UPDATE users
      SET gpa = NULL, badges = '{}'
      WHERE id = ${userId}
    `

    console.log('✅ Tutor profile deleted:', result[0].full_name)
    console.log('✅ GPA and badges cleared for user:', userId)

    return NextResponse.json(
      { 
        message: 'Tutor profile deleted successfully',
        success: true 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting tutor profile:', error)
    return NextResponse.json(
      { message: 'Failed to delete tutor profile' },
      { status: 500 }
    )
  }
}
