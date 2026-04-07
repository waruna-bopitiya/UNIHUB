import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id: postId } = await params
    const id = Number(postId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
    }

    // Fetch all comments for the post
    const comments = await sql`
      SELECT 
        id,
        post_id,
        user_id,
        user_name,
        user_avatar,
        content,
        created_at
      FROM post_comments
      WHERE post_id = ${id}
      ORDER BY created_at DESC
    `

    return NextResponse.json(comments)
  } catch (error: any) {
    console.error('[GET /api/posts/[id]/comments] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id: postId } = await params
    const { userId, userName, userAvatar, content } = await req.json()
    const id = Number(postId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
    }

    if (!userId || !userName || !content) {
      return NextResponse.json(
        { error: 'userId, userName, and content are required' },
        { status: 400 }
      )
    }

    if (!content.trim()) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })
    }

    // Verify post exists
    const [post] = await sql`SELECT id FROM posts WHERE id = ${id}`
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Create comment
    const [comment] = await sql`
      INSERT INTO post_comments (post_id, user_id, user_name, user_avatar, content)
      VALUES (${id}, ${userId}, ${userName}, ${userAvatar || 'S'}, ${content.trim()})
      RETURNING *
    `

    console.log(`💬 Comment added by ${userName} on post ${id}`)

    return NextResponse.json(comment, { status: 201 })
  } catch (error: any) {
    console.error('[POST /api/posts/[id]/comments] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create comment' },
      { status: 500 }
    )
  }
}
