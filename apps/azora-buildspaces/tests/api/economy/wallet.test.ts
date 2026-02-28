/** @jest-environment node */

/**
 * Tests for Wallet API (Economy System)
 * GET /api/economy/wallet — Returns user wallet data
 *
 * The wallet route imports mining-engine which depends on lib/database/client (pg).
 * We mock the mining engine to avoid the pg dependency.
 */

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth/config', () => ({
  authOptions: {},
}))

// Mock the mining engine to avoid pg dependency
jest.mock('@/lib/economy/mining-engine', () => ({
  miningEngine: {
    getBalance: jest.fn().mockResolvedValue(1500),
    getTruthScore: jest.fn().mockResolvedValue(85),
    getTransactionHistory: jest.fn().mockResolvedValue([
      { id: 'tx-1', amount: 100, type: 'REWARD', description: 'Learning bonus', rewardType: 'LEARNING', timestamp: Date.now(), status: 'COMPLETED' },
    ]),
    getStatistics: jest.fn().mockResolvedValue({
      totalSupply: 1_000_000,
      totalCirculation: 500_000,
    }),
  },
}))

describe('GET /api/economy/wallet', () => {
  let getServerSession: jest.Mock

  beforeEach(() => {
    jest.resetModules()
    getServerSession = require('next-auth').getServerSession as jest.Mock
  })

  function makeRequest() {
    const url = new URL('http://localhost/api/economy/wallet')
    return { url: url.toString(), nextUrl: url } as any
  }

  it('should return 401 for unauthenticated requests', async () => {
    getServerSession.mockResolvedValue(null)
    const mod = require('@/app/api/economy/wallet/route')
    const res = await mod.GET(makeRequest())
    const data = await res.json()
    expect(res.status).toBe(401)
    expect(data.error).toContain('Unauthorized')
  })

  it('should return 401 when user has no id', async () => {
    getServerSession.mockResolvedValue({ user: { email: 'no-id@example.com' } })
    const mod = require('@/app/api/economy/wallet/route')
    const res = await mod.GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('should return wallet data for authenticated user', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'wallet-user', email: 'wallet@example.com' } })
    const mod = require('@/app/api/economy/wallet/route')
    const res = await mod.GET(makeRequest())
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.wallet).toBeDefined()
    expect(data.wallet.userId).toBe('wallet-user')
    expect(typeof data.wallet.balance).toBe('number')
    expect(typeof data.wallet.truthScore).toBe('number')
    expect(typeof data.wallet.rank).toBe('number')
    expect(['VERIFIED', 'ACTIVE', 'NEW']).toContain(data.wallet.status)
  })

  it('should include transaction history', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'tx-user', email: 'tx@example.com' } })
    const mod = require('@/app/api/economy/wallet/route')
    const res = await mod.GET(makeRequest())
    const data = await res.json()

    expect(Array.isArray(data.transactions)).toBe(true)
    expect(data.transactions.length).toBeGreaterThan(0)
    expect(data.transactions[0]).toHaveProperty('id')
    expect(data.transactions[0]).toHaveProperty('amount')
  })

  it('should include global statistics', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'stats-user', email: 'stats@example.com' } })
    const mod = require('@/app/api/economy/wallet/route')
    const res = await mod.GET(makeRequest())
    const data = await res.json()

    expect(data.statistics).toBeDefined()
    expect(typeof data.statistics.totalSupply).toBe('number')
    expect(typeof data.statistics.totalCirculation).toBe('number')
    expect(data.statistics.yourPercentage).toBeDefined()
  })

  it('should calculate wallet status based on truth score', async () => {
    getServerSession.mockResolvedValue({ user: { id: 'status-user', email: 'status@example.com' } })
    const mod = require('@/app/api/economy/wallet/route')
    const res = await mod.GET(makeRequest())
    const data = await res.json()

    // truth score is 85, so status should be VERIFIED (>= 70)
    expect(data.wallet.status).toBe('VERIFIED')
  })
})
