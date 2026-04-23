import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await ensureTablesExist()

    // Fetch users sorted by number of answers they've given
    const topHelpers = await sql`
      SELECT 
        u.id,
        u.first_name,
        u.second_name,
        u.badges,
        COUNT(a.id) as answer_count
      FROM users u
      LEFT JOIN answers a ON u.id = a.user_id
      GROUP BY u.id, u.first_name, u.second_name, u.badges
      ORDER BY answer_count DESC
      LIMIT 10
    `

    const formattedHelpers = topHelpers.map((helper: any, index: number) => ({
      id: helper.id,
      name: `${helper.first_name}${helper.second_name ? ' ' + helper.second_name : ''}`,
      avatar: `https://avatar.vercel.sh/${helper.first_name.toLowerCase()}`,
      answerCount: parseInt(helper.answer_count) || 0,
      badges: helper.badges || [],
      rank: index + 1,
      medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'
    }))

    return NextResponse.json(formattedHelpers)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Error fetching top helpers:', errorMessage)
    return NextResponse.json(
      {
        error: 'Failed to fetch top helpers',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
