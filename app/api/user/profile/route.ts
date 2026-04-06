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
    // Try to select bio and avatar, but handle if columns don't exist yet
    let user: any
    try {
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
          bio,
          avatar,
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
      user = users[0]
    } catch (err: any) {
      // If bio/avatar columns don't exist, try without them
      if (err.message?.includes('bio') || err.message?.includes('avatar')) {
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
        user = users[0]
      } else {
        throw err
      }
    }

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
      bio: user.bio || null,
      avatar: user.avatar || null,
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

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      first_name,
      second_name,
      phone_number,
      address,
      gender,
      year_of_university,
      semester,
    } = body

    // Validate required fields
    if (!first_name || !second_name || !phone_number || !gender || !year_of_university || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update user profile in database
    await sql`
      UPDATE users 
      SET 
        first_name = ${first_name},
        second_name = ${second_name},
        phone_number = ${phone_number},
        address = ${address},
        gender = ${gender},
        year_of_university = ${year_of_university},
        semester = ${semester},
        updated_at = NOW()
      WHERE id = ${id}
    `

    // Fetch and return updated profile
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
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
