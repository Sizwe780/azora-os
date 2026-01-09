/**
 * Award Tokens API Endpoint
 * 
 * POST /api/economy/award
 * Internal endpoint for awarding tokens (requires authentication)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { awardTokens, verifyAndAward, REWARD_AMOUNTS, type RewardAction } from '@/lib/economy/mining-engine'

interface AwardRequest {
  userId?: string // If omitted, awards to authenticated user
  action: RewardAction
  value?: number
  workContent?: string // For quality verification
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: AwardRequest = await request.json()
    const { action, value, workContent, metadata } = body
    const targetUserId = body.userId ?? (session.user as any).id

    // Validate action type
    if (!action || !(action in REWARD_AMOUNTS)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      )
    }

    // If work content is provided, verify quality before awarding
    let result
    if (workContent) {
      result = await verifyAndAward(targetUserId, action, workContent, metadata)
    } else {
      result = await awardTokens(targetUserId, action, value, metadata)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to award tokens' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      amount: result.amount,
      netAmount: result.netAmount,
      taxAmount: result.taxAmount
    })
  } catch (error) {
    console.error('[API] Award error:', error)
    return NextResponse.json(
      { error: 'Failed to award tokens' },
      { status: 500 }
    )
  }
}
