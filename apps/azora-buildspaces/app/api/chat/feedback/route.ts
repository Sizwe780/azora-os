/**
 * Command Desk — Chat Feedback Endpoint
 *
 * Stores thumbs-up/down ratings and optional free-text comments for AI responses.
 * Uses file-system persistence (data/chat/feedback.json) with an in-memory fallback.
 */

import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

interface FeedbackEntry {
  id: string
  sessionId: string
  messageId: string
  rating: "positive" | "negative"
  comment?: string
  model?: string
  createdAt: string
}

const DATA_PATH = path.join(process.cwd(), "data", "chat", "feedback.json")

async function loadFeedback(): Promise<FeedbackEntry[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function saveFeedback(entries: FeedbackEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(entries, null, 2))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  const entries = await loadFeedback()
  const filtered = sessionId ? entries.filter((e) => e.sessionId === sessionId) : entries

  return NextResponse.json({ feedback: filtered, total: filtered.length })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, messageId, rating, comment, model } = body

    if (!sessionId || !messageId || !rating) {
      return NextResponse.json(
        { error: "sessionId, messageId, and rating are required" },
        { status: 400 },
      )
    }

    if (rating !== "positive" && rating !== "negative") {
      return NextResponse.json(
        { error: "rating must be 'positive' or 'negative'" },
        { status: 400 },
      )
    }

    const entries = await loadFeedback()

    // Upsert: one entry per message
    const existingIndex = entries.findIndex(
      (e) => e.sessionId === sessionId && e.messageId === messageId,
    )

    const entry: FeedbackEntry = {
      id: existingIndex >= 0 ? entries[existingIndex].id : `fb_${Date.now()}`,
      sessionId,
      messageId,
      rating,
      comment: comment ?? undefined,
      model: model ?? undefined,
      createdAt:
        existingIndex >= 0 ? entries[existingIndex].createdAt : new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }

    await saveFeedback(entries)

    return NextResponse.json({ success: true, feedback: entry })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save feedback" }, { status: 500 })
  }
}
