/**
 * Wallet API Endpoint
 * 
 * GET /api/economy/wallet - Get user's wallet information
 * 
 * Constitutional Compliance:
 * - Article III: Economic Constitution - Transparent wallet access
 * - Article II: Rights & Freedoms - User owns their economic data
 * - No Mock Protocol: Real wallet data from database
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { miningEngine } from '@/lib/economy/mining-engine'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get wallet data
    const [balance, truthScore, transactions, statistics] = await Promise.all([
      miningEngine.getBalance(userId),
      miningEngine.getTruthScore(userId),
      miningEngine.getTransactionHistory(userId, 20),
      miningEngine.getStatistics()
    ])

    // Calculate user's rank (simplified)
    const userRank = Math.floor((truthScore / 100) * 10) + 1

    return NextResponse.json({
      success: true,
      wallet: {
        userId,
        balance,
        truthScore,
        rank: userRank,
        status: truthScore >= 70 ? 'VERIFIED' : truthScore >= 40 ? 'ACTIVE' : 'NEW'
      },
      transactions: transactions.map((tx: any) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        rewardType: tx.rewardType,
        timestamp: tx.timestamp,
        status: tx.status
      })),
      statistics: {
        totalSupply: statistics.totalSupply,
        totalCirculation: statistics.totalCirculation,
        yourPercentage: balance > 0 
          ? ((balance / statistics.totalCirculation) * 100).toFixed(4)
          : '0.0000'
      }
    })
  } catch (error) {
    console.error('Wallet API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch wallet data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
