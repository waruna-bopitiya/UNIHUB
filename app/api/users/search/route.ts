import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist()

    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({
        status: 'success',
        data: [],
      })
    }

    console.log('🔍 Searching for users with query:', query)

    // Search for users by first_name, second_name, or email
    const users = await sql`
      SELECT 
        id,
        first_name,
        second_name,
        email,
        year_of_university,
        semester
      FROM users
      WHERE 
        LOWER(first_name) LIKE ${`%${query.toLowerCase()}%`} OR
        LOWER(second_name) LIKE ${`%${query.toLowerCase()}%`} OR
        LOWER(email) LIKE ${`%${query.toLowerCase()}%`}
      LIMIT ${limit}
    `

    console.log('✅ Found', users.length, 'users')

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      firstName: user.first_name,
      secondName: user.second_name,
      fullName: `${user.first_name} ${user.second_name || ''}`.trim(),
      email: user.email,
      year: user.year_of_university,
      semester: user.semester,
    }))

    return NextResponse.json({
      status: 'success',
      data: formattedUsers,
    })
  } catch (error: any) {
    console.error('❌ Error searching users:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
