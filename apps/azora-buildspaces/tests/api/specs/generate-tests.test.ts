/** @jest-environment node */

/**
 * Tests for the Spec Chamber Test Generation endpoint (A2.2)
 */

describe('Spec Test Generation (/api/specs/generate-tests)', () => {
  let POST: (req: any) => Promise<any>

  beforeAll(async () => {
    const mod = await import('@/app/api/specs/generate-tests/route')
    POST = mod.POST as any
  })

  function makeRequest(body: Record<string, unknown>) {
    return { json: async () => body } as any
  }

  it('should return 400 when spec is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('should return 400 when spec has no name', async () => {
    const res = await POST(makeRequest({ spec: { type: 'component' } }))
    expect(res.status).toBe(400)
  })

  it('should generate tests from a spec with requirements', async () => {
    const res = await POST(
      makeRequest({
        spec: {
          name: 'UserService',
          version: '1.0.0',
          requirements: [
            {
              id: 'REQ-1',
              description: 'User registration',
              acceptanceCriteria: ['Should validate email', 'Should hash password'],
            },
          ],
        },
      }),
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.tests).toContain('UserService')
    expect(data.tests).toContain('REQ-1')
    expect(data.tests).toContain('Should validate email')
    expect(data.framework).toBe('jest')
    expect(data.testCount).toBeGreaterThan(0)
  })

  it('should generate tests from a spec with endpoints', async () => {
    const res = await POST(
      makeRequest({
        spec: {
          name: 'API',
          endpoints: [
            { method: 'GET', path: '/api/users' },
            { method: 'POST', path: '/api/users' },
          ],
        },
      }),
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.tests).toContain('GET /api/users')
    expect(data.tests).toContain('POST /api/users')
    expect(data.tests).toContain('should reject invalid payload')
  })

  it('should generate tests from a spec with models', async () => {
    const res = await POST(
      makeRequest({
        spec: {
          name: 'DataModels',
          models: [
            {
              name: 'User',
              fields: [
                { name: 'email', type: 'string', required: true },
                { name: 'age', type: 'number', required: false },
              ],
            },
          ],
        },
      }),
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.tests).toContain('User')
    expect(data.tests).toContain('email')
  })
})
