import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID required' },
        { status: 400 }
      )
    }

    // Fetch tutor data from database
    const result = await sql`
      SELECT 
        id,
        user_id,
        email,
        full_name,
        degree_program,
        cgpa,
        experience_years,
        bio,
        expertise_areas,
        status,
        created_at,
        updated_at
      FROM tutors
      WHERE user_id = ${userId}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json(
        { message: 'No tutor profile found' },
        { status: 404 }
      )
    }

    const tutor = result[0]
    console.log('✅ Fetched tutor data:', tutor.full_name)
    
    return NextResponse.json(tutor, { status: 200 })
  } catch (error) {
    console.error('Error fetching tutor data:', error)
    return NextResponse.json(
      { message: 'Failed to fetch tutor profile' },
      { status: 500 }
    )
  }
}
