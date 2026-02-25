/**
 * Innovation Theater — Viewers Route
 *
 * Tracks real-time viewer presence for a live session.
 * Uses an in-memory map keyed by session ID (swap for Redis/DB as needed).
 */

import { NextRequest, NextResponse } from "next/server"

interface Viewer {
  id: string
  name: string
  avatar?: string
  joinedAt: string
}

// sessionId -> Set of viewers
const sessionViewers = new Map<string, Map<string, Viewer>>()

function getSessionViewers(sessionId: string): Map<string, Viewer> {
  if (!sessionViewers.has(sessionId)) {
    sessionViewers.set(sessionId, new Map())
  }
  return sessionViewers.get(sessionId)!
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId") ?? "default"

  const viewers = Array.from(getSessionViewers(sessionId).values())

  return NextResponse.json({ viewers, count: viewers.length, sessionId })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId = "default", viewerId, name, avatar, action = "join" } = body

    if (!viewerId) {
      return NextResponse.json({ error: "viewerId is required" }, { status: 400 })
    }

    const viewers = getSessionViewers(sessionId)

    if (action === "leave") {
      viewers.delete(viewerId)
    } else {
      viewers.set(viewerId, {
        id: viewerId,
        name: name ?? "Anonymous",
        avatar,
        joinedAt: viewers.get(viewerId)?.joinedAt ?? new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      count: viewers.size,
      action,
      sessionId,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update viewers" }, { status: 500 })
  }
}
