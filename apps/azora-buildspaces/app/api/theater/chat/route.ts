/**
 * Innovation Theater — Chat Route
 *
 * Public audience chat during a live session.
 * In-memory store per session (replace with Redis pub/sub for production scale).
 */

import { NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  id: string
  sessionId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
  pinned?: boolean
}

// sessionId -> messages[]
const sessionChats = new Map<string, ChatMessage[]>()

const MAX_MESSAGES_PER_SESSION = 200

function getMessages(sessionId: string): ChatMessage[] {
  if (!sessionChats.has(sessionId)) {
    sessionChats.set(sessionId, [])
  }
  return sessionChats.get(sessionId)!
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId") ?? "default"
  const since = searchParams.get("since")

  let messages = getMessages(sessionId)

  if (since) {
    messages = messages.filter((m) => m.createdAt > since)
  }

  return NextResponse.json({ messages, total: messages.length, sessionId })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId = "default", authorId, authorName, content, pin } = body

    if (!authorId || !content?.trim()) {
      return NextResponse.json({ error: "authorId and content are required" }, { status: 400 })
    }

    const messages = getMessages(sessionId)

    // Handle pin toggle for existing message
    if (pin !== undefined) {
      const msg = messages.find((m) => m.id === body.messageId)
      if (msg) {
        msg.pinned = Boolean(pin)
        return NextResponse.json({ success: true, message: msg })
      }
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sessionId,
      authorId,
      authorName: authorName ?? "Anonymous",
      content: content.trim(),
      createdAt: new Date().toISOString(),
      pinned: false,
    }

    messages.push(newMessage)

    // Trim to max window
    if (messages.length > MAX_MESSAGES_PER_SESSION) {
      messages.splice(0, messages.length - MAX_MESSAGES_PER_SESSION)
    }

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to post message" }, { status: 500 })
  }
}
