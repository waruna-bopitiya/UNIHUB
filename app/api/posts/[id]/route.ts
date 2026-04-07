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
    const userId = req.nextUrl.searchParams.get('userId')

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
    }

    // Fetch the specific post with like information
    const [post] = await sql`
      SELECT 
        p.id,
        p.author_name,
        p.author_avatar,
        p.author_role,
        p.content,
        p.category,
        p.likes_count,
        p.comments_count,
        p.shares_count,
        p.stream_video_id,
        p.stream_title,
        p.created_at,
        COALESCE(SUM(CASE WHEN pl.user_id = ${userId || null} THEN 1 ELSE 0 END), 0)::INTEGER as user_liked
      FROM posts p
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      WHERE p.id = ${id}
      GROUP BY p.id
    `

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('[GET /api/posts/[id]] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch post' },
      { status: 500 }
    )
  }
}
