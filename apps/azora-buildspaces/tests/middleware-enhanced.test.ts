/** @jest-environment node */

/**
 * Tests for the enhanced rate limiting features (C1):
 *  - Per-path rate limit tiers
 *  - IP allowlist bypass
 *  - Retry-After header
 */

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, opts?: any) => {
      const headers = new Map<string, string>()
      return {
        status: opts?.status || 200,
        body,
        headers: {
          set: (k: string, v: string) => headers.set(k, v),
          get: (k: string) => headers.get(k),
        },
      }
    },
    next: () => {
      const headers = new Map<string, string>()
      return {
        status: undefined,
        headers: {
          set: (k: string, v: string) => headers.set(k, v),
          get: (k: string) => headers.get(k),
        },
      }
    },
  },
}))

;(global as any).Request = (global as any).Request || class {}
;(global as any).Response = (global as any).Response || class {}

jest.mock('../lib/security-headers', () => ({ securityHeaders: [] }))

describe('Rate limiter enhancements (C1)', () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT
    delete process.env.RATE_LIMIT_WINDOW_MS
    delete process.env.RATE_LIMIT_ALLOWLIST
    delete process.env.REDIS_URL
    jest.restoreAllMocks()
    jest.resetModules()
  })

  it('should set Retry-After header on 429 responses', async () => {
    process.env.RATE_LIMIT = '2'
    process.env.RATE_LIMIT_WINDOW_MS = '60000'

    const { middleware, _test_resetRateLimiterState } = require('../middleware')
    _test_resetRateLimiterState()

    const req: any = {
      headers: {
        get: (k: string) => (k === 'x-forwarded-for' ? '10.0.0.1' : undefined),
      },
      nextUrl: { pathname: '/api/test' },
    }

    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      await middleware(req)
    }

    const res = await middleware(req)
    expect(res.status).toBe(429)
    // Retry-After should be set (60000ms / 1000 = 60)
    expect(res.headers.get('Retry-After')).toBe('60')
  })

  it('should bypass rate limiting for allowlisted IPs', async () => {
    process.env.RATE_LIMIT = '1'
    process.env.RATE_LIMIT_ALLOWLIST = '10.0.0.99, 10.0.0.100'

    jest.resetModules()
    const { middleware, _test_resetRateLimiterState } = require('../middleware')
    _test_resetRateLimiterState()

    const req: any = {
      headers: {
        get: (k: string) => (k === 'x-forwarded-for' ? '10.0.0.99' : undefined),
      },
      nextUrl: { pathname: '/api/test' },
    }

    // Should pass even with limit=1 after multiple calls
    for (let i = 0; i < 5; i++) {
      const res = await middleware(req)
      expect(res.status).toBeUndefined() // NextResponse.next()
    }
  })

  it('should apply stricter limits for auth paths', async () => {
    // Auth path limit is 20, default is 100
    process.env.RATE_LIMIT = '100'

    jest.resetModules()
    const { middleware, _test_resetRateLimiterState } = require('../middleware')
    _test_resetRateLimiterState()

    const req: any = {
      headers: {
        get: (k: string) => (k === 'x-forwarded-for' ? '10.0.0.50' : undefined),
      },
      nextUrl: { pathname: '/api/auth/login' },
    }

    // Make 21 requests — the 21st should be rate limited
    let lastStatus: number | undefined
    for (let i = 0; i < 25; i++) {
      const res = await middleware(req)
      lastStatus = res.status
    }

    expect(lastStatus).toBe(429)
  })
})
