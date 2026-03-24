import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking all users in database...')

    const users = await sql`
      SELECT 
        id,
        first_name,
        second_name,
        email,
        created_at,
        last_login
      FROM users
      ORDER BY created_at DESC
    `

    console.log(`📋 Found ${users.length} users in database`)

    if (users.length === 0) {
      return NextResponse.json({
        status: 'success',
        message: 'Database is empty - no users found',
        userCount: 0,
        users: [],
        suggestion: 'Please sign up first at http://localhost:3000/auth/signup',
      })
    }

    const userList = users.map((user: any) => ({
      studentId: user.id,
      firstName: user.first_name,
      secondName: user.second_name,
      email: user.email,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    }))

    return NextResponse.json({
      status: 'success',
      userCount: users.length,
      users: userList,
    })
  } catch (error) {
    console.error('❌ Error checking users:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to check users',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
