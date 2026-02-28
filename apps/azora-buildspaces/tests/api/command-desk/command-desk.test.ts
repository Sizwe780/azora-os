/** @jest-environment node */

/**
 * Tests for the Command Desk slash command router (A5.1)
 * including the new commands: compliance, deploy-check, logs, search
 */

describe('Command Desk API (/api/command-desk)', () => {
  let POST: (req: any) => Promise<any>
  let GET: (req: any) => Promise<any>

  beforeAll(async () => {
    const mod = await import('@/app/api/command-desk/route')
    POST = mod.POST as any
    GET = mod.GET as any
  })

  function makePostRequest(body: Record<string, unknown>) {
    return {
      json: async () => body,
    } as any
  }

  function makeGetRequest(prefix?: string) {
    const url = prefix
      ? `http://localhost/api/command-desk?prefix=${prefix}`
      : 'http://localhost/api/command-desk'
    return {
      nextUrl: new URL(url),
    } as any
  }

  describe('POST — Slash Command Execution', () => {
    it('should return error for empty command', async () => {
      const res = await POST(makePostRequest({ command: '/' }))
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.output).toContain('Empty command')
    })

    it('should return error for unknown command', async () => {
      const res = await POST(makePostRequest({ command: '/unknown' }))
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.output).toContain('Unknown command')
    })

    it('should handle /help command', async () => {
      const res = await POST(makePostRequest({ command: '/help' }))
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.output).toContain('/help')
      expect(data.output).toContain('/verify')
    })

    it('should handle /status command', async () => {
      const res = await POST(makePostRequest({ command: '/status' }))
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.output).toContain('BuildSpaces')
    })

    it('should handle /verify command', async () => {
      const res = await POST(
        makePostRequest({ command: '/verify test', userId: 'u1', sessionId: 's1' }),
      )
      const data = await res.json()
      expect(data.constitutionalCheck).toBeDefined()
      expect(typeof data.constitutionalCheck.score).toBe('number')
    })

    it('should handle /audit command', async () => {
      const res = await POST(
        makePostRequest({ command: '/audit', userId: 'u1', sessionId: 's1' }),
      )
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.output).toContain('Compliance Report')
    })

    it('should handle /agent command with valid agent', async () => {
      const res = await POST(
        makePostRequest({ command: '/agent ELARA hello', userId: 'u1', sessionId: 's1' }),
      )
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.output).toContain('ELARA')
    })

    it('should handle /agent command with invalid agent', async () => {
      const res = await POST(
        makePostRequest({ command: '/agent UNKNOWN', userId: 'u1', sessionId: 's1' }),
      )
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.output).toContain('Unknown agent')
    })

    it('should handle /compliance command', async () => {
      const res = await POST(
        makePostRequest({ command: '/compliance', userId: 'u1', sessionId: 's1' }),
      )
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.output).toContain('Compliance Dashboard')
    })

    it('should handle /deploy-check command', async () => {
      const res = await POST(
        makePostRequest({ command: '/deploy-check my-app', userId: 'u1', sessionId: 's1' }),
      )
      const data = await res.json()
      expect(data.constitutionalCheck).toBeDefined()
      expect(data.output).toContain('my-app')
    })

    it('should handle /logs command', async () => {
      const res = await POST(
        makePostRequest({ command: '/logs 5', userId: 'u1', sessionId: 's1' }),
      )
      const data = await res.json()
      expect(data.success).toBe(true)
    })

    it('should handle /search command with no query', async () => {
      const res = await POST(
        makePostRequest({ command: '/search', userId: 'u1', sessionId: 's1' }),
      )
      const data = await res.json()
      expect(data.success).toBe(true)
    })

    it('should handle /clear command', async () => {
      const res = await POST(makePostRequest({ command: '/clear' }))
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.output).toBe('')
    })

    it('should return 400 when command field is missing', async () => {
      const res = await POST(makePostRequest({}))
      expect(res.status).toBe(400)
    })
  })

  describe('GET — Command Listing & Autocomplete', () => {
    it('should list all available commands', async () => {
      const res = await GET(makeGetRequest())
      const data = await res.json()
      expect(data.commands.length).toBeGreaterThanOrEqual(10)
      expect(data.totalCommands).toBeGreaterThanOrEqual(10)
    })

    it('should support autocomplete with prefix filter (A5.7)', async () => {
      const res = await GET(makeGetRequest('de'))
      const data = await res.json()
      expect(data.commands.every((c: any) => c.name.startsWith('de'))).toBe(true)
    })

    it('should return empty array for non-matching prefix', async () => {
      const res = await GET(makeGetRequest('zzz'))
      const data = await res.json()
      expect(data.commands).toHaveLength(0)
    })
  })
})
