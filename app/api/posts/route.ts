import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist()

    // Get current user ID from query params
    const userId = req.nextUrl.searchParams.get('userId')
    const myPostsOnly = req.nextUrl.searchParams.get('myPosts') === 'true'

    if (myPostsOnly && userId) {
      // Get only user's own posts (including private ones)
      const posts = await sql`
        SELECT 
          p.id,
          p.creator_id,
          p.author_name,
          p.author_avatar,
          p.author_role,
          p.content,
          p.category,
          p.stream_video_id,
          p.stream_title,
          p.is_private,
          p.likes_count,
          p.comments_count,
          p.created_at,
          p.updated_at,
          u.badges,
          COALESCE(COUNT(DISTINCT pl.id), 0)::INTEGER as likes_count,
          COALESCE(SUM(CASE WHEN pl.user_id = ${userId || null} THEN 1 ELSE 0 END), 0)::INTEGER as user_liked
        FROM posts p
        LEFT JOIN post_likes pl ON p.id = pl.post_id
        LEFT JOIN users u ON p.creator_id = u.id
        WHERE p.creator_id = ${userId}
        GROUP BY p.id, u.badges
        ORDER BY p.created_at DESC
        LIMIT 100
      `
      
      console.log('📊 User posts fetched. Count:', posts.length)
      return NextResponse.json(posts)
    }

    // Get all public posts
    const posts = await sql`
      SELECT 
        p.id,
        p.creator_id,
        p.author_name,
        p.author_avatar,
        p.author_role,
        p.content,
        p.category,
        p.stream_video_id,
        p.stream_title,
        p.is_private,
        p.likes_count,
        p.comments_count,
        p.created_at,
        u.badges,
        COALESCE(COUNT(DISTINCT pl.id), 0)::INTEGER as likes_count,
        COALESCE(SUM(CASE WHEN pl.user_id = ${userId || null} THEN 1 ELSE 0 END), 0)::INTEGER as user_liked
      FROM posts p
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN users u ON p.creator_id = u.id
      WHERE p.is_private = FALSE
      GROUP BY p.id, u.badges
      ORDER BY p.created_at DESC
      LIMIT 50
    `
    
    console.log('📊 Posts fetched. Count:', posts.length, '| UserId:', userId)
    return NextResponse.json(posts)
  } catch (error: any) {
    console.error('[GET /api/posts] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist()

    const body = await req.json()
    let {
      creator_id,
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

    // Ensure author_avatar is valid - take first character if longer
    const finalAvatar = (author_avatar && typeof author_avatar === 'string')
      ? author_avatar.substring(0, 1)
      : 'S'

    const [post] = await sql`
      INSERT INTO posts
        (creator_id, author_name, author_avatar, author_role, content, category, stream_video_id, stream_title, likes_count, is_private)
      VALUES
        (
          ${creator_id ?? null},
          ${author_name?.trim() || 'Student'},
          ${finalAvatar},
          ${author_role?.trim() || 'Student'},
          ${content.trim()},
          ${category?.trim() || 'General'},
          ${stream_video_id ?? null},
          ${stream_title?.trim() ?? null},
          0,
          false
        )
      RETURNING *, 0 as user_liked
    `
    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error('[POST /api/posts] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}
