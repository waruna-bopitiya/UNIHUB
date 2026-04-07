import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id: commentId } = await params
    const { userId } = await req.json()
    const id = Number(commentId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify comment exists and belongs to user
    const [comment] = await sql`
      SELECT id, user_id FROM post_comments WHERE id = ${id}
    `

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete the comment
    await sql`DELETE FROM post_comments WHERE id = ${id}`

    console.log(`🗑️ Comment ${id} deleted by user ${userId}`)

    return NextResponse.json({ message: 'Comment deleted' })
  } catch (error: any) {
    console.error('[DELETE /api/posts/comments/[id]] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
