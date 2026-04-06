import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTablesExist()

    const idParam = params.id
    console.log('🔍 Received message ID param:', idParam, 'type:', typeof idParam)
    
    const messageId = parseInt(idParam, 10)
    if (isNaN(messageId) || messageId <= 0) {
      console.error('❌ Invalid message ID:', idParam)
      return NextResponse.json(
        { status: 'error', message: 'Invalid message ID: ' + idParam },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting message with id:', messageId)

    // Delete the message
    const result = await sql`
      DELETE FROM chat_messages
      WHERE id = ${messageId}
      RETURNING id, chat_id
    `

    console.log('Query executed, rows affected:', result.length)
    console.log('Result:', result)

    if (result.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Message not found' },
        { status: 404 }
      )
    }

    console.log('✅ Message deleted successfully')

    return NextResponse.json({
      status: 'success',
      message: 'Message deleted successfully',
      data: result[0],
    })
  } catch (error: any) {
    console.error('❌ Exception in DELETE /api/chat/messages/[id]:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to delete message: ' + (error.message || 'Unknown error'),
        error: error.message 
      },
      { status: 500 }
    )
  }
}
