/** @jest-environment node */

// Mock prisma and PRISMA_AVAILABLE so authorize uses DB path
jest.mock('@/lib/database/client', () => ({
  prisma: { user: { findUnique: jest.fn() } },
  PRISMA_AVAILABLE: true
}))

import { authOptions } from '@/lib/auth/config'
// Helper to hash password (same method used in register route)
import crypto from 'crypto'

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

import { prisma } from '@/lib/database/client'

describe('Credentials Provider authorize', () => {
  const credentialProvider = (authOptions.providers || []).find((p: any) => p.id === 'credentials')

  beforeAll(() => {
    expect(credentialProvider).toBeDefined()
    // console.log for debugging if needed
    console.log('CREDENTIAL_PROVIDER_KEYS', Object.keys(credentialProvider))
    console.log('HAS_AUTHORIZE', typeof (credentialProvider as any).authorize)
    console.log('AUTHORIZE_FN', (credentialProvider as any).authorize.toString().slice(0,400))
    console.log('OPTIONS_AUTHORIZE_FN', (credentialProvider as any).options?.authorize?.toString?.().slice(0,400))
  })

  test('master credentials succeed with defaults', async () => {
    const res = await credentialProvider.options.authorize({ email: 'admin@azora.world', password: 'Azora2026!' })
    // console.log('MASTER RES', res)
    expect(res).toBeDefined()
    expect((res as any).email).toBe('admin@azora.world')
  })

  test('db credentials succeed when password matches', async () => {
    const password = 'S3cretpass!'
    const stored = hashPassword(password)
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', name: 'User', email: 'u@example.com', password: stored })

    const res = await credentialProvider.options.authorize({ email: 'u@example.com', password })
    // console.log('DB RES', res)
    expect(res).toBeDefined()
    expect((res as any).email).toBe('u@example.com')
  })

  test('db credentials fail on wrong password', async () => {
    const password = 'S3cretpass!'
    const stored = hashPassword(password)
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', name: 'User', email: 'u@example.com', password: stored })

    const res = await credentialProvider.options.authorize({ email: 'u@example.com', password: 'wrong' })
    expect(res).toBeNull()
  })
})
