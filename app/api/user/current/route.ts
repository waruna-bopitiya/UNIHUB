import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(request: NextRequest) {
  try {
    await ensureTablesExist()

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Fetch user info
    const users = await sql`
      SELECT 
        id,
        first_name,
        email,
        year_of_university,
        semester
      FROM users 
      WHERE id = ${id}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0] as any

    return NextResponse.json({
      status: 'success',
      data: {
        id: user.id,
        firstName: user.first_name,
        email: user.email,
        year: user.year_of_university,
        semester: user.semester,
      }
    })
  } catch (error: any) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
