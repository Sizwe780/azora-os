/**
 * Constitutional Verification Gate Middleware (B9 / A5.3)
 *
 * A reusable utility that API route handlers can use to gate actions
 * through constitutional verification before executing them.
 *
 * Usage in a Next.js API route:
 *   import { withConstitutionalGate } from '@/lib/middleware/constitutional-gate'
 *
 *   export const POST = withConstitutionalGate(
 *     async (req, verification) => {
 *       // verification.allowed is guaranteed to be true here
 *       return NextResponse.json({ ok: true })
 *     },
 *     { actionType: 'CODE_EDIT', category: 'CODE_EXECUTION' }
 *   )
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  constitutionalAI,
  UserActionType,
  type UserAction,
  type VerificationResult,
} from '@/lib/services/constitutional-ai'
import {
  auditLogger,
  type AuditCategory,
} from '@/lib/services/centralized-audit-logger'

export interface GateOptions {
  /** The UserActionType to verify against. */
  actionType: keyof typeof UserActionType
  /** Audit category for the centralized logger. */
  category?: AuditCategory
  /** If true, only warn on violations instead of blocking. */
  warnOnly?: boolean
  /** Extract extra metadata from the request to include in the audit. */
  extractMetadata?: (req: NextRequest, body: unknown) => Record<string, unknown>
}

export type GatedHandler = (
  req: NextRequest,
  verification: VerificationResult,
  body: unknown,
) => Promise<NextResponse>

/**
 * Wrap an API route handler with constitutional pre-execution verification.
 *
 * If verification fails (score < 95 or critical violations) and `warnOnly`
 * is false, the request is blocked with a 403 response containing the
 * verification details.
 */
export function withConstitutionalGate(handler: GatedHandler, opts: GateOptions) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let body: unknown = {}
    try {
      body = await req.clone().json()
    } catch {
      // Not all requests have a JSON body
    }

    const userId =
      (body as Record<string, string>)?.userId ||
      req.headers.get('x-user-id') ||
      'anonymous'

    const sessionId =
      (body as Record<string, string>)?.sessionId ||
      req.headers.get('x-session-id') ||
      `session_${Date.now()}`

    const action: UserAction = {
      id: `gate_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId,
      type: UserActionType[opts.actionType],
      payload: {
        path: req.nextUrl.pathname,
        method: req.method,
        ...(opts.extractMetadata ? opts.extractMetadata(req, body) : {}),
      },
      timestamp: new Date(),
      sessionId,
    }

    const verification = await constitutionalAI.verifyAction(action)

    // Log to centralized audit (B11)
    await auditLogger.log({
      severity: verification.allowed ? 'INFO' : 'WARNING',
      category: opts.category || 'SYSTEM',
      action: `${req.method} ${req.nextUrl.pathname}`,
      userId,
      sessionId,
      metadata: {
        constitutionalScore: verification.score,
        allowed: verification.allowed,
        violations: verification.violations.length,
        auditId: verification.auditId,
      },
      constitutionalScore: verification.score,
      constitutionalAllowed: verification.allowed,
    })

    if (!verification.allowed && !opts.warnOnly) {
      return NextResponse.json(
        {
          error: 'Constitutional verification failed',
          explanation: verification.explanation,
          score: verification.score,
          violations: verification.violations.map((v) => ({
            article: v.article,
            section: v.section,
            severity: v.severity,
            description: v.description,
            remediation: v.remediation,
          })),
          auditId: verification.auditId,
        },
        { status: 403 },
      )
    }

    return handler(req, verification, body)
  }
}

/**
 * Standalone verification helper for use inside existing route handlers
 * that cannot be wrapped (e.g. streaming routes).
 */
export async function verifyAction(
  userId: string,
  actionType: keyof typeof UserActionType,
  payload: Record<string, unknown> = {},
  sessionId?: string,
): Promise<VerificationResult> {
  const action: UserAction = {
    id: `verify_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    type: UserActionType[actionType],
    payload,
    timestamp: new Date(),
    sessionId: sessionId || `session_${Date.now()}`,
  }

  return constitutionalAI.verifyAction(action)
}
