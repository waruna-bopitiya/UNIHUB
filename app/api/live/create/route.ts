import { NextRequest, NextResponse } from 'next/server'
import { getYouTubeClient } from '@/lib/youtube'

export async function POST(req: NextRequest) {
  try {
    const { title, description, scheduledStartTime } = await req.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Stream title is required' }, { status: 400 })
    }

    const youtube = getYouTubeClient()

    // ── Step 1: Create the Live Broadcast (the YouTube "event") ──────────────
    const broadcastRes = await youtube.liveBroadcasts.insert({
      part: ['snippet', 'status', 'contentDetails'],
      requestBody: {
        snippet: {
          title: title.trim(),
          description: description?.trim() ?? '',
          scheduledStartTime: scheduledStartTime ?? new Date().toISOString(),
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
        contentDetails: {
          enableAutoStart: true,
          enableAutoStop: true,
          enableDvr: true,
          recordFromStart: true,
          startWithSlate: false,
          latencyPreference: 'normal',
          monitorStream: { enableMonitorStream: false },
        },
      },
    })

    const videoId = broadcastRes.data.id!

    // ── Step 2: Create the Live Stream (the RTMP ingest endpoint) ────────────
    const streamRes = await youtube.liveStreams.insert({
      part: ['snippet', 'cdn', 'status'],
      requestBody: {
        snippet: { title: `${title.trim()} – Ingest` },
        cdn: {
          frameRate: 'variable',
          ingestionType: 'rtmp',
          resolution: 'variable',
        },
      },
    })

    const streamId = streamRes.data.id!
    const ingestion = streamRes.data.cdn?.ingestionInfo
    const streamKey = ingestion?.streamName ?? ''
    const streamUrl = ingestion?.ingestionAddress ?? 'rtmp://a.rtmp.youtube.com/live2'

    // ── Step 3: Bind broadcast ↔ stream ──────────────────────────────────────
    await youtube.liveBroadcasts.bind({
      id: videoId,
      part: ['id', 'contentDetails'],
      streamId,
    })

    return NextResponse.json({ videoId, streamKey, streamUrl })
  } catch (error: any) {
    const message =
      error?.response?.data?.error?.message ??
      error?.message ??
      'Failed to create live stream'
    console.error('[YouTube API Error]', error?.response?.data ?? error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
