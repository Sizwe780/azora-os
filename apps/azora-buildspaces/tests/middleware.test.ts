/** @jest-environment node */
// Mock Next server runtime utilities and Redis client to avoid environment-specific dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, opts?: any) => ({ status: opts?.status || 200, body }),
    next: () => ({ status: undefined }),
  },
}))


// Provide minimal Request/Response shims for Next's import side-effects in Node
;(global as any).Request = (global as any).Request || class {}
;(global as any).Response = (global as any).Response || class {}

jest.mock('../lib/security-headers', () => ({ securityHeaders: [] }))



describe('Rate limiter middleware', () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT_BACKEND
    delete process.env.REDIS_URL
    jest.restoreAllMocks()
  })

  it('falls back to memory when redis not available', async () => {
    // Minimal fake request object implementing headers.get
    const req: any = {
      headers: {
        get: (k: string) => (k.toLowerCase() === 'x-forwarded-for' ? '1.2.3.4' : undefined),
      },
      ip: undefined,
    }

    // First request should pass
    const { middleware } = require('../middleware')

    const res1 = await middleware(req)
    expect(res1.status).toBeUndefined() // NextResponse.next() has undefined status

    // Exceed the rate by calling multiple times
    for (let i = 0; i < 200; i++) {
      // Just call to increase the in-memory counter
      await middleware(req)
    }

    const res = await middleware(req)
    // Expect 429 response when limit exceeded
    expect(res.status).toBe(429)
  }, 30000)

  it('uses redis-backed limiter when REDIS_URL is provided', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379'

    // Set RATE_LIMIT to a small number to trigger quickly
    process.env.RATE_LIMIT = '5'

    // Reset state and inject a mock Redis client directly
    jest.resetModules()
    const { _test_setRedisClient, _test_resetRateLimiterState, middleware } = require('../middleware')
    _test_resetRateLimiterState()

    const incrMock = jest.fn().mockResolvedValue(6)
    const pexpireMock = jest.fn().mockResolvedValue(1)
    const mockClient = { incr: incrMock, pexpire: pexpireMock }
    _test_setRedisClient(mockClient)

    const req: any = {
      headers: {
        get: (k: string) => (k.toLowerCase() === 'x-forwarded-for' ? '9.9.9.9' : undefined),
      },
      ip: undefined,
    }

    const res = await middleware(req)
    expect(incrMock).toHaveBeenCalled()
    expect(res.status).toBe(429)

  })
})