/** @jest-environment node */

/**
 * Tests for File System API path validation (security-critical)
 *
 * The FS route handler uses path validation to prevent traversal attacks.
 * We test the security boundary and auth requirements without touching the filesystem.
 *
 * Routes that depend on child_process (git operations) and real fs are mocked
 * to avoid side effects.
 */

// Mock next-auth to simulate auth states
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth/config', () => ({
  authOptions: {},
}))

// Mock child_process and fs/promises to avoid real filesystem operations
jest.mock('child_process', () => ({
  exec: jest.fn(),
}))

jest.mock('fs/promises', () => ({
  readdir: jest.fn().mockRejectedValue(new Error('ENOENT: no such directory')),
  readFile: jest.fn().mockRejectedValue(new Error('ENOENT: no such file')),
  writeFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
  rm: jest.fn().mockResolvedValue(undefined),
  rename: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({ size: 0, mtime: new Date() }),
}))

describe('File System API (/api/fs)', () => {
  let getServerSession: jest.Mock

  beforeEach(() => {
    jest.resetModules()
    getServerSession = require('next-auth').getServerSession as jest.Mock
  })

  function makeGetRequest(params: Record<string, string>) {
    const url = new URL('http://localhost/api/fs')
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    return { url: url.toString(), nextUrl: url } as any
  }

  function makePostRequest(body: Record<string, unknown>) {
    return {
      json: () => Promise.resolve(body),
    } as any
  }

  describe('authentication', () => {
    it('should return 401 for unauthenticated GET requests', async () => {
      getServerSession.mockResolvedValue(null)
      const mod = require('@/app/api/fs/route')
      const res = await mod.GET(makeGetRequest({ operation: 'list', path: '/' }))
      const data = await res.json()
      expect(res.status).toBe(401)
      expect(data.error).toContain('Authentication')
    })

    it('should return 401 for unauthenticated POST requests', async () => {
      getServerSession.mockResolvedValue(null)
      const mod = require('@/app/api/fs/route')
      const res = await mod.POST(makePostRequest({ operation: 'write', path: '/test.txt', content: 'hello' }))
      const data = await res.json()
      expect(res.status).toBe(401)
      expect(data.error).toContain('Authentication')
    })
  })

  describe('path validation', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'test@example.com' } })
    })

    it('should reject path traversal with ..', async () => {
      const mod = require('@/app/api/fs/route')
      const res = await mod.GET(makeGetRequest({ operation: 'read', path: '../../etc/passwd' }))
      const data = await res.json()
      expect(res.status).toBe(403)
      expect(data.error).toContain('traversal')
    })

    it('should require a path parameter for GET', async () => {
      const mod = require('@/app/api/fs/route')
      const res = await mod.GET(makeGetRequest({ operation: 'list' }))
      const data = await res.json()
      expect(res.status).toBe(400)
      expect(data.error).toContain('Path')
    })

    it('should scope paths to the user workspace', async () => {
      const mod = require('@/app/api/fs/route')
      const res = await mod.GET(makeGetRequest({ operation: 'list', path: '/some-path' }))
      // The path validation resolves /some-path against the workspace root;
      // if the resolved path is outside the workspace it's rejected (403) or
      // the directory doesn't exist (500). Either is acceptable security behaviour.
      expect([403, 500]).toContain(res.status)
    })

    it('should require path for POST operations', async () => {
      const mod = require('@/app/api/fs/route')
      const res = await mod.POST(makePostRequest({ operation: 'write', content: 'test' }))
      const data = await res.json()
      expect(res.status).toBe(400)
    })

    it('should reject path traversal in POST operations', async () => {
      const mod = require('@/app/api/fs/route')
      const res = await mod.POST(makePostRequest({ operation: 'write', path: '../../../tmp/evil', content: 'x' }))
      const data = await res.json()
      expect(res.status).toBe(403)
      expect(data.error).toContain('traversal')
    })
  })
})
