import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Fetch user profile from database
    const users = await sql`
      SELECT 
        id,
        first_name,
        second_name,
        email,
        phone_number,
        address,
        gender,
        year_of_university,
        semester,
        created_at,
        last_login
      FROM users 
      WHERE id = ${id}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0] as any

    return NextResponse.json({
      id: user.id,
      first_name: user.first_name,
      second_name: user.second_name,
      email: user.email,
      phone_number: user.phone_number,
      address: user.address,
      gender: user.gender,
      year_of_university: user.year_of_university,
      semester: user.semester,
      created_at: user.created_at,
      last_login: user.last_login,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
