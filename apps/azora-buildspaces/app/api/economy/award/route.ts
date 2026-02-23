/**
 * Token Award API Endpoint
 * 
 * POST /api/economy/award - Award tokens to a user
 * 
 * Constitutional Compliance:
 * - Article III: Economic Constitution - Fair token distribution
 * - Article VIII: Truth as Currency - Rewards for truth contributions
 * - No Mock Protocol: Real token awards via mining engine
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { miningEngine, REWARD_RATES, type RewardType } from '@/lib/economy/mining-engine'
import { z } from 'zod'

// Request validation schema
const AwardRequestSchema = z.object({
  userId: z.string().optional(), // If not provided, awards to current user
  rewardType: z.enum([
    'CODE_COMMIT',
    'CODE_REVIEW',
    'BUG_FIX',
    'FEATURE_COMPLETE',
    'DOCUMENTATION',
    'TUTORIAL_CREATE',
    'QUESTION_ANSWER',
    'KNOWLEDGE_SHARE',
    'TRUTH_VERIFICATION',
    'FACT_CHECK',
    'SOURCE_CITATION',
    'MENTORSHIP_SESSION',
    'WORKSHOP_HOST',
    'COMMUNITY_SUPPORT',
    'PROJECT_CREATE',
    'PROJECT_COMPLETE',
    'COLLABORATION',
    'PEER_REVIEW'
  ] as const),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = AwardRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { userId, rewardType, description, metadata } = validationResult.data

    // Use current user if no userId specified
    const targetUserId = userId || session.user.id

    // Award tokens using mining engine (calls awardTokens internally)
    const result = await miningEngine.awardByType(
      targetUserId,
      rewardType as RewardType,
      description
    )

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to award tokens',
          details: result.error
        },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      transaction: {
        id: result.transactionId,
        userId: targetUserId,
        amount: result.amount,
        rewardType,
        description: description || `Reward for ${rewardType}`,
        newBalance: result.newBalance,
        truthScore: result.truthScore
      },
      message: `Successfully awarded ${result.amount} AZR tokens`
    })
  } catch (error) {
    console.error('Award API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process award',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to view available reward types
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      rewardTypes: Object.entries(REWARD_RATES).map(([type, amount]) => ({
        type,
        amount,
        description: type.replace(/_/g, ' ').toLowerCase()
      })),
      totalTypes: Object.keys(REWARD_RATES).length
    })
  } catch (error) {
    console.error('Award API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reward types' },
      { status: 500 }
    )
  }
}
