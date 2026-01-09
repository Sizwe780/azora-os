/**
 * Wallet API Endpoint
 * 
 * GET /api/economy/wallet
 * Returns user's wallet balance and transaction history
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getWalletBalance, getTransactionHistory } from '@/lib/economy/mining-engine'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id

    // Fetch wallet data
    const balance = await getWalletBalance(userId)
    const transactions = await getTransactionHistory(userId, 20)

    // Calculate truth score (always 100% for now - full transparency)
    const truthScore = 100

    return NextResponse.json({
      balance: balance ?? 0,
      transactions,
      status: 'sovereign',
      truthScore
    })
  } catch (error) {
    console.error('[API] Wallet error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    )
  }
}
