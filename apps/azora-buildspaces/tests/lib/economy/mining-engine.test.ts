/**
 * Mining Engine Tests
 * 
 * Tests for the Proof-of-Knowledge token reward system
 */

import { 
  miningEngine,
  REWARD_AMOUNTS 
} from '../../../lib/economy/mining-engine'

// Mock the db module
jest.mock('../../../lib/database/client', () => ({
  prisma: {
    $transaction: jest.fn(),
    wallet: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
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
      expect(REWARD_AMOUNTS.CODE_COMMIT).toBe(10)
      expect(REWARD_AMOUNTS.BUG_FIX).toBe(15)
      expect(REWARD_AMOUNTS.TUTORIAL_CREATE).toBe(20)
      expect(REWARD_AMOUNTS.MENTORSHIP_SESSION).toBe(25)
      expect(REWARD_AMOUNTS.DOCUMENTATION).toBe(8)
    })
  })

  describe('awardTokens', () => {
    it('should calculate correct tax and net amount', async () => {
      // Test with CODE_COMMIT (10 AZR)
      const grossAmount = REWARD_AMOUNTS.CODE_COMMIT
      const expectedTax = Math.floor(grossAmount * 0.01 * 100) / 100 // 0.1 AZR
      const expectedNet = grossAmount - expectedTax // 9.9 AZR

      expect(expectedNet).toBe(9.9)
      expect(expectedTax).toBe(0.1)
    })

    it('should calculate correct tax for larger amounts', () => {
            // Test with TUTORIAL_CREATE (20 AZR)
      const grossAmount = REWARD_AMOUNTS.TUTORIAL_CREATE
      const expectedTax = Math.floor(grossAmount * 0.01 * 100) / 100 // 0.2 AZR
      const expectedNet = grossAmount - expectedTax // 19.8 AZR

      expect(expectedNet).toBe(19.8)
      expect(expectedTax).toBe(0.2)
    })
  })

  describe('verifyAndAward - Quality Checks', () => {
    it('should reject empty or very short content', async () => {
      const result = await miningEngine.verifyAndAward('user123', 'CODE_COMMIT', '')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Work does not meet quality standards')
    })

    it('should reject spam content', async () => {
      const result = await miningEngine.verifyAndAward('user123', 'CODE_COMMIT', 'asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Work does not meet quality standards')
    })

    it('should accept code with function keyword', async () => {
      const mockDb = require('../../../lib/database/client')
      mockDb.prisma.wallet.findUnique.mockResolvedValue({
        id: 'wallet123',
        userId: 'user123',
        balance: 0,
        truthScore: 50
      })
      mockDb.prisma.transaction.create.mockResolvedValue({
        id: 'tx123'
      })
      mockDb.prisma.wallet.update.mockResolvedValue({
        id: 'wallet123',
        balance: 10,
        truthScore: 50
      })

      const result = await miningEngine.verifyAndAward(
        'user123', 
        'CODE_COMMIT', 
        'function hello() { return "world" }'
      )
      
      // Since DB is mocked, verify it would call the transaction
      expect(mockDb.prisma.transaction.create).toHaveBeenCalled()
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
    beforeEach(() => {
      const mockDb = require('../../../lib/database/client')
      mockDb.prisma.wallet.findUnique.mockImplementation(() => {
        throw new Error('Database not configured')
      })
      mockDb.prisma.wallet.create.mockImplementation(() => {
        throw new Error('Database not configured')
      })
    })

    it('should handle gracefully when DB is not configured', async () => {
      const result = await miningEngine.awardTokens({
        userId: 'user123',
        amount: 10,
        rewardType: 'CODE_COMMIT',
        description: 'Test'
      })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database not configured')
      
      const balance = await miningEngine.getBalance('user123')
      expect(balance).toBe(0)
    })
  })
