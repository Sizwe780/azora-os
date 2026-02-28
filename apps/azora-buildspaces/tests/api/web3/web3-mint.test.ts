/** @jest-environment node */

/**
 * Tests for Web3 Mint API
 */

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth/config', () => ({
  authOptions: {},
}))

describe('Web3 Mint (/api/web3/mint)', () => {
  let getServerSession: jest.Mock

  beforeEach(() => {
    jest.resetModules()
    getServerSession = require('next-auth').getServerSession as jest.Mock
  })

  function makePostRequest(body: Record<string, unknown>) {
    return { json: () => Promise.resolve(body) } as any
  }

  function makeGetRequest() {
    const url = new URL('http://localhost/api/web3/mint')
    return { url: url.toString(), nextUrl: url } as any
  }

  describe('POST /api/web3/mint', () => {
    it('should return 401 for unauthenticated requests', async () => {
      getServerSession.mockResolvedValue(null)
      const mod = require('@/app/api/web3/mint/route')
      const res = await mod.POST(makePostRequest({ cardId: 'card-1' }))
      expect(res.status).toBe(401)
    })

    it('should return 400 for missing cardId', async () => {
      getServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'test@test.com' } })
      const mod = require('@/app/api/web3/mint/route')
      const res = await mod.POST(makePostRequest({}))
      expect(res.status).toBe(400)
    })

    it('should reject invalid wallet address format', async () => {
      getServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'test@test.com' } })
      const mod = require('@/app/api/web3/mint/route')
      const res = await mod.POST(makePostRequest({
        cardId: 'card-1',
        walletAddress: 'not-a-wallet',
      }))
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('wallet')
    })

    it('should reject unsupported chains', async () => {
      getServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'test@test.com' } })
      const mod = require('@/app/api/web3/mint/route')
      const res = await mod.POST(makePostRequest({
        cardId: 'card-1',
        chain: 'bitcoin',
      }))
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('Unsupported chain')
    })

    it('should mint successfully with valid data (bridge offline = pending)', async () => {
      getServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'test@test.com' } })
      const mod = require('@/app/api/web3/mint/route')
      const res = await mod.POST(makePostRequest({
        cardId: 'card-1',
        walletAddress: '0x' + 'a'.repeat(40),
        chain: 'sepolia',
      }))
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.receipt).toBeDefined()
      expect(data.receipt.txHash).toMatch(/^0x/)
      expect(data.receipt.chain).toBe('sepolia')
      expect(data.receipt.explorerUrl).toContain('sepolia.etherscan.io')
      expect(data.receipt.status).toBe('pending') // Bridge is offline in test
    })

    it('should default to sepolia testnet when no chain specified', async () => {
      getServerSession.mockResolvedValue({ user: { id: 'user-2', email: 'test@test.com' } })
      const mod = require('@/app/api/web3/mint/route')
      const res = await mod.POST(makePostRequest({
        cardId: 'card-2',
        walletAddress: '0x' + 'b'.repeat(40),
      }))
      const data = await res.json()
      expect(data.receipt.chain).toBe('sepolia')
    })
  })

  describe('GET /api/web3/mint', () => {
    it('should return 401 for unauthenticated requests', async () => {
      getServerSession.mockResolvedValue(null)
      const mod = require('@/app/api/web3/mint/route')
      const res = await mod.GET(makeGetRequest())
      expect(res.status).toBe(401)
    })

    it('should return mint receipts and supported chains', async () => {
      getServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'test@test.com' } })
      const mod = require('@/app/api/web3/mint/route')
      const res = await mod.GET(makeGetRequest())
      const data = await res.json()
      expect(Array.isArray(data.receipts)).toBe(true)
      expect(Array.isArray(data.supportedChains)).toBe(true)
      expect(data.supportedChains.length).toBeGreaterThanOrEqual(4)
    })
  })
})
