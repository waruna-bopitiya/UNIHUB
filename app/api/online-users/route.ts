import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Fetch all users with last_login and logouttime
    // Show users who have logged in AND NOT logged out (or logout time is before last login)
    const users = await sql`
      SELECT 
        id,
        first_name,
        second_name,
        last_login,
        logouttime
      FROM users
      WHERE last_login IS NOT NULL 
        AND (
          logouttime IS NULL
          OR logouttime < last_login
        )
      ORDER BY last_login DESC
      LIMIT 50
    `

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: `${user.first_name}${user.second_name ? ' ' + user.second_name : ''}`,
      lastLogin: user.last_login,
      logoutTime: user.logouttime,
      avatar: `https://avatar.vercel.sh/${user.first_name.toLowerCase()}`,
    }))

    return Response.json(formattedUsers)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Database error:', errorMessage)
    return Response.json(
      { 
        error: 'Failed to fetch online users', 
        details: errorMessage
      }, 
      { status: 500 }
    )
  }
}
