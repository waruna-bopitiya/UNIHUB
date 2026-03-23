import { NextRequest, NextResponse } from 'next/server'
import { getYouTubeClient } from '@/lib/youtube'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { videoId } = await req.json()

  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
  }

  try {
    const youtube = getYouTubeClient()
    await youtube.liveBroadcasts.transition({
      id: videoId,
      broadcastStatus: 'complete',
      part: ['id', 'status'],
    })

    await sql`UPDATE live_streams SET status = 'ended' WHERE video_id = ${videoId}`

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ?? error?.message ?? 'Failed to end stream'
    console.error('[End stream error]', error?.response?.data ?? error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
