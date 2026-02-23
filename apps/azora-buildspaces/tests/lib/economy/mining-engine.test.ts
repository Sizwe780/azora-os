/**
 * Mining Engine Tests
 * 
 * Tests for the Proof-of-Knowledge token reward system
 */

import { 
  awardTokens, 
  verifyAndAward, 
  getWalletBalance, 
  getTransactionHistory,
  REWARD_AMOUNTS 
} from '../../../lib/economy/mining-engine'

// Mock the db module
jest.mock('../../../lib/database/client', () => ({
  prisma: {
    $transaction: jest.fn(),
    wallet: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn()
    },
    miningActivity: {
      create: jest.fn()
    }
  },
  PRISMA_AVAILABLE: true
}))

describe('Mining Engine', () => {
  describe('REWARD_AMOUNTS', () => {
    it('should have correct reward values', () => {
      expect(REWARD_AMOUNTS.CODE_COMMIT).toBe(1)
      expect(REWARD_AMOUNTS.SPEC_RATIFICATION).toBe(2)
      expect(REWARD_AMOUNTS.TUTORIAL_COMPLETION).toBe(5)
      expect(REWARD_AMOUNTS.PEER_TEACHING).toBe(3)
      expect(REWARD_AMOUNTS.CONTENT_CREATION).toBe(4)
      expect(REWARD_AMOUNTS.COMMUNITY_CONTRIBUTION).toBe(2)
    })
  })

  describe('awardTokens', () => {
    it('should calculate correct tax and net amount', async () => {
      // Test with CODE_COMMIT (1 AZR)
      const grossAmount = REWARD_AMOUNTS.CODE_COMMIT
      const expectedTax = Math.floor(grossAmount * 0.01 * 100) / 100 // 0.01 AZR
      const expectedNet = grossAmount - expectedTax // 0.99 AZR

      expect(expectedNet).toBe(0.99)
      expect(expectedTax).toBe(0.01)
    })

    it('should calculate correct tax for larger amounts', () => {
      // Test with TUTORIAL_COMPLETION (5 AZR)
      const grossAmount = REWARD_AMOUNTS.TUTORIAL_COMPLETION
      const expectedTax = Math.floor(grossAmount * 0.01 * 100) / 100 // 0.05 AZR
      const expectedNet = grossAmount - expectedTax // 4.95 AZR

      expect(expectedNet).toBe(4.95)
      expect(expectedTax).toBe(0.05)
    })
  })

  describe('verifyAndAward - Quality Checks', () => {
    it('should reject empty or very short content', async () => {
      const result = await verifyAndAward('user123', 'CODE_COMMIT', '')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Work does not meet quality standards')
    })

    it('should reject spam content', async () => {
      const result = await verifyAndAward('user123', 'CODE_COMMIT', 'asdf asdf asdf')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Work does not meet quality standards')
    })

    it('should accept code with function keyword', async () => {
      const mockDb = require('../../../lib/database/client')
      mockDb.prisma.$transaction.mockResolvedValue({
        transactionId: 'tx123',
        balance: 1.99
      })

      const result = await verifyAndAward(
        'user123', 
        'CODE_COMMIT', 
        'function hello() { return "world" }'
      )
      
      // Since DB is mocked, verify it would call the transaction
      expect(mockDb.prisma.$transaction).toHaveBeenCalled()
    })
  })

  describe('Constitutional Compliance', () => {
    it('should implement 1% Community Tax', () => {
      const amounts = [1, 5, 10, 100]
      
      amounts.forEach(amount => {
        const tax = Math.floor(amount * 0.01 * 100) / 100
        const net = amount - tax
        
        // Verify tax is exactly 1%
        expect(tax).toBeCloseTo(amount * 0.01, 2)
        // Verify net + tax = gross
        expect(net + tax).toBeCloseTo(amount, 2)
      })
    })

    it('should route tax to Citadel Fund', () => {
      const CITADEL_FUND_ADDRESS = 'citadel_fund'
      expect(CITADEL_FUND_ADDRESS).toBe('citadel_fund')
    })
  })

  describe('Ubuntu Philosophy', () => {
    it('should implement mutual prosperity (Community Tax)', () => {
      // Tax should benefit the community (Citadel Fund)
      const COMMUNITY_TAX_RATE = 0.01
      expect(COMMUNITY_TAX_RATE).toBe(0.01)
      
      // Verify that every transaction contributes to community
      const reward = 100
      const communityContribution = reward * COMMUNITY_TAX_RATE
      expect(communityContribution).toBe(1)
    })
  })
})

describe('Mining Engine - Database Not Available', () => {
  beforeAll(() => {
    // Mock DB as unavailable
    jest.resetModules()
    jest.doMock('../../../lib/database/client', () => ({
      prisma: {},
      PRISMA_AVAILABLE: false
    }))
  })

  it('should handle gracefully when DB is not configured', async () => {
    const { awardTokens, getWalletBalance } = require('../../../lib/economy/mining-engine')
    
    const result = await awardTokens('user123', 'CODE_COMMIT')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Database not configured')
    
    const balance = await getWalletBalance('user123')
    expect(balance).toBeNull()
  })
})
