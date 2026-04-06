import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

// POST: Add a message to a chat
export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist()

    const body = await req.json()
    const { chatId, sender, senderAvatar, content, isOwn } = body

    if (!chatId) {
      return NextResponse.json(
        { status: 'error', message: 'Chat ID is required' },
        { status: 400 }
      )
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Message content is required' },
        { status: 400 }
      )
    }

    console.log('💬 Adding message to chat:', chatId)

    // Add the message (sent messages are marked as read, received messages are unread)
    const result = await sql`
      INSERT INTO chat_messages (chat_id, sender, sender_avatar, content, is_own, is_read)
      VALUES (${chatId}, ${sender || 'You'}, ${senderAvatar || 'Y'}, ${content.trim()}, ${isOwn || true}, ${isOwn || false})
      RETURNING id, sender, sender_avatar, content, is_own, is_read, created_at
    `

    const message = result[0]
    
    // Update chat's updated_at timestamp
    await sql`
      UPDATE chats
      SET updated_at = NOW()
      WHERE id = ${chatId}
    `

    console.log('✅ Message saved with ID:', message.id)

    return NextResponse.json(
      {
        status: 'success',
        message: 'Message saved successfully',
        data: {
          id: message.id.toString(),
          sender: message.sender,
          senderAvatar: message.sender_avatar,
          content: message.content,
          timestamp: new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isOwn: message.is_own,
          isRead: message.is_read,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error saving message:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
