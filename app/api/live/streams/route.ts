import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET() {
  try {
    await ensureTablesExist()
    const streams = await sql`SELECT * FROM live_streams ORDER BY created_at DESC`
    console.log(`📡 Fetched ${streams.length} live streams`)
    return NextResponse.json(streams)
  } catch (error: any) {
    console.error('[GET /api/live/streams] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch live streams' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist()

    const {
      creator_id,
      title,
      description,
      year,
      semester,
      module_name,
      video_id,
      stream_key,
      stream_url,
      thumbnail_url,
      scheduled_start_time,
    } = await req.json()

    if (!creator_id) {
      return NextResponse.json({ error: 'creator_id is required' }, { status: 400 })
    }

    if (!video_id || !stream_key) {
      return NextResponse.json({ error: 'video_id and stream_key are required' }, { status: 400 })
    }

    const [stream] = await sql`
      INSERT INTO live_streams
        (creator_id, title, description, year, semester, module_name, video_id, stream_key, stream_url, thumbnail_url, scheduled_start_time)
      VALUES
        (
          ${creator_id},
          ${title},
          ${description         ?? null},
          ${year                ?? null},
          ${semester            ?? null},
          ${module_name         ?? null},
          ${video_id},
          ${stream_key},
          ${stream_url},
          ${thumbnail_url       ?? null},
          ${scheduled_start_time ?? null}
        )
      RETURNING *
    `
    console.log(`🎥 Live stream created by ${creator_id}: ${stream.id}`)
    return NextResponse.json(stream, { status: 201 })
  } catch (error: any) {
    console.error('[POST /api/live/streams] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create live stream' },
      { status: 500 }
    )
  }
}
