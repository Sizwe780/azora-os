import { describe, it, expect, jest, beforeAll } from '@jest/globals'
import { POST as deployPOST } from '@/app/api/deploy/route'
import { POST as exportPOST } from '@/app/api/export/route'
import { constitutionalAI } from '@/lib/services/constitutional-ai'
import { getServerSession } from 'next-auth'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

jest.mock('@/lib/services/workspace-manager', () => ({
  WorkspaceManager: {
    getInstance: jest.fn().mockImplementation(() => ({
      executeCommand: jest.fn().mockResolvedValue({ success: true, deploymentId: 'd123' })
    }))
  }
}))

// Minimal mock NextRequest
function makeReq(body = {}) {
  return {
    json: async () => body,
    nextUrl: { searchParams: new URLSearchParams() }
  } as any
}

describe('Deploy & Export API routes', () => {
  beforeAll(() => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' }
    })
  })

  it('should allow deploy when constitutional verification allows', async () => {
    jest.restoreAllMocks()
    jest.spyOn(constitutionalAI, 'verifyAction').mockResolvedValue({ allowed: true, violations: [], explanation: 'ok', score: 100, auditId: 'a1' } as any)
    jest.spyOn(constitutionalAI, 'logAudit').mockResolvedValue({} as any)

    const req = makeReq({ projectName: 'p', environment: 'staging', buildType: 'production', userId: 'u1' })

    const res = await deployPOST(req)
    const json = await (res as any).json()

    expect(json.success).toBe(true)
  })

  it('should block export when verification disallows', async () => {
    jest.restoreAllMocks()
    jest.spyOn(constitutionalAI, 'verifyAction').mockResolvedValue({ allowed: false, violations: [], explanation: 'blocked', score: 0, auditId: 'a2' } as any)
    jest.spyOn(constitutionalAI, 'logAudit').mockResolvedValue({} as any)

    const req = makeReq({ payload: { secret: 's' }, userId: 'u2' })
    const res = await exportPOST(req)
    const json = await (res as any).json()

    expect((res as any).status).toBe(403)
    expect(json.error).toBe('Constitutional Violation')
  })
})
