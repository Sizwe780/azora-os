/**
 * Innovation Theater — Reaction Route
 *
 * Records audience emoji reactions during a live session.
 * Reactions are aggregated per emoji type and returned as a summary.
 */

import { NextRequest, NextResponse } from "next/server"

const ALLOWED_REACTIONS = ["👍", "❤️", "🔥", "👏", "😂", "🤯", "🚀", "💡"]

interface ReactionSummary {
  emoji: string
  count: number
}

// sessionId -> { emoji -> count }
const sessionReactions = new Map<string, Map<string, number>>()

function getReactions(sessionId: string): Map<string, number> {
  if (!sessionReactions.has(sessionId)) {
    sessionReactions.set(sessionId, new Map())
  }
  return sessionReactions.get(sessionId)!
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId") ?? "default"

  const reactions = getReactions(sessionId)
  const summary: ReactionSummary[] = ALLOWED_REACTIONS.map((emoji) => ({
    emoji,
    count: reactions.get(emoji) ?? 0,
  }))

  return NextResponse.json({ reactions: summary, sessionId })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId = "default", emoji } = body

    if (!emoji) {
      return NextResponse.json({ error: "emoji is required" }, { status: 400 })
    }

    if (!ALLOWED_REACTIONS.includes(emoji)) {
      return NextResponse.json(
        { error: `emoji must be one of: ${ALLOWED_REACTIONS.join(" ")}` },
        { status: 400 },
      )
    }

    const reactions = getReactions(sessionId)
    reactions.set(emoji, (reactions.get(emoji) ?? 0) + 1)

    const summary: ReactionSummary[] = ALLOWED_REACTIONS.map((e) => ({
      emoji: e,
      count: reactions.get(e) ?? 0,
    }))

    return NextResponse.json({ success: true, reactions: summary, sessionId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record reaction" }, { status: 500 })
  }
}
