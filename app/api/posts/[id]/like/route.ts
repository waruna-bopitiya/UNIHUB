import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureTablesExist()

  const { id: idStr } = await params
  const { action } = await req.json() // 'like' | 'unlike'
  const id = Number(idStr)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
  }

  if (action === 'unlike') {
    await sql`
      UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ${id}
    `
  } else {
    await sql`
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = ${id}
    `
  }

  const [post] = await sql`SELECT likes_count FROM posts WHERE id = ${id}`
  return NextResponse.json({ likes_count: post?.likes_count ?? 0 })
}
