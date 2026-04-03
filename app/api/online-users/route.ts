import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Fetch all users with last_login
    // Show users who logged in recently (within last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    const users = await sql`
      SELECT 
        id,
        first_name,
        second_name,
        last_login,
        updated_at
      FROM users
      WHERE last_login IS NOT NULL 
        AND last_login > ${thirtyMinutesAgo}
      ORDER BY last_login DESC
      LIMIT 20
    `

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: `${user.first_name}${user.second_name ? ' ' + user.second_name : ''}`,
      lastLogin: user.last_login,
      updatedAt: user.updated_at,
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
