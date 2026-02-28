/** @jest-environment node */

/**
 * Tests for Deployment Pre-flight Validation (Phase 2B)
 * 
 * Tests the deploy endpoint's input validation, environment checks,
 * and constitutional compliance gate.
 */

// Mock next-auth to simulate authenticated user
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth/config', () => ({
  authOptions: {},
}))

describe('Deploy Pre-flight Validation (/api/deploy)', () => {
  let POST: (req: any) => Promise<any>
  let getServerSession: jest.Mock

  beforeEach(async () => {
    jest.resetModules()
    getServerSession = require('next-auth').getServerSession as jest.Mock
  })

  function makeRequest(body: Record<string, unknown>) {
    return {
      json: () => Promise.resolve(body),
      headers: {
        get: () => null,
      },
    } as any
  }

  describe('when user is not authenticated', () => {
    it('should return 401', async () => {
      getServerSession.mockResolvedValue(null)
      const mod = require('@/app/api/deploy/route')
      const res = await mod.POST(makeRequest({ environment: 'staging' }))
      const data = await res.json()
      expect(res.status).toBe(401)
      expect(data.error).toContain('Authentication required')
    })
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
      })
    })

    it('should reject invalid environment with 422', async () => {
      const mod = require('@/app/api/deploy/route')
      const res = await mod.POST(makeRequest({ environment: 'moon-base' }))
      const data = await res.json()
      expect(res.status).toBe(422)
      expect(data.error).toContain('Pre-flight validation failed')
      expect(data.preflight.passed).toBe(false)
    })

    it('should reject invalid build type with 422', async () => {
      const mod = require('@/app/api/deploy/route')
      const res = await mod.POST(makeRequest({ environment: 'staging', buildType: 'invalid' }))
      const data = await res.json()
      expect(res.status).toBe(422)
      expect(data.preflight.checks.some((c: any) => c.name === 'valid_build_type' && !c.passed)).toBe(true)
    })

    it('should require projectName for production deployments', async () => {
      const mod = require('@/app/api/deploy/route')
      const res = await mod.POST(makeRequest({ environment: 'production', buildType: 'production' }))
      const data = await res.json()
      expect(res.status).toBe(422)
      expect(data.preflight.checks.some((c: any) => c.name === 'project_name_required' && !c.passed)).toBe(true)
    })

    it('should pass pre-flight for valid staging deployment', async () => {
      const mod = require('@/app/api/deploy/route')
      const res = await mod.POST(makeRequest({
        environment: 'staging',
        buildType: 'production',
        projectName: 'my-app',
      }))
      const data = await res.json()
      // Pre-flight should always pass for valid staging with valid inputs
      // The constitutional check may or may not allow (depends on action payload)
      if (res.status === 200) {
        expect(data.success).toBe(true)
        expect(data.preflight.passed).toBe(true)
        expect(data.constitutional.score).toBeDefined()
      } else if (res.status === 403) {
        // Constitutional check blocked — but pre-flight still passed
        expect(data.preflight.passed).toBe(true)
        expect(data.error).toBe('Constitutional Violation')
      } else {
        // 422 would mean pre-flight failed — should NOT happen for valid input
        expect(res.status).not.toBe(422)
      }
    })
  })
})
