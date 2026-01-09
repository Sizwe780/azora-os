/**
 * Mining Engine - Proof-of-Knowledge (PoK)
 * 
 * Awards AZR tokens for valuable contributions to the Azora ecosystem.
 * Implements Ubuntu Philosophy: "I am because we are" - Mutual Prosperity
 * 
 * Constitutional Compliance:
 * - Article III, Section 3.1: Community Tax (1% to Citadel Fund)
 * - Truth Economics: All transactions are transparent and immutable
 */

import { prisma, PRISMA_AVAILABLE } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

// Token reward amounts for different actions
export const REWARD_AMOUNTS = {
  CODE_COMMIT: 1,           // Verified quality code commit
  SPEC_RATIFICATION: 2,     // Spec approved by Nia
  TUTORIAL_COMPLETION: 5,   // Completed learning module
  PEER_TEACHING: 3,         // Helped another developer
  CONTENT_CREATION: 4,      // Created educational content
  COMMUNITY_CONTRIBUTION: 2 // Other valuable contributions
} as const

export type RewardAction = keyof typeof REWARD_AMOUNTS

// Community Tax rate (1% goes to Citadel Fund)
const COMMUNITY_TAX_RATE = 0.01
const CITADEL_FUND_ADDRESS = 'citadel_fund'

interface AwardResult {
  success: boolean
  transactionId?: string
  amount?: number
  netAmount?: number
  taxAmount?: number
  error?: string
}

/**
 * Award tokens to a user for a verified action
 * 
 * @param userId - User ID to award tokens to
 * @param action - Type of action performed
 * @param value - Optional custom value (defaults to standard reward amount)
 * @param metadata - Additional context about the action
 * @returns Result with transaction details
 */
