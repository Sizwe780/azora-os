/**
 * Theater Stream API — Go live / stop stream
 */
import { NextRequest, NextResponse } from 'next/server'

let streamState = {
  isLive: false,
  startedAt: null as string | null,
  viewerCount: 0,
  peakViewers: 0,
  totalReactions: 0,
}

export async function GET() {
  return NextResponse.json(streamState)
}

export async function POST(request: NextRequest) {
  const { action } = await request.json()

  if (action === 'start') {
    streamState = {
      isLive: true,
      startedAt: new Date().toISOString(),
      viewerCount: 1,
      peakViewers: 1,
      totalReactions: 0,
    }
  } else if (action === 'stop') {
    streamState = { ...streamState, isLive: false }
  }

  return NextResponse.json(streamState)
}
