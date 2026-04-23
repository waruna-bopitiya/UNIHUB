import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if trigger function exists
    const triggerCheck = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_user_badges'
      ) as trigger_exists
    `

    // Check if function exists
    const functionCheck = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'update_user_badges'
      ) as function_exists
    `

    // Fetch user badges from database
    const userCheck = await sql`
      SELECT 
        id, 
        gpa, 
        badges,
        first_name,
        email
      FROM users 
      WHERE id = ${userId}
    `

    return NextResponse.json({
      status: 'Database Status Report',
      trigger_exists: triggerCheck[0]?.trigger_exists || false,
      function_exists: functionCheck[0]?.function_exists || false,
      user: userCheck[0] || { error: 'User not found' },
      debug: {
        userId,
        timestamp: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { 
        error: 'Debug check failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
