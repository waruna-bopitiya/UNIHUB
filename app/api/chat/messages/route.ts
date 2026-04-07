import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'
import { sendMessageNotificationEmail } from '@/lib/email'

// POST: Add a message to a chat or multiple chats
export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist()

    const body = await req.json()
    const { chatId, chatIds, sender, senderAvatar, content, isOwn } = body

    // Support both single chat and multiple chats
    const targetChatIds = Array.isArray(chatIds) && chatIds.length > 0 
      ? chatIds 
      : (chatId ? [chatId] : [])

    if (targetChatIds.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Chat ID or Chat IDs are required' },
        { status: 400 }
      )
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Message content is required' },
        { status: 400 }
      )
    }

    console.log('💬 Adding message to', targetChatIds.length, 'chat(s)')

    const savedMessages = []
    const recipientProfiles = []

    // Send message to each chat
    for (const cId of targetChatIds) {
      try {
        // Get chat details to find recipient
        const chatDetails = await sql`
          SELECT id, user_id, participant_id, participant_name
          FROM chats
          WHERE id = ${cId}
        `

        if (chatDetails.length === 0) {
          console.warn(`⚠️ Chat ${cId} not found`)
          continue
        }

        const chat = chatDetails[0]

        // Add the message (sent messages are marked as read, received messages are unread)
        const result = await sql`
          INSERT INTO chat_messages (chat_id, sender, sender_avatar, content, is_own, is_read)
          VALUES (${cId}, ${sender || 'You'}, ${senderAvatar || 'Y'}, ${content.trim()}, ${isOwn || true}, ${isOwn || false})
          RETURNING id, sender, sender_avatar, content, is_own, is_read, created_at
        `

        const message = result[0]

        // Update chat's updated_at timestamp
        await sql`
          UPDATE chats
          SET updated_at = NOW()
          WHERE id = ${cId}
        `

        savedMessages.push({
          id: message.id.toString(),
          chatId: cId.toString(),
          sender: message.sender,
          senderAvatar: message.sender_avatar,
          content: message.content,
          timestamp: new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          isOwn: message.is_own,
          isRead: message.is_read,
        })

        console.log('✅ Message saved to chat', cId, 'with ID:', message.id)

        // Get recipient's profile information
        let recipientProfile: any = null
        if (chat.participant_id) {
          try {
            const recipientData = await sql`
              SELECT 
                id,
                first_name,
                second_name,
                email,
                phone_number,
                address,
                gender,
                year_of_university,
                semester,
                bio,
                avatar
              FROM users 
              WHERE id = ${chat.participant_id}
            `
            if (recipientData.length > 0) {
              recipientProfile = recipientData[0]
            }
          } catch (error) {
            console.error('⚠️ Could not fetch recipient profile:', error)
          }
        }

        // Send email notification if we have recipient email
        if (recipientProfile && recipientProfile.email && isOwn) {
          const messagePreview = content.substring(0, 100) + (content.length > 100 ? '...' : '')
          const senderFullName = sender === 'You' ? 'A student' : sender
          const recipientFullName = `${recipientProfile.first_name} ${recipientProfile.second_name}`.trim()

          console.log(`📧 Sending email to ${recipientProfile.email}`)
          await sendMessageNotificationEmail(
            recipientProfile.email,
            recipientFullName,
            senderFullName,
            messagePreview
          )
        }

        // Collect recipient profiles
        if (recipientProfile) {
          recipientProfiles.push({
            chatId: cId.toString(),
            profile: {
              id: recipientProfile.id,
              firstName: recipientProfile.first_name,
              secondName: recipientProfile.second_name,
              email: recipientProfile.email,
              phoneNumber: recipientProfile.phone_number,
              address: recipientProfile.address,
              gender: recipientProfile.gender,
              yearOfUniversity: recipientProfile.year_of_university,
              semester: recipientProfile.semester,
              bio: recipientProfile.bio,
              avatar: recipientProfile.avatar,
            }
          })
        }
      } catch (error) {
        console.error(`❌ Error saving message to chat ${cId}:`, error)
      }
    }

    if (savedMessages.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Failed to send message to any recipient' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        status: 'success',
        message: `Message sent to ${savedMessages.length} recipient(s)`,
        data: savedMessages,
        recipientProfiles: recipientProfiles,
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
