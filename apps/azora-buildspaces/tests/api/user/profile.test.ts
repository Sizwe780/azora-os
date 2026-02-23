/** @jest-environment node */

// Mock next-auth's getServerSession to simulate session states
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/database/client', () => ({ prisma: { user: { findUnique: jest.fn() } } }))

import { GET } from '@/app/api/user/profile/route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/database/client'

describe('GET /api/user/profile', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns 401 when no session', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null)
    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(401)
    expect(json.error).toBe('Unauthorized')
  })

  test('returns master user when session is master-user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'master-user' } })
    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.email).toBe('admin@azora.world')
  })

  test('returns user profile from db', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } })
    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 'user-1', name: 'Alice', email: 'a@b.com', emailVerified: true, createdAt: new Date() })
    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.email).toBe('a@b.com')
    expect(json.verificationStatus.email).toBe(true)
  })
})
