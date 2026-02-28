import { NextRequest, NextResponse } from 'next/server'

/**
 * Collaboration — Remote Cursors API (VS Live Share parity)
 * GET/POST /api/collaboration/cursors
 *
 * Tracks cursor positions of all collaborators in a file.
 * Supports selections, scroll position, and typing indicators.
 *
 * Industry parity: VS Live Share, Google Docs cursors, Figma cursors
 */

interface CursorState {
  userId: string
  displayName: string
  color: string
  file: string
  cursor: { line: number; column: number }
  selection?: { startLine: number; startColumn: number; endLine: number; endColumn: number }
  scroll?: { topLine: number; bottomLine: number }
  isTyping: boolean
  lastUpdate: string
}

// In-memory cursor store (fileId → Map<userId, cursor>)
const cursorStore = new Map<string, Map<string, CursorState>>()

export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get('fileId')

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
  }

  const fileCursors = cursorStore.get(fileId) || new Map()

  // Clean up stale cursors (> 30 seconds old)
  const now = Date.now()
  for (const [uid, c] of fileCursors.entries()) {
    if (now - new Date(c.lastUpdate).getTime() > 30_000) {
      fileCursors.delete(uid)
    }
  }

  return NextResponse.json({
    fileId,
    cursors: Array.from(fileCursors.values()),
    count: fileCursors.size,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { fileId, userId, displayName, color, cursor, selection, scroll, isTyping } = await req.json()

    if (!fileId || !userId) {
      return NextResponse.json({ error: 'fileId and userId are required' }, { status: 400 })
    }

    const fileCursors = cursorStore.get(fileId) || new Map()
    cursorStore.set(fileId, fileCursors)

    const state: CursorState = {
      userId,
      displayName: displayName || userId,
      color: color || '#4ECDC4',
      file: fileId,
      cursor: cursor || { line: 1, column: 1 },
      selection,
      scroll,
      isTyping: isTyping || false,
      lastUpdate: new Date().toISOString(),
    }

    fileCursors.set(userId, state)

    return NextResponse.json({
      success: true,
      cursor: state,
      collaborators: fileCursors.size,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
