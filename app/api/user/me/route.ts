import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies or headers
    const studentIdCookie = request.cookies.get('studentId')?.value
    const emailCookie = request.cookies.get('email')?.value
    
    let userId: string | undefined = studentIdCookie
    
    // If no student ID in cookie, try to get from Authorization header or query param
    if (!userId) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7)
      } else {
        const url = new URL(request.url)
        const queryUserId = url.searchParams.get('userId')
        userId = queryUserId || undefined
      }
    }

    if (!userId && !emailCookie) {
      console.warn('⚠️ No user identification found in request')
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Query user by ID or email
    let users
    if (userId) {
      users = await sql`
        SELECT 
          id,
          first_name,
          second_name,
          email,
          last_login,
          logouttime
        FROM users
        WHERE id = ${userId}
        LIMIT 1
      `
    } else if (emailCookie) {
      users = await sql`
        SELECT 
          id,
          first_name,
          second_name,
          email,
          last_login,
          logouttime
        FROM users
        WHERE LOWER(email) = LOWER(${emailCookie})
        LIMIT 1
      `
    }

    if (!users || users.length === 0) {
      console.warn('⚠️ User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0] as any
    const fullName = `${user.first_name}${user.second_name ? ' ' + user.second_name : ''}`

    const response = {
      id: user.id,
      name: fullName,
      firstName: user.first_name,
      email: user.email,
      lastLogin: user.last_login,
      logoutTime: user.logouttime,
      avatar: `https://avatar.vercel.sh/${user.first_name.toLowerCase()}`,
    }

    console.log('✅ Fetched current user:', response.name)
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error fetching current user:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to fetch user information', details: errorMessage },
      { status: 500 }
    )
  }
}
