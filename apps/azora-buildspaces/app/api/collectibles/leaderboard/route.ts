/**
 * Collectible Showcase — Leaderboard Route
 *
 * Returns a ranked list of users by total collectible power.
 * In-memory demo data; replace with DB aggregation when DATABASE_URL is set.
 */

import { NextRequest, NextResponse } from "next/server"

interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatar?: string
  totalPower: number
  cardsOwned: number
  topAchievement?: string
  badge?: string
}

// In-memory leaderboard store (populated by achievement unlock events)
let leaderboard: Omit<LeaderboardEntry, "rank">[] = [
  { userId: "demo-1", displayName: "Naledi", totalPower: 12500, cardsOwned: 15, topAchievement: "polymath", badge: "🌟" },
  { userId: "demo-2", displayName: "Themba", totalPower: 9800, cardsOwned: 12, topAchievement: "ai-whisperer", badge: "✨" },
  { userId: "demo-3", displayName: "Sankofa", totalPower: 7200, cardsOwned: 10, topAchievement: "orchestrator", badge: "🎭" },
  { userId: "demo-4", displayName: "Amara", totalPower: 4500, cardsOwned: 8, topAchievement: "flow-state", badge: "🌊" },
  { userId: "demo-5", displayName: "Kemi", totalPower: 2100, cardsOwned: 6, topAchievement: "refactor-master", badge: "🔧" },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 100)
  const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1)

  // Sort by totalPower descending
  const sorted = [...leaderboard].sort((a, b) => b.totalPower - a.totalPower)

  const ranked: LeaderboardEntry[] = sorted.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }))

  const start = (page - 1) * limit
  const paginated = ranked.slice(start, start + limit)

  return NextResponse.json({
    leaderboard: paginated,
    total: ranked.length,
    page,
    limit,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, displayName, powerDelta, cardsOwned, topAchievement, badge } = body

    if (!userId || typeof powerDelta !== "number") {
      return NextResponse.json({ error: "userId and powerDelta are required" }, { status: 400 })
    }

    const existing = leaderboard.find((e) => e.userId === userId)
    if (existing) {
      existing.totalPower = Math.max(0, existing.totalPower + powerDelta)
      if (displayName) existing.displayName = displayName
      if (cardsOwned !== undefined) existing.cardsOwned = cardsOwned
      if (topAchievement) existing.topAchievement = topAchievement
      if (badge) existing.badge = badge
    } else {
      leaderboard.push({
        userId,
        displayName: displayName ?? userId,
        totalPower: Math.max(0, powerDelta),
        cardsOwned: cardsOwned ?? 0,
        topAchievement,
        badge,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update leaderboard" }, { status: 500 })
  }
}
