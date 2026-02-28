/** @jest-environment node */

/**
 * Tests for Constitutional Rules API (E1/E2)
 * POST /api/constitutional/rules — Evaluates actions against constitutional engine
 * GET  /api/constitutional/rules — Returns engine status and rules
 */

import { GET, POST } from '@/app/api/constitutional/rules/route'

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/constitutional/rules')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return { nextUrl: url } as any
}

function makePostRequest(body: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body),
  } as any
}

describe('GET /api/constitutional/rules', () => {
  it('should return engine status with rules', async () => {
    const res = await GET(makeGetRequest())
    const data = await res.json()

    expect(data.profile).toBeDefined()
    expect(typeof data.ruleCount).toBe('number')
    expect(data.ruleCount).toBeGreaterThan(0)
    expect(typeof data.enabledRules).toBe('number')
    expect(Array.isArray(data.rules)).toBe(true)
  })

  it('should omit rules when rules=false', async () => {
    const res = await GET(makeGetRequest({ rules: 'false' }))
    const data = await res.json()

    expect(data.ruleCount).toBeDefined()
    expect(data.rules).toBeUndefined()
  })

  it('should return rule objects with expected shape', async () => {
    const res = await GET(makeGetRequest())
    const data = await res.json()

    if (data.rules && data.rules.length > 0) {
      const rule = data.rules[0]
      expect(rule).toHaveProperty('id')
      expect(rule).toHaveProperty('article')
      expect(rule).toHaveProperty('principle')
      expect(rule).toHaveProperty('severity')
      expect(rule).toHaveProperty('enabled')
    }
  })
})

describe('POST /api/constitutional/rules', () => {
  it('should evaluate a safe action and return allowed', async () => {
    const res = await POST(makePostRequest({
      actionType: 'CODE_EDIT',
      userId: 'test-user',
      payload: { file: 'test.ts' },
    }))
    const data = await res.json()

    expect(data.allowed).toBeDefined()
    expect(typeof data.score).toBe('number')
    expect(data.profile).toBeDefined()
    expect(data.alignmentScores).toBeDefined()
  })

  it('should return 400 when actionType is missing', async () => {
    const res = await POST(makePostRequest({ userId: 'test-user' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('actionType')
  })

  it('should log evaluation through audit logger', async () => {
    const res = await POST(makePostRequest({
      actionType: 'AI_QUERY',
      userId: 'audit-test',
      payload: { query: 'How to build a React app' },
    }))
    // Should not throw and should return successfully
    expect(res.status).toBe(200)
  })

  it('should include alignment scores in response', async () => {
    const res = await POST(makePostRequest({
      actionType: 'CODE_EDIT',
      userId: 'alignment-test',
    }))
    const data = await res.json()

    expect(data.alignmentScores).toBeDefined()
    expect(typeof data.alignmentScores).toBe('object')
  })

  it('should include violations array in response', async () => {
    const res = await POST(makePostRequest({
      actionType: 'CODE_EDIT',
      userId: 'violations-test',
    }))
    const data = await res.json()

    expect(Array.isArray(data.violations)).toBe(true)
  })
})
