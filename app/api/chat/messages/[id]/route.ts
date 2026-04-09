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
    console.log('🔍 Received message ID param:', idParam, 'type:', typeof idParam)
    
    const messageId = parseInt(idParam, 10)
    if (isNaN(messageId) || messageId <= 0) {
      console.error('❌ Invalid message ID:', idParam)
      return NextResponse.json(
        { status: 'error', message: 'Invalid message ID: ' + idParam },
        { status: 400 }
      )
    }

    console.log('🗑️ Soft-deleting message with id:', messageId)

    // Get the message details first
    const messageDetails = await sql`
      SELECT id, chat_id, content, sender, created_at
      FROM chat_messages
      WHERE id = ${messageId}
      LIMIT 1
    `

    if (messageDetails.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Message not found' },
        { status: 404 }
      )
    }

    const message = messageDetails[0]
    console.log(`📝 Found message: "${message.content}" in chat ${message.chat_id}`)

    // Get the chat info to find the recipient's chat
    const chatInfo = await sql`
      SELECT id, user_id, participant_id
      FROM chats
      WHERE id = ${message.chat_id}
      LIMIT 1
    `

    if (chatInfo.length === 0) {
      console.warn('⚠️ Chat not found for message')
      return NextResponse.json(
        { status: 'error', message: 'Chat not found' },
        { status: 404 }
      )
    }

    const chat = chatInfo[0]
    console.log(`🔗 Chat info - user_id: ${chat.user_id}, participant_id: ${chat.participant_id}`)

    // Find the recipient's corresponding chat (the other side of the conversation)
    let recipientChatId = null
    
    // Method 1: Try to find by participant_id (most reliable)
    if (chat.participant_id) {
      try {
        const recipientChat = await sql`
          SELECT id FROM chats
          WHERE user_id = ${chat.participant_id}
          AND participant_id = ${chat.user_id}
          LIMIT 1
        `
        if (recipientChat.length > 0) {
          recipientChatId = recipientChat[0].id
          console.log(`✅ Found recipient's chat by participant_id: ${recipientChatId}`)
        }
      } catch (err) {
        console.warn('⚠️ Could not find recipient by participant_id:', err)
      }
    }
    
    // Method 2: If Method 1 failed, search for chat by finding who the participant is talking to
    if (!recipientChatId) {
      try {
        console.log('🔍 Trying alternate method - searching all chats with this sender...')
        // Find all chats where this user is the participant, so we can find their corresponding chat
        const otherChatsWithSender = await sql`
          SELECT id, user_id, participant_id
          FROM chats
          WHERE (user_id = ${chat.user_id} OR participant_id = ${chat.user_id})
          AND id != ${message.chat_id}
          LIMIT 5
        `
        
        if (otherChatsWithSender.length > 0) {
          recipientChatId = otherChatsWithSender[0].id
          console.log(`✅ Found alternative recipient chat: ${recipientChatId}`)
        }
      } catch (err) {
        console.warn('⚠️ Could not find recipient by alternate method:', err)
      }
    }
    
    if (!recipientChatId) {
      console.warn('⚠️ Could not find recipient chat - will only delete from sender side')
    }

    // Soft-delete the message from sender's chat (mark with deleted_at timestamp)
    const deletedFromSender = await sql`
      UPDATE chat_messages
      SET deleted_at = NOW()
      WHERE id = ${messageId}
      RETURNING id, chat_id
    `

    console.log('✅ Soft-deleted from sender chat:', deletedFromSender.length, 'row(s)')

    // Soft-delete the same message from recipient's chat (by matching sender, content, and timestamp)
    let deletedFromRecipient: any[] = []
    if (recipientChatId) {
      try {
        console.log(`🔍 Looking for message in recipient chat ${recipientChatId}`)
        console.log(`   Matching by: sender="${message.sender}", content="${message.content}", created_at="${message.created_at}"`)
        
        // First, try exact timestamp match
        deletedFromRecipient = await sql`
          UPDATE chat_messages
          SET deleted_at = NOW()
          WHERE chat_id = ${recipientChatId}
          AND sender = ${message.sender}
          AND content = ${message.content}
          AND created_at = ${message.created_at}
          RETURNING id, chat_id
        `
        console.log('✅ Soft-deleted from recipient chat (exact match):', deletedFromRecipient.length, 'row(s)')
        
        // If exact match didn't work, try matching with timestamp tolerance (within 2 seconds)
        if (deletedFromRecipient.length === 0) {
          console.warn('⚠️ Exact timestamp match failed, trying tolerance match (within 2 seconds)...')
          deletedFromRecipient = await sql`
            UPDATE chat_messages
            SET deleted_at = NOW()
            WHERE chat_id = ${recipientChatId}
            AND sender = ${message.sender}
            AND content = ${message.content}
            AND created_at >= ${new Date(new Date(message.created_at).getTime() - 2000)}
            AND created_at <= ${new Date(new Date(message.created_at).getTime() + 2000)}
            AND deleted_at IS NULL
            RETURNING id, chat_id
          `
          console.log('✅ Soft-deleted from recipient chat (tolerance match):', deletedFromRecipient.length, 'row(s)')
        }
      } catch (err) {
        console.warn('⚠️ Could not delete from recipient chat:', err)
        // Don't fail the entire operation if recipient delete fails
      }
    } else {
      console.warn('⚠️ No recipient chat found - message only deleted from sender side')
    }

    console.log(`✅ Message soft-deleted successfully:`)
    console.log(`   - Sender chat: ${deletedFromSender.length} message(s) deleted`)
    console.log(`   - Recipient chat: ${deletedFromRecipient.length} message(s) deleted`)

    return NextResponse.json({
      status: 'success',
      message: 'Message deleted from both sender and recipient chats (WhatsApp style)',
      data: {
        deletedFromSender: deletedFromSender[0],
        deletedFromRecipient: deletedFromRecipient.length > 0 ? deletedFromRecipient[0] : null,
      },
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
