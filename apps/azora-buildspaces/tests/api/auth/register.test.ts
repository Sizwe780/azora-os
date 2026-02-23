/** @jest-environment node */

import { POST } from '@/app/api/auth/register/route'

// Mock the prisma client used by the route
jest.mock('@/lib/database/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    }
  }
}))

import { prisma } from '@/lib/database/client'

describe('POST /api/auth/register', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns 400 when email or password missing', async () => {
    const req = new Request('http://localhost/api/auth/register', { method: 'POST', body: JSON.stringify({ email: '', password: '' }) })
    const res = await POST(req)
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.error).toBeDefined()
  })

  test('returns 400 when user already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' })

    const req = new Request('http://localhost/api/auth/register', { method: 'POST', body: JSON.stringify({ email: 'a@b.com', password: 'secret' }) })
    const res = await POST(req)
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.error).toBe('User already exists')
  })

  test('creates a new user when data is valid', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    prisma.user.create = jest.fn().mockResolvedValue({ id: 'newid', email: 'a@b.com' })

    const req = new Request('http://localhost/api/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Test', email: 'a@b.com', password: 'secret' }) })
    const res = await POST(req)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.user.id).toBe('newid')
  })
})
