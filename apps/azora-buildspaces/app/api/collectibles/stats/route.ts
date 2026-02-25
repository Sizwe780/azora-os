/**
 * Collectible Showcase — Stats Route
 *
 * Returns platform-wide collectible statistics:
 * total cards, minted count, total power distributed, tier breakdown, top achievements.
 */

import { NextResponse } from "next/server"

// Achievement definitions (mirrors achievements route)
const TIER_WEIGHTS: Record<string, number> = {
  common: 1,
  uncommon: 2,
  rare: 4,
  epic: 8,
  legendary: 16,
  mythical: 32,
}

// In-memory aggregate stats (keyed by tier)
// In production these would be DB aggregates
const mockStats = {
  totalCards: 28,
  mintedCards: 0,
  totalPowerDistributed: 0,
  tierBreakdown: {
    common: 8,
    uncommon: 9,
    rare: 7,
    epic: 3,
    legendary: 1,
    mythical: 0,
  },
  topAchievements: [
    { id: "constitutional", name: "Constitutional Developer", power: 10000, unlockCount: 0 },
    { id: "polymath", name: "Polymath", power: 5000, unlockCount: 0 },
    { id: "zen-master", name: "Zen Master", power: 2500, unlockCount: 0 },
    { id: "ai-whisperer", name: "AI Whisperer", power: 2000, unlockCount: 0 },
    { id: "velocity-king", name: "Velocity King", power: 1500, unlockCount: 0 },
  ],
  activeUsers: 0,
  lastUpdated: new Date().toISOString(),
}

export async function GET() {
  return NextResponse.json({ stats: mockStats })
}
