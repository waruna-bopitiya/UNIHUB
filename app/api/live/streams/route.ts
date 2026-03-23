import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { ensureTablesExist } from '@/lib/db-init'

export async function GET() {
  await ensureTablesExist()
  const streams = await sql`SELECT * FROM live_streams ORDER BY created_at DESC`
  return NextResponse.json(streams)
}

export async function POST(req: NextRequest) {
  await ensureTablesExist()

  const {
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

  if (!video_id || !stream_key) {
    return NextResponse.json({ error: 'video_id and stream_key are required' }, { status: 400 })
  }

  const [stream] = await sql`
    INSERT INTO live_streams
      (title, description, year, semester, module_name, video_id, stream_key, stream_url, thumbnail_url, scheduled_start_time)
    VALUES
      (
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
  return NextResponse.json(stream, { status: 201 })
}
