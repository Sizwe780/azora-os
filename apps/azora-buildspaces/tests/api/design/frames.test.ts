/**
 * Tests for /api/design/frames route
 */

describe('API: /api/design/frames', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    // Clear any injected test DB stub
    delete globalThis.__TEST_DB__
  })

  test('POST returns 501 when DB is not configured', async () => {
    globalThis.__TEST_DB__ = { PRISMA_AVAILABLE: false }

    const route = require('../../../app/api/design/frames/route.test.js')

    const req = {
      json: async () => ({ id: 'f1', name: 'Frame One' })
    }

    const resp = await route.POST(req)

    expect(resp.status).toBe(501)
    const body = await resp.json()
    expect(body.error).toMatch(/Database not configured/)
  })

  test('POST persists frame when DB available', async () => {
    const mockCreate = jest.fn(async (args) => ({ id: 'db-1', ...args.data }))
    globalThis.__TEST_DB__ = { PRISMA_AVAILABLE: true, prisma: { figmaFrame: { create: mockCreate } } }

    const route = require('../../../app/api/design/frames/route.test.js')

    const payload = { id: 'fig-1', name: 'Imported Frame', width: 320, height: 568 }
    const req = { json: async () => payload }

    const resp = await route.POST(req)
    expect(resp.status).toBe(200)
    const body = await resp.json()
    expect(body.frame).toBeDefined()
    expect(body.frame.name).toBe(payload.name)
    expect(mockCreate).toHaveBeenCalled()
  })

  test('POST uses importedBy from body when provided', async () => {
    const mockCreate = jest.fn(async (args) => ({ id: 'db-2', ...args.data }))
    globalThis.__TEST_DB__ = { PRISMA_AVAILABLE: true, prisma: { figmaFrame: { create: mockCreate } } }

    const route = require('../../../app/api/design/frames/route.test.js')

    const payload = { id: 'fig-2', name: 'Imported Frame', importedBy: 'user-123' }
    const req = { json: async () => payload }

    const resp = await route.POST(req)
    expect(resp.status).toBe(200)
    const body = await resp.json()
    expect(body.frame).toBeDefined()
    expect(body.frame.importedBy).toBe('user-123')
    expect(mockCreate).toHaveBeenCalled()
  })

  test('POST uses server session user id when available', async () => {
    const mockCreate = jest.fn(async (args) => ({ id: 'db-3', ...args.data }))
    globalThis.__TEST_DB__ = { PRISMA_AVAILABLE: true, prisma: { figmaFrame: { create: mockCreate } } }
    // inject a fake server session
    globalThis.__TEST_SESSION__ = { user: { id: 'session-user-1' } }

    const route = require('../../../app/api/design/frames/route.test.js')

    const payload = { id: 'fig-3', name: 'Imported Frame' }
    const req = { json: async () => payload }

    const resp = await route.POST(req)
    expect(resp.status).toBe(200)
    const body = await resp.json()
    expect(body.frame).toBeDefined()
    expect(body.frame.importedBy).toBe('session-user-1')
    expect(mockCreate).toHaveBeenCalled()
  })

  test('GET returns 501 when DB is not configured', async () => {
    globalThis.__TEST_DB__ = { PRISMA_AVAILABLE: false }

    const route = require('../../../app/api/design/frames/route.test.js')
    const resp = await route.GET()
    expect(resp.status).toBe(501)
    const body = await resp.json()
    expect(body.error).toMatch(/Database not configured/)
  })

  test('GET lists frames when DB available', async () => {
    const mockFind = jest.fn(async () => [{ id: 'db-1', name: 'Saved' }])
    globalThis.__TEST_DB__ = { PRISMA_AVAILABLE: true, prisma: { figmaFrame: { findMany: mockFind } } }

    const route = require('../../../app/api/design/frames/route.test.js')
    const resp = await route.GET()
    expect(resp.status).toBe(200)
    const body = await resp.json()
    expect(Array.isArray(body.frames)).toBe(true)
    expect(body.frames.length).toBeGreaterThanOrEqual(1)
    expect(mockFind).toHaveBeenCalled()
  })

  test('POST returns 500 when create throws', async () => {
    const mockCreate = jest.fn(async () => { throw new Error('db-fail') })
    globalThis.__TEST_DB__ = { PRISMA_AVAILABLE: true, prisma: { figmaFrame: { create: mockCreate } } }

    const route = require('../../../app/api/design/frames/route.test.js')
    const req = { json: async () => ({ id: 'fig-x', name: 'X' }) }

    const resp = await route.POST(req)
    expect(resp.status).toBe(500)
    const body = await resp.json()
    expect(body.error).toMatch(/db-fail/)
  })
})
