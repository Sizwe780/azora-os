import { NextRequest, NextResponse } from 'next/server'
import {
  constitutionalRuleEngine,
} from '@/lib/engines/constitutional-rule-engine'
import {
  UserActionType,
  type UserAction,
} from '@/lib/services/constitutional-ai'
import { auditLogger } from '@/lib/services/centralized-audit-logger'

/**
 * Constitutional Rule Engine API (E1/E2)
 *
 * GET  — Returns engine status, profile, rules, and alignment scores
 * POST — Evaluates an action against the constitutional rule engine
 */

export async function GET(req: NextRequest) {
  const includeRules = req.nextUrl.searchParams.get('rules') !== 'false'

  const rules = constitutionalRuleEngine.getRules()
  const profile = constitutionalRuleEngine.getProfile()

  return NextResponse.json({
    profile,
    ruleCount: rules.length,
    enabledRules: rules.filter((r) => r.enabled).length,
    ...(includeRules
      ? {
          rules: rules.map((r) => ({
            id: r.id,
            article: r.article,
            section: r.section,
            principle: r.principle,
            severity: r.severity,
            enabled: r.enabled,
          })),
        }
      : {}),
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { actionType, userId = 'anonymous', payload = {}, sessionId, roomId } = body

    if (!actionType) {
      return NextResponse.json({ error: 'actionType is required' }, { status: 400 })
    }

    // Map string action type to enum value
    const type = (UserActionType as Record<string, string>)[actionType] ?? actionType

    const action: UserAction = {
      id: `rule_eval_${Date.now()}`,
      userId,
      type: type as UserActionType,
      payload,
      timestamp: new Date(),
      sessionId: sessionId || `session_${Date.now()}`,
      roomId,
    }

    const result = constitutionalRuleEngine.evaluateWithVerdict(action)
    const alignmentScores = constitutionalRuleEngine.computeAlignmentScores(result.violations)

    // Log through centralized audit
    await auditLogger.log({
      severity: result.allowed ? 'INFO' : 'WARNING',
      category: 'CONSTITUTIONAL',
      action: `rule-engine:${actionType}`,
      userId,
      sessionId,
      roomId,
      metadata: {
        score: result.score,
        violations: result.violations.length,
        profile: result.profile,
      },
      constitutionalScore: result.score,
      constitutionalAllowed: result.allowed,
    })

    return NextResponse.json({
      allowed: result.allowed,
      score: result.score,
      profile: result.profile,
      violations: result.violations,
      alignmentScores,
    })
  } catch (error) {
    console.error('[Constitutional Rule Engine] Error:', error)
    return NextResponse.json(
      { error: 'Rule evaluation failed' },
      { status: 500 },
    )
  }
}
