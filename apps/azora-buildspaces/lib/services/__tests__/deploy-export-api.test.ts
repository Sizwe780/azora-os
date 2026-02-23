import { describe, it, expect, jest } from '@jest/globals'
import { POST as deployPOST } from '@/app/api/deploy/route'
import { POST as exportPOST } from '@/app/api/export/route'
import { constitutionalAI } from '../constitutional-ai'

// Minimal mock NextRequest
function makeReq(body = {}) {
  return {
    json: async () => body,
    nextUrl: { searchParams: new URLSearchParams() }
  } as any
}

describe('Deploy & Export API routes', () => {
  it('should allow deploy when constitutional verification allows', async () => {
    jest.restoreAllMocks()
    jest.spyOn(constitutionalAI, 'verifyAction').mockResolvedValue({ allowed: true, violations: [], explanation: 'ok', score: 100, auditId: 'a1' } as any)
    jest.spyOn(constitutionalAI, 'auditLog').mockResolvedValue()

    const req = makeReq({ projectName: 'p', environment: 'staging', buildType: 'production', userId: 'u1' })

    const res = await deployPOST(req)
    const json = await (res as any).json()

    expect(json.success).toBe(true)
  })

  it('should block export when verification disallows', async () => {
    jest.restoreAllMocks()
    jest.spyOn(constitutionalAI, 'verifyAction').mockResolvedValue({ allowed: false, violations: [], explanation: 'blocked', score: 0, auditId: 'a2' } as any)
    jest.spyOn(constitutionalAI, 'auditLog').mockResolvedValue()

    const req = makeReq({ payload: { secret: 's' }, userId: 'u2' })
    const res = await exportPOST(req)
    const json = await (res as any).json()

    expect((res as any).status).toBe(403)
    expect(json.error).toBe('Constitutional Violation')
  })
})
