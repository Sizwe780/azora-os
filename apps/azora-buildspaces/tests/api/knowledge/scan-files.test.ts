/** @jest-environment node */

// Mock next-auth's getServerSession to simulate session states
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))

import { GET } from '@/app/api/knowledge/scan-files/route'
import { getServerSession } from 'next-auth'

describe('GET /api/knowledge/scan-files', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns 401 when no session', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const res = await GET(new Request('http://localhost/api/knowledge/scan-files'))
    const json = await res.json()
    expect(res.status).toBe(401)
    expect(json.error).toBe('Authentication required')
  })
})
