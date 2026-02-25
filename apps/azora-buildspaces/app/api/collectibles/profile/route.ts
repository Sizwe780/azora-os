/**
 * Collectible Showcase — Profile Route
 *
 * Returns a user's collectible profile: earned cards, power total, rank, and recent unlocks.
 * Requires a userId query param; falls back to "anonymous" for unauthenticated previews.
 */

import { NextRequest, NextResponse } from "next/server"

const ACHIEVEMENT_DEFINITIONS = [
  { id: "first-commit", name: "First Commit", power: 50, tier: "common" },
  { id: "code-reviewer", name: "Code Reviewer", power: 200, tier: "uncommon" },
  { id: "refactor-master", name: "Refactor Master", power: 500, tier: "rare" },
  { id: "ai-whisperer", name: "AI Whisperer", power: 2000, tier: "epic" },
  { id: "polymath", name: "Polymath", power: 5000, tier: "legendary" },
  { id: "constitutional", name: "Constitutional Developer", power: 10000, tier: "mythical" },
]

// userId -> unlocked achievement IDs
const userProfiles = new Map<string, { unlockedIds: string[]; displayName: string }>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") ?? "anonymous"

  const profile = userProfiles.get(userId) ?? { unlockedIds: [], displayName: userId }
  const unlocked = profile.unlockedIds
    .map((id) => ACHIEVEMENT_DEFINITIONS.find((d) => d.id === id))
    .filter(Boolean)

  const totalPower = unlocked.reduce((sum, a) => sum + (a?.power ?? 0), 0)

  const tierCounts = unlocked.reduce(
    (acc: Record<string, number>, a) => {
      const tier = a?.tier ?? "common"
      acc[tier] = (acc[tier] ?? 0) + 1
      return acc
    },
    {},
  )

  return NextResponse.json({
    userId,
    displayName: profile.displayName,
    totalPower,
    cardsOwned: unlocked.length,
    achievements: unlocked,
    tierBreakdown: tierCounts,
    joinedAt: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, achievementId, displayName } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const profile = userProfiles.get(userId) ?? { unlockedIds: [], displayName: userId }

    if (displayName) profile.displayName = displayName

    if (achievementId) {
      const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === achievementId)
      if (!def) {
        return NextResponse.json({ error: "Unknown achievement" }, { status: 400 })
      }
      if (!profile.unlockedIds.includes(achievementId)) {
        profile.unlockedIds.push(achievementId)
      }
    }

    userProfiles.set(userId, profile)

    return NextResponse.json({ success: true, profile: { userId, ...profile } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 })
  }
}