export async function awardTokens(
  userId: string,
  action: RewardAction,
  value?: number,
  metadata?: Record<string, any>
): Promise<AwardResult> {
  if (!PRISMA_AVAILABLE) {
    console.error('[MINING] Cannot award tokens - Database not configured')
    return {
      success: false,
      error: 'Database not configured'
    }
  }

  try {
    // Calculate reward amount
    const grossAmount = value ?? REWARD_AMOUNTS[action]
    const taxAmount = Math.floor(grossAmount * COMMUNITY_TAX_RATE * 100) / 100
    const netAmount = grossAmount - taxAmount

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create user's AZR wallet
      let wallet = await tx.wallet.findFirst({
        where: {
          userId,
          currency: 'AZR'
        }
      })

      if (!wallet) {
        // Create wallet with unique address
        wallet = await tx.wallet.create({
          data: {
            userId,
            currency: 'AZR',
            balance: new Decimal(0),
            address: `azr_${userId}_${Date.now()}`
          }
        })
      }

      // 2. Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: new Decimal(netAmount)
          }
        }
      })

      // 3. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'MINING_REWARD',
          amount: new Decimal(netAmount),
          currency: 'AZR',
          status: 'COMPLETED',
          description: `Proof-of-Knowledge: ${action}`,
          metadata: {
            action,
            grossAmount,
            taxAmount,
            netAmount,
            ...metadata
          }
        }
      })

      // 4. Record mining activity
      await tx.miningActivity.create({
        data: {
          userId,
          activityType: mapActionToMiningType(action),
          tokensEarned: new Decimal(netAmount),
          status: 'REWARDED',
          metadata: {
            action,
            grossAmount,
            taxAmount,
            ...metadata
          },
          completedAt: new Date()
        }
      })

      // 5. Apply Community Tax to Citadel Fund
      if (taxAmount > 0) {
        let citadelWallet = await tx.wallet.findFirst({
          where: {
            address: CITADEL_FUND_ADDRESS
          }
        })

        if (!citadelWallet) {
          // Create Citadel Fund wallet
          citadelWallet = await tx.wallet.create({
            data: {
              userId: 'system', // System wallet
              currency: 'AZR',
              balance: new Decimal(0),
              address: CITADEL_FUND_ADDRESS
            }
          })
        }

        // Add tax to Citadel Fund
        await tx.wallet.update({
          where: { id: citadelWallet.id },
          data: {
            balance: {
              increment: new Decimal(taxAmount)
            }
          }
        })

        // Record tax transaction
        await tx.transaction.create({
          data: {
            walletId: citadelWallet.id,
            type: 'CREDIT',
            amount: new Decimal(taxAmount),
            currency: 'AZR',
            status: 'COMPLETED',
            description: `Community Tax from ${action}`,
            fromAddress: wallet.address,
            toAddress: CITADEL_FUND_ADDRESS,
            metadata: {
              sourceUserId: userId,
              sourceAction: action,
              taxRate: COMMUNITY_TAX_RATE
            }
          }
        })
      }

      return {
        transactionId: transaction.id,
        balance: updatedWallet.balance
      }
    })

    console.log(`[MINING] Awarded ${netAmount} AZR to user ${userId} for ${action}`)

    return {
      success: true,
      transactionId: result.transactionId,
      amount: grossAmount,
      netAmount,
      taxAmount
    }
  } catch (error) {
    console.error('[MINING] Error awarding tokens:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verify the quality of work before awarding tokens
 * 
 * This is a stub that would integrate with agents like Themba (code quality)
 * or Nia (spec validation) to verify work quality
 */
export async function verifyAndAward(
  userId: string,
  action: RewardAction,
  workContent: string,
  metadata?: Record<string, any>
): Promise<AwardResult> {
  // Quality verification logic
  const isQualityWork = await verifyWorkQuality(action, workContent)

  if (!isQualityWork) {
    console.log(`[MINING] Low quality work rejected for user ${userId}`)
    return {
      success: false,
      error: 'Work does not meet quality standards'
    }
  }

  // Award tokens if quality is verified
  return awardTokens(userId, action, undefined, {
    ...metadata,
    verified: true,
    verifiedAt: new Date().toISOString()
  })
}

/**
 * Verify work quality
 * 
 * Future integration points:
 * - CODE_COMMIT: Verify with Themba (syntax, tests, best practices)
 * - SPEC_RATIFICATION: Verify with Nia (completeness, clarity)
 * - TUTORIAL_COMPLETION: Verify quiz/assessment scores
 */
async function verifyWorkQuality(
  action: RewardAction,
  workContent: string
): Promise<boolean> {
  // Enforce content length limits for performance
  const MAX_CONTENT_LENGTH = 100000 // 100KB
  if (workContent.length > MAX_CONTENT_LENGTH) {
    console.warn('[MINING] Content too large, rejecting:', workContent.length)
    return false
  }

  // Basic quality checks
  if (!workContent || workContent.trim().length < 10) {
    return false
  }

  // Check for spam patterns (loaded from config for maintainability)
  const spamPatterns = getSpamPatterns()
  const lowerContent = workContent.toLowerCase()
  if (spamPatterns.some(pattern => lowerContent.includes(pattern))) {
    return false
  }

  switch (action) {
    case 'CODE_COMMIT':
      // TODO: Integrate with Themba for code quality analysis
      // For now, basic check: must have some code structure
      return workContent.includes('function') || 
             workContent.includes('class') || 
             workContent.includes('const') ||
             workContent.includes('let')

    case 'SPEC_RATIFICATION':
      // TODO: Integrate with Nia for spec validation
      // For now, basic check: must have structure
      return workContent.length > 100

    case 'TUTORIAL_COMPLETION':
      // TODO: Check assessment scores
      return true

    default:
      return true
  }
}

/**
 * Get spam patterns from configuration
 * TODO: Move to external config file or database
 */
function getSpamPatterns(): string[] {
  return [
    'asdf',
    'test test test',
    '111111',
    'qwerty',
    'Lorem ipsum' // Generic placeholder text
  ]
}

/**
 * Map reward action to MiningType enum
 */
function mapActionToMiningType(action: RewardAction): string {
  const mapping: Record<RewardAction, string> = {
    CODE_COMMIT: 'COMMUNITY_CONTRIBUTION',
    SPEC_RATIFICATION: 'COMMUNITY_CONTRIBUTION',
    TUTORIAL_COMPLETION: 'COURSE_COMPLETION',
    PEER_TEACHING: 'PEER_TEACHING',
    CONTENT_CREATION: 'CONTENT_CREATION',
    COMMUNITY_CONTRIBUTION: 'COMMUNITY_CONTRIBUTION'
  }
  return mapping[action]
}

/**
 * Get user's wallet balance
 */
export async function getWalletBalance(userId: string): Promise<number | null> {
  if (!PRISMA_AVAILABLE) {
    return null
  }

  try {
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        currency: 'AZR'
      }
    })

    return wallet ? Number(wallet.balance) : 0
  } catch (error) {
    console.error('[MINING] Error fetching wallet balance:', error)
    return null
  }
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  if (!PRISMA_AVAILABLE) {
    return []
  }

  try {
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        currency: 'AZR'
      }
    })

    if (!wallet) {
      return []
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return transactions.map(t => ({
      id: t.id,
      amount: Number(t.amount),
      description: t.description,
      status: t.status,
      createdAt: t.createdAt,
      metadata: t.metadata
    }))
  } catch (error) {
    console.error('[MINING] Error fetching transaction history:', error)
    return []
  }
}
