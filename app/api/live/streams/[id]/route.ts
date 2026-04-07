import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id: streamId } = await params
    const id = Number(streamId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid stream id' }, { status: 400 })
    }

    const [stream] = await sql`SELECT * FROM live_streams WHERE id = ${id}`

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    return NextResponse.json(stream)
  } catch (error: any) {
    console.error('[GET /api/live/streams/[id]] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch stream' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id: streamId } = await params
    const id = Number(streamId)
    const { creator_id, title, description, year, semester, module_name, scheduled_start_time } = await req.json()

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid stream id' }, { status: 400 })
    }

    if (!creator_id) {
      return NextResponse.json({ error: 'creator_id is required' }, { status: 400 })
    }

    // Verify stream exists
    const [existingStream] = await sql`SELECT creator_id FROM live_streams WHERE id = ${id}`

    if (!existingStream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Verify ownership - only creator can edit
    if (existingStream.creator_id !== creator_id) {
      return NextResponse.json(
        { error: 'You can only edit your own streams' },
        { status: 403 }
      )
    }

    // Update stream
    const [updatedStream] = await sql`
      UPDATE live_streams
      SET
        title = ${title ?? null},
        description = ${description ?? null},
        year = ${year ?? null},
        semester = ${semester ?? null},
        module_name = ${module_name ?? null},
        scheduled_start_time = ${scheduled_start_time ?? null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    console.log(`✏️ Stream ${id} updated by ${creator_id}`)
    return NextResponse.json(updatedStream)
  } catch (error: any) {
    console.error('[PUT /api/live/streams/[id]] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update stream' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist()

    const { id: streamId } = await params
    const { creator_id } = await req.json()
    const id = Number(streamId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid stream id' }, { status: 400 })
    }

    if (!creator_id) {
      return NextResponse.json({ error: 'creator_id is required' }, { status: 400 })
    }

    // Verify stream exists
    const [stream] = await sql`SELECT creator_id FROM live_streams WHERE id = ${id}`

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Verify ownership - only creator can delete
    if (stream.creator_id !== creator_id) {
      return NextResponse.json(
        { error: 'You can only delete your own streams' },
        { status: 403 }
      )
    }

    // Delete stream
    await sql`DELETE FROM live_streams WHERE id = ${id}`

    console.log(`🗑️ Stream ${id} deleted by ${creator_id}`)
    return NextResponse.json({ message: 'Stream deleted successfully' })
  } catch (error: any) {
    console.error('[DELETE /api/live/streams/[id]] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete stream' },
      { status: 500 }
    )
  }
}
