import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

// Set or remove a reminder for a live stream
export async function POST(req: NextRequest) {
  await ensureTablesExist()

  try {
    const { userId, streamId, action } = await req.json()

    if (!userId || !streamId) {
      return NextResponse.json(
        { error: 'userId and streamId are required' },
        { status: 400 }
      )
    }

    // Validate action
    if (action !== 'set' && action !== 'remove') {
      return NextResponse.json(
        { error: 'action must be "set" or "remove"' },
        { status: 400 }
      )
    }

    // Verify stream exists
    const [stream] = await sql`
      SELECT id FROM live_streams WHERE id = ${streamId}
    `

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    if (action === 'set') {
      // Add reminder (ignore if already exists)
      try {
        await sql`
          INSERT INTO live_stream_reminders (user_id, stream_id)
          VALUES (${userId}, ${streamId})
          ON CONFLICT (user_id, stream_id) DO NOTHING
        `
      } catch (error: any) {
        // Handle unique constraint gracefully
        if (error.code !== '23505') throw error
      }

      return NextResponse.json({
        success: true,
        message: 'Reminder set successfully'
      })
    } else {
      // Remove reminder
      await sql`
        DELETE FROM live_stream_reminders
        WHERE user_id = ${userId} AND stream_id = ${streamId}
      `

      return NextResponse.json({
        success: true,
        message: 'Reminder removed successfully'
      })
    }
  } catch (error) {
    console.error('Error managing reminder:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all reminders for a user
export async function GET(req: NextRequest) {
  await ensureTablesExist()

  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const streamId = req.nextUrl.searchParams.get('streamId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (streamId) {
      // Check if user has reminder for specific stream
      const [reminder] = await sql`
        SELECT id FROM live_stream_reminders
        WHERE user_id = ${userId} AND stream_id = ${streamId}
      `

      return NextResponse.json({
        hasReminder: !!reminder
      })
    } else {
      // Get all reminders for user
      const reminders = await sql`
        SELECT 
          lsr.id,
          lsr.stream_id,
          lsr.created_at,
          ls.title,
          ls.scheduled_start_time,
          ls.status
        FROM live_stream_reminders lsr
        JOIN live_streams ls ON lsr.stream_id = ls.id
        WHERE lsr.user_id = ${userId}
        ORDER BY ls.scheduled_start_time ASC
      `

      return NextResponse.json(reminders)
    }
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
