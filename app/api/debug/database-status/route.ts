import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking database structure and all users...')

    // Check if tables exist
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    console.log('📋 Tables found:', tableCheck.map((t: any) => t.table_name))

    // Get all users
    console.log('\n👥 Fetching all users...')
    const users = await sql`
      SELECT 
        id,
        first_name,
        second_name,
        email,
        gender,
        year_of_university,
        semester,
        created_at,
        updated_at,
        last_login
      FROM users
      ORDER BY created_at DESC
    `

    console.log(`✅ Found ${users.length} users in database`)

    if (users.length === 0) {
      return NextResponse.json({
        status: 'success',
        message: 'Database is empty - no users found yet',
        databaseStatus: 'Ready for signup',
        tables: tableCheck.map((t: any) => t.table_name),
        userCount: 0,
        users: [],
      })
    }

    const userList = users.map((user: any) => ({
      studentId: user.id,
      firstName: user.first_name,
      secondName: user.second_name,
      email: user.email,
      gender: user.gender,
      year: user.year_of_university,
      semester: user.semester,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login,
    }))

    // Group by email for easy lookup
    const emailMap: { [key: string]: any } = {}
    userList.forEach(user => {
      if (!emailMap[user.email]) {
        emailMap[user.email] = user
      }
    })

    return NextResponse.json({
      status: 'success',
      databaseStatus: 'Active with users',
      tables: tableCheck.map((t: any) => t.table_name),
      userCount: users.length,
      users: userList,
      emailQuickLookup: emailMap,
      suggestedEmails: userList.map(u => u.email),
    })
  } catch (error) {
    console.error('❌ Error checking database:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to check database',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
