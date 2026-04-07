import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

// Send reminder notifications to all users who set reminders for a stream
export async function POST(req: NextRequest) {
  await ensureTablesExist()

  try {
    const { streamId, eventType } = await req.json()

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      )
    }

    // Get stream details
    const [stream] = await sql`
      SELECT id, title, scheduled_start_time, module_name, creator_id
      FROM live_streams
      WHERE id = ${streamId}
    `

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    // Get all users who set reminders for this stream
    const reminders = await sql`
      SELECT DISTINCT user_id
      FROM live_stream_reminders
      WHERE stream_id = ${streamId}
    `

    if (reminders.length === 0) {
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No reminders found for this stream'
      })
    }

    // Determine notification title and message based on event type
    let title = ''
    let message = ''

    if (eventType === 'live') {
      title = `Live Session Starting: ${stream.title}`
      message = `${stream.title} is now live! Click to watch.`
    } else if (eventType === 'starting_soon') {
      title = `Upcoming Live Session: ${stream.title}`
      message = `${stream.title} is starting soon! Be ready to join.`
    } else {
      title = `Reminder: ${stream.title}`
      message = `Don't miss ${stream.title}!`
    }

    // Create notifications for each user
    const notificationIds: number[] = []

    for (const reminder of reminders) {
      const [notification] = await sql`
        INSERT INTO notifications (user_id, type, title, message, related_stream_id, is_read, created_at)
        VALUES (
          ${reminder.user_id},
          'live_stream_reminder',
          ${title},
          ${message},
          ${streamId},
          false,
          NOW()
        )
        RETURNING id
      `

      if (notification?.id) {
        notificationIds.push(notification.id)
      }
    }

    return NextResponse.json({
      success: true,
      notificationsSent: notificationIds.length,
      message: `Notifications sent to ${notificationIds.length} users`,
      notificationIds
    })
  } catch (error) {
    console.error('Error sending reminder notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check and send automatic reminders 30 minutes before stream starts
export async function GET(req: NextRequest) {
  await ensureTablesExist()

  try {
    const apiKey = req.nextUrl.searchParams.get('key')
    
    // Simple API key check (you should use environment variables)
    if (apiKey !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find streams starting in the next 35 minutes (with 5-minute buffer)
    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)
    const thirtyFiveMinutesFromNow = new Date(now.getTime() + 35 * 60 * 1000)

    const upcomingStreams = await sql`
      SELECT id, title, scheduled_start_time, module_name
      FROM live_streams
      WHERE status != 'live'
        AND scheduled_start_time IS NOT NULL
        AND scheduled_start_time > ${thirtyMinutesFromNow.toISOString()}
        AND scheduled_start_time <= ${thirtyFiveMinutesFromNow.toISOString()}
        AND EXISTS (
          SELECT 1 FROM live_stream_reminders WHERE stream_id = live_streams.id
        )
    `

    let totalNotificationsSent = 0

    for (const stream of upcomingStreams) {
      const reminders = await sql`
        SELECT DISTINCT user_id
        FROM live_stream_reminders
        WHERE stream_id = ${stream.id}
      `

      for (const reminder of reminders) {
        await sql`
          INSERT INTO notifications (user_id, type, title, message, related_stream_id, is_read, created_at)
          VALUES (
            ${reminder.user_id},
            'live_stream_reminder',
            ${'Live Session Starting Soon: ' + stream.title},
            ${'Your class ' + stream.title + ' starts in 30 minutes!'},
            ${stream.id},
            false,
            NOW()
          )
        `
        totalNotificationsSent++
      }
    }

    return NextResponse.json({
      success: true,
      streamsProcessed: upcomingStreams.length,
      notificationsSent: totalNotificationsSent,
      message: `Processed ${upcomingStreams.length} streams, sent ${totalNotificationsSent} notifications`
    })
  } catch (error) {
    console.error('Error in reminder cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
