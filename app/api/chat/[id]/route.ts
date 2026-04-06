import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id } = await params
    const idParam = id
    console.log('🔍 Received chat ID param:', idParam, 'type:', typeof idParam)
    
    const chatId = parseInt(idParam, 10)
    if (isNaN(chatId) || chatId <= 0) {
      console.error('❌ Invalid chat ID:', idParam)
      return NextResponse.json(
        { status: 'error', message: 'Invalid chat ID: ' + idParam },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting chat with id:', chatId)

    // Delete the chat (messages will be deleted automatically due to CASCADE)
    const result = await sql`
      DELETE FROM chats
      WHERE id = ${chatId}
      RETURNING id
    `

    console.log('Query executed, rows affected:', result.length)
    console.log('Result:', result)

    if (result.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Chat not found' },
        { status: 404 }
      )
    }

    console.log('✅ Chat deleted successfully')

    return NextResponse.json({
      status: 'success',
      message: 'Chat deleted successfully',
      data: result[0],
    })
  } catch (error: any) {
    console.error('❌ Exception in DELETE /api/chat/[id]:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to delete chat: ' + (error.message || 'Unknown error'),
        error: error.message 
      },
      { status: 500 }
    )
  }
}
