import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(req: NextRequest) {
  await ensureTablesExist()

  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const isReadParam = req.nextUrl.searchParams.get('isRead')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    let notifications

    if (isReadParam === null) {
      // Get all notifications
      notifications = await sql`
        SELECT 
          n.id,
          n.user_id,
          n.type,
          n.title,
          n.message,
          n.related_stream_id,
          n.is_read,
          n.read_at,
          n.created_at,
          ls.title as stream_title,
          ls.scheduled_start_time,
          ls.module_name
        FROM notifications n
        LEFT JOIN live_streams ls ON n.related_stream_id = ls.id
        WHERE n.user_id = ${userId}
        ORDER BY n.created_at DESC
        LIMIT ${limit}
      `
    } else {
      // Filter by is_read status
      const isReadBool = isReadParam === 'true'
      notifications = await sql`
        SELECT 
          n.id,
          n.user_id,
          n.type,
          n.title,
          n.message,
          n.related_stream_id,
          n.is_read,
          n.read_at,
          n.created_at,
          ls.title as stream_title,
          ls.scheduled_start_time,
          ls.module_name
        FROM notifications n
        LEFT JOIN live_streams ls ON n.related_stream_id = ls.id
        WHERE n.user_id = ${userId}
          AND n.is_read = ${isReadBool}
        ORDER BY n.created_at DESC
        LIMIT ${limit}
      `
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  await ensureTablesExist()

  try {
    const { userId, type, title, message, relatedStreamId } = await req.json()

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'userId, type, title, and message are required' },
        { status: 400 }
      )
    }

    const [notification] = await sql`
      INSERT INTO notifications (user_id, type, title, message, related_stream_id)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${relatedStreamId ?? null})
      RETURNING *
    `

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
