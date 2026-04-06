import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist()

    const body = await req.json()
    const { chatId } = body

    if (!chatId) {
      return NextResponse.json(
        { status: 'error', message: 'Chat ID is required' },
        { status: 400 }
      )
    }

    console.log('📖 Marking messages as read for chat:', chatId)

    // Mark all unread messages in this chat as read (messages from others)
    const result = await sql`
      UPDATE chat_messages
      SET is_read = true
      WHERE chat_id = ${parseInt(chatId)} AND is_own = false AND is_read = false
      RETURNING id
    `

    console.log('✅ Marked', result.length, 'messages as read')

    return NextResponse.json({
      status: 'success',
      message: 'Messages marked as read',
      data: { markedCount: result.length },
    })
  } catch (error: any) {
    console.error('❌ Error marking messages as read:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
