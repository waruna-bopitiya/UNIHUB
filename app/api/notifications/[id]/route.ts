import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params දැන් Promise එකක් ලෙස type කරන්න
) {
  await ensureTablesExist()

  try {
    // params await කරන්න
    const { id } = await params 
    const { isRead } = await req.json()

    if (!id || isRead === undefined) {
      return NextResponse.json(
        { error: 'id and isRead are required' },
        { status: 400 }
      )
    }

    const readAt = isRead ? new Date().toISOString() : null

    const [notification] = await sql`
      UPDATE notifications
      SET is_read = ${isRead}, read_at = ${readAt}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // මෙතනත් Promise එකක් ලෙස වෙනස් කරන්න
) {
  await ensureTablesExist()

  try {
    // params await කරන්න
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM notifications
      WHERE id = ${parseInt(id)}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, id: parseInt(id) })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}