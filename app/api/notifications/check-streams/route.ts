import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function POST(req: NextRequest) {
  await ensureTablesExist()

  try {
    // Get all streams scheduled to start within the next 15 minutes
    const now = new Date()
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60000)

    const upcomingStreams = await sql`
      SELECT 
        ls.id,
        ls.title,
        ls.module_name,
        ls.scheduled_start_time
      FROM live_streams ls
      LEFT JOIN live_stream_notification_status lsns ON ls.id = lsns.stream_id
      WHERE ls.scheduled_start_time > ${now.toISOString()}
        AND ls.scheduled_start_time <= ${fifteenMinutesLater.toISOString()}
        AND (lsns.reminder_sent IS FALSE OR lsns.reminder_sent IS NULL)
    `

    if (upcomingStreams.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No upcoming streams found',
        notificationsCreated: 0,
      })
    }

    // Get all users
    const allUsers = await sql`SELECT id FROM users`

    let totalNotificationsCreated = 0

    // For each upcoming stream
    for (const stream of upcomingStreams) {
      // Create notifications for all users
      for (const user of allUsers) {
        try {
          await sql`
            INSERT INTO notifications (user_id, type, title, message, related_stream_id)
            VALUES (
              ${user.id},
              'live_stream_reminder',
              'Live Stream Starting Soon',
              ${'🔴 ' + stream.title + ' starts in 15 minutes!'},
              ${stream.id}
            )
          `
          totalNotificationsCreated++
        } catch (error) {
          console.warn(`Failed to create notification for user ${user.id}:`, error)
        }
      }

      // Mark this stream as having reminder sent
      try {
        await sql`
          INSERT INTO live_stream_notification_status (stream_id, reminder_sent, reminder_sent_at)
          VALUES (${stream.id}, true, ${new Date().toISOString()})
          ON CONFLICT (stream_id) DO UPDATE SET reminder_sent = true, reminder_sent_at = ${new Date().toISOString()}
        `
      } catch (error) {
        console.warn(`Failed to update notification status for stream ${stream.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${totalNotificationsCreated} notifications for ${upcomingStreams.length} stream(s)`,
      streamsProcessed: upcomingStreams.length,
      notificationsCreated: totalNotificationsCreated,
    })
  } catch (error) {
    console.error('Error checking streams for notifications:', error)
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    )
  }
}
