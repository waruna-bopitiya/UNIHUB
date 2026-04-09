import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

// PATCH: Update message read status
export async function PATCH(req: NextRequest) {
  try {
    await ensureTablesExist()

    const body = await req.json()
    const { messageId, status, chatId } = body

    // Validate input
    if (!messageId || !status) {
      return NextResponse.json(
        { status: 'error', message: 'messageId and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['sent', 'delivered', 'read']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid status. Must be one of: sent, delivered, read' },
        { status: 400 }
      )
    }

    console.log(`📝 Updating message ${messageId} status to: ${status}`)

    // Update message status
    const result = await sql`
      UPDATE chat_messages
      SET 
        status = ${status},
        is_read = ${status === 'read'},
        updated_at = NOW()
      WHERE id = ${parseInt(messageId)}
      RETURNING id, status, is_read, created_at
    `

    if (result.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Message not found' },
        { status: 404 }
      )
    }

    const message = result[0]
    console.log(`✅ Message ${messageId} status updated to: ${message.status}`)

    return NextResponse.json(
      {
        status: 'success',
        message: `Message status updated to ${status}`,
        data: {
          id: message.id.toString(),
          status: message.status,
          isRead: message.is_read,
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Error updating message status:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}

// PUT: Mark multiple messages as read
export async function PUT(req: NextRequest) {
  try {
    await ensureTablesExist()

    const body = await req.json()
    const { chatId } = body

    if (!chatId) {
      return NextResponse.json(
        { status: 'error', message: 'chatId is required' },
        { status: 400 }
      )
    }

    console.log(`📖 Marking all unread messages as read for chat: ${chatId}`)

    // Mark all unread messages in chat as read
    const result = await sql`
      UPDATE chat_messages
      SET 
        status = 'read',
        is_read = true,
        updated_at = NOW()
      WHERE chat_id = ${parseInt(chatId)} AND is_read = false
      RETURNING id
    `

    console.log(`✅ Marked ${result.length} messages as read`)

    return NextResponse.json(
      {
        status: 'success',
        message: `Marked ${result.length} messages as read`,
        data: {
          markedCount: result.length,
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Error marking messages as read:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
