import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id: idStr } = await params
    const { action, userId } = await req.json()
    const id = Number(idStr)

    console.log(`📌 Like action: ${action} | Post: ${id} | User: ${userId}`)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify post exists
    const [post] = await sql`SELECT id FROM posts WHERE id = ${id}`
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (action === 'unlike') {
      // Delete the like record
      console.log(`🔄 Deleting like for user ${userId} on post ${id}`)
      await sql`
        DELETE FROM post_likes 
        WHERE post_id = ${id} AND user_id = ${userId}
      `
    } else if (action === 'like') {
      try {
        // Insert like record
        console.log(`✅ Adding like for user ${userId} on post ${id}`)
        await sql`
          INSERT INTO post_likes (post_id, user_id)
          VALUES (${id}, ${userId})
          ON CONFLICT (post_id, user_id) DO NOTHING
        `
      } catch (e: any) {
        console.log('User already liked this post:', e.message)
      }
    }

    // Get real like count and user like status from database
    const result = await sql`
      SELECT 
        COALESCE(COUNT(DISTINCT pl.id), 0)::INTEGER as likes_count,
        COALESCE(SUM(CASE WHEN pl.user_id = ${userId} THEN 1 ELSE 0 END), 0)::INTEGER as user_liked
      FROM posts p
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      WHERE p.id = ${id}
    `
    
    const data = result[0]
    const finalCount = Math.max(0, data?.likes_count || 0)
    const userCurrentlyLiked = Boolean(data?.user_liked)

    console.log(`📊 Final state - Likes: ${finalCount} | User liked: ${userCurrentlyLiked}`)

    return NextResponse.json({ 
      likes_count: finalCount,
      user_liked: userCurrentlyLiked ? 1 : 0
    })
  } catch (error: any) {
    console.error('[POST /api/posts/[id]/like] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update like' },
      { status: 500 }
    )
  }
}
