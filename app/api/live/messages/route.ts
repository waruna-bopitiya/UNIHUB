import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

function formatTimestamp(value: string | Date) {
  const date = new Date(value)
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export async function GET(request: NextRequest) {
  await ensureTablesExist()

  const { searchParams } = new URL(request.url)
  const streamId = searchParams.get('streamId')
  const limit = Number(searchParams.get('limit') ?? '50')

  if (!streamId) {
    return NextResponse.json([])
  }

  const messages = await sql`
    SELECT id, stream_id, author_name, message, created_at
    FROM live_chat_messages
    WHERE stream_id = ${Number(streamId)}
    ORDER BY created_at ASC
    LIMIT ${Math.min(Math.max(limit, 1), 100)}
  `

  return NextResponse.json(
    messages.map((message: any) => ({
      id: String(message.id),
      author: message.author_name,
      message: message.message,
      timestamp: formatTimestamp(message.created_at),
    }))
  )
}

export async function POST(req: NextRequest) {
  await ensureTablesExist()

  const body = await req.json()
  const streamId = Number(body.streamId)
  const authorName = typeof body.authorName === 'string' && body.authorName.trim() ? body.authorName.trim() : 'Anonymous'
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!streamId || !message) {
    return NextResponse.json({ error: 'streamId and message are required' }, { status: 400 })
  }

  const [savedMessage] = await sql`
    INSERT INTO live_chat_messages (stream_id, author_name, message)
    VALUES (${streamId}, ${authorName}, ${message})
    RETURNING id, stream_id, author_name, message, created_at
  `

  return NextResponse.json(
    {
      id: String(savedMessage.id),
      author: savedMessage.author_name,
      message: savedMessage.message,
      timestamp: formatTimestamp(savedMessage.created_at),
    },
    { status: 201 }
  )
}