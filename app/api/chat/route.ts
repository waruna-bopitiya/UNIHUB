import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

// GET: Fetch all chats for a user
export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist()

    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('📥 Fetching chats for user:', userId)

    // Get all chats for the user with participant's last login
    const chats = await sql`
      SELECT 
        c.id, 
        c.chat_name, 
        c.participant_name, 
        c.avatar, 
        c.created_at, 
        c.updated_at,
        c.participant_id,
        u.last_login
      FROM chats c
      LEFT JOIN users u ON c.participant_id = u.id
      WHERE c.user_id = ${userId}
      ORDER BY c.updated_at DESC
    `

    console.log('✅ Found', chats.length, 'chats for user')

    // For each chat, get the messages
    const chatsWithMessages = await Promise.all(
      chats.map(async (chat: any) => {
        const messages = await sql`
          SELECT id, sender, sender_avatar, content, is_own, is_read, created_at
          FROM chat_messages
          WHERE chat_id = ${chat.id}
          ORDER BY created_at ASC
        `

        // Calculate unread count (messages from others that haven't been read)
        const unreadCount = messages.filter((msg: any) => !msg.is_own && !msg.is_read).length

        // Format last login time
        let lastLoginDisplay = 'Never'
        if (chat.last_login) {
          const lastLoginDate = new Date(chat.last_login)
          const now = new Date()
          const diffMs = now.getTime() - lastLoginDate.getTime()
          const diffMins = Math.floor(diffMs / 60000)
          const diffHours = Math.floor(diffMs / 3600000)
          const diffDays = Math.floor(diffMs / 86400000)

          if (diffMins < 1) {
            lastLoginDisplay = 'Active now'
          } else if (diffMins < 60) {
            lastLoginDisplay = `${diffMins}m ago`
          } else if (diffHours < 24) {
            lastLoginDisplay = `${diffHours}h ago`
          } else if (diffDays < 7) {
            lastLoginDisplay = `${diffDays}d ago`
          } else {
            lastLoginDisplay = lastLoginDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
          }
        }

        return {
          id: chat.id.toString(),
          name: chat.chat_name,
          avatar: chat.avatar,
          lastMessage: messages.length > 0 ? messages[messages.length - 1].content : 'No messages yet',
          unread: unreadCount,
          lastLogin: lastLoginDisplay,
          messages: messages.map((msg: any) => ({
            id: msg.id.toString(),
            sender: msg.sender,
            senderAvatar: msg.sender_avatar,
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            isOwn: msg.is_own,
            isRead: msg.is_read,
          })),
        }
      })
    )

    return NextResponse.json({
      status: 'success',
      data: chatsWithMessages,
    })
  } catch (error: any) {
    console.error('❌ Error fetching chats:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}

// POST: Create a new chat
export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist()

    const body = await req.json()
    const { userId, participantName, participantId } = body

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!participantName?.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Participant name is required' },
        { status: 400 }
      )
    }

    console.log('💾 Creating new chat for user:', userId, 'with participant:', participantName, 'ID:', participantId)

    // Create the chat
    const result = await sql`
      INSERT INTO chats (user_id, chat_name, participant_name, avatar, participant_id)
      VALUES (${userId}, ${participantName.trim()}, ${participantName.trim()}, ${participantName.charAt(0).toUpperCase()}, ${participantId || null})
      RETURNING id, chat_name, participant_name, avatar, created_at, participant_id
    `

    const chat = result[0]
    console.log('✅ Chat created with ID:', chat.id)

    // Create initial message
    const messageResult = await sql`
      INSERT INTO chat_messages (chat_id, sender, sender_avatar, content, is_own)
      VALUES (${chat.id}, ${participantName.trim()}, ${participantName.charAt(0).toUpperCase()}, ${'Hi! Let\'s chat!'}, false)
      RETURNING id, sender, sender_avatar, content, is_own, created_at
    `

    const message = messageResult[0]

    // Fetch participant's last login if participant_id exists
    let lastLoginDisplay = 'Never'
    if (participantId) {
      try {
        const userResult = await sql`SELECT last_login FROM users WHERE id = ${participantId}`
        if (userResult.length > 0 && userResult[0].last_login) {
          const lastLoginDate = new Date(userResult[0].last_login)
          const now = new Date()
          const diffMs = now.getTime() - lastLoginDate.getTime()
          const diffMins = Math.floor(diffMs / 60000)
          const diffHours = Math.floor(diffMs / 3600000)
          const diffDays = Math.floor(diffMs / 86400000)

          if (diffMins < 1) {
            lastLoginDisplay = 'Active now'
          } else if (diffMins < 60) {
            lastLoginDisplay = `${diffMins}m ago`
          } else if (diffHours < 24) {
            lastLoginDisplay = `${diffHours}h ago`
          } else if (diffDays < 7) {
            lastLoginDisplay = `${diffDays}d ago`
          } else {
            lastLoginDisplay = lastLoginDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
          }
        }
      } catch (err) {
        console.warn('Could not fetch participant last_login:', err)
      }
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Chat created successfully',
        data: {
          id: chat.id.toString(),
          name: chat.chat_name,
          avatar: chat.avatar,
          lastMessage: message.content,
          unread: 0,
          lastLogin: lastLoginDisplay,
          messages: [{
            id: message.id.toString(),
            sender: message.sender,
            senderAvatar: message.sender_avatar,
            content: message.content,
            timestamp: new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            isOwn: message.is_own,
          }],
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error creating chat:', error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
