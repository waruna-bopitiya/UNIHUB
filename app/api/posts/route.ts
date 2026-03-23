import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET() {
  await ensureTablesExist()
  const posts = await sql`
    SELECT * FROM posts ORDER BY created_at DESC LIMIT 50
  `
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  await ensureTablesExist()

  const body = await req.json()
  const {
    author_name,
    author_avatar,
    author_role,
    content,
    category,
    stream_video_id,
    stream_title,
  } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const [post] = await sql`
    INSERT INTO posts
      (author_name, author_avatar, author_role, content, category, stream_video_id, stream_title)
    VALUES
      (
        ${author_name   || 'Student'},
        ${author_avatar || 'S'},
        ${author_role   || 'Student'},
        ${content.trim()},
        ${category      || 'General'},
        ${stream_video_id ?? null},
        ${stream_title    ?? null}
      )
    RETURNING *
  `
  return NextResponse.json(post, { status: 201 })
}
