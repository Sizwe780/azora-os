/** @jest-environment node */

// Patch next/server
const ns = require('next/server')
ns.NextResponse = { json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 }) }

const { GET: statsGet } = require('@/app/api/collectibles/stats/route')
const { GET: leaderboardGet, POST: leaderboardPost } = require('@/app/api/collectibles/leaderboard/route')
const { GET: profileGet, POST: profilePost } = require('@/app/api/collectibles/profile/route')

function makeUrl(params = '') {
  return { url: `http://localhost/api/collectibles${params}` }
}

function makeReq(body: unknown, params = '') {
  return { json: async () => body, url: `http://localhost/api/collectibles${params}` }
}

// ── Stats ────────────────────────────────────────────────────────────────────

describe('GET /api/collectibles/stats', () => {
  it('returns stats object with required fields', async () => {
    const res = await statsGet()
    const { body } = res as any
    expect(body.stats).toBeDefined()
    expect(typeof body.stats.totalCards).toBe('number')
    expect(body.stats.tierBreakdown).toBeDefined()
    expect(Array.isArray(body.stats.topAchievements)).toBe(true)
  })
})

// ── Leaderboard ──────────────────────────────────────────────────────────────

describe('Collectibles Leaderboard', () => {
  it('GET returns ranked entries', async () => {
    const res = await leaderboardGet(makeUrl('?limit=3&page=1') as any)
    const { body } = res as any
    expect(Array.isArray(body.leaderboard)).toBe(true)
    expect(body.leaderboard.length).toBeGreaterThan(0)
    // First entry should have rank 1
    expect(body.leaderboard[0].rank).toBe(1)
  })

  it('POST updates leaderboard for a user', async () => {
    const res = await leaderboardPost(
      makeReq({ userId: 'test-user-lb', displayName: 'Tester', powerDelta: 500 }) as any,
    )
    const { body } = res as any
    expect(body.success).toBe(true)
  })

  it('POST returns 400 when powerDelta is missing', async () => {
    const res = await leaderboardPost(makeReq({ userId: 'u1' }) as any)
    const { status } = res as any
    expect(status).toBe(400)
  })
})

// ── Profile ──────────────────────────────────────────────────────────────────

describe('Collectibles Profile', () => {
  it('GET returns a profile for an unknown user (empty achievements)', async () => {
    const res = await profileGet(makeUrl('?userId=brand-new-user') as any)
    const { body } = res as any
    expect(body.userId).toBe('brand-new-user')
    expect(body.totalPower).toBe(0)
    expect(body.cardsOwned).toBe(0)
  })

  it('POST unlocks an achievement for a user', async () => {
    const res = await profilePost(
      makeReq({ userId: 'profile-user-1', achievementId: 'first-commit', displayName: 'Dev1' }) as any,
    )
    const { body } = res as any
    expect(body.success).toBe(true)
    expect(body.profile.unlockedIds).toContain('first-commit')
  })

  it('POST returns 400 for unknown achievement', async () => {
    const res = await profilePost(
      makeReq({ userId: 'profile-user-2', achievementId: 'does-not-exist' }) as any,
    )
    const { status } = res as any
    expect(status).toBe(400)
  })

  it('GET reflects achievement unlocked via POST', async () => {
    await profilePost(
      makeReq({ userId: 'profile-user-3', achievementId: 'ai-whisperer' }) as any,
    )
    const res = await profileGet(makeUrl('?userId=profile-user-3') as any)
    const { body } = res as any
    expect(body.totalPower).toBe(2000)
    expect(body.cardsOwned).toBe(1)
  })
})
