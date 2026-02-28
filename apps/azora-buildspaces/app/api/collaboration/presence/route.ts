import { NextRequest, NextResponse } from 'next/server'

/**
 * Collaboration — Presence API (Figma Live parity)
 * GET/POST /api/collaboration/presence
 *
 * Tracks who is online, what they're working on, and their status.
 * Updates are polled or pushed via SSE/WebSocket.
 *
 * Industry parity: Figma multiplayer, VS Live Share, Linear presence
 */

interface UserPresence {
  userId: string
  displayName: string
  avatar?: string
  status: 'online' | 'idle' | 'focus' | 'away'
  currentFile?: string
  currentRoom?: string
  cursor?: { line: number; column: number }
  color: string
  lastSeen: string
}

// In-memory presence store (roomId → Map<userId, presence>)
const presenceStore = new Map<string, Map<string, UserPresence>>()

// Stale presence timeout (2 minutes)
const PRESENCE_TIMEOUT_MS = 120_000

// Colour palette for collaborators
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId') || 'default'
  const room = presenceStore.get(roomId) || new Map()

  // Clean up stale users (last seen > 2 minutes ago)
  const now = Date.now()
  for (const [uid, p] of room.entries()) {
    if (now - new Date(p.lastSeen).getTime() > PRESENCE_TIMEOUT_MS) {
      room.delete(uid)
    }
  }

  return NextResponse.json({
    roomId,
    users: Array.from(room.values()),
    count: room.size,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { roomId = 'default', userId, displayName, status, currentFile, currentRoom, cursor } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const room = presenceStore.get(roomId) || new Map()
    presenceStore.set(roomId, room)

    const existing = room.get(userId)
    const colorIndex = room.size % COLORS.length

    const presence: UserPresence = {
      userId,
      displayName: displayName || existing?.displayName || userId,
      avatar: existing?.avatar,
      status: status || 'online',
      currentFile: currentFile ?? existing?.currentFile,
      currentRoom: currentRoom ?? existing?.currentRoom,
      cursor: cursor ?? existing?.cursor,
      color: existing?.color || COLORS[colorIndex],
      lastSeen: new Date().toISOString(),
    }

    room.set(userId, presence)

    return NextResponse.json({
      success: true,
      presence,
      roomUsers: room.size,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
