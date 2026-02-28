import { NextRequest, NextResponse } from 'next/server'
import {
  auditLogger,
  type AuditCategory,
  type AuditSeverity,
} from '@/lib/services/centralized-audit-logger'

/**
 * Audit Log Viewer API (A5.11)
 *
 * Provides a queryable REST interface over the centralized audit log
 * so the Command Desk and dashboard can display compliance data.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    const userId = searchParams.get('userId') || undefined
    const category = (searchParams.get('category') as AuditCategory) || undefined
    const severity = (searchParams.get('severity') as AuditSeverity) || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000)
    const since = searchParams.get('since') || undefined
    const includeStats = searchParams.get('stats') !== 'false'

    const entries = auditLogger.query({ userId, category, severity, limit, since })
    const stats = includeStats ? auditLogger.getStats(userId) : undefined

    return NextResponse.json({
      entries,
      stats,
      count: entries.length,
    })
  } catch (error) {
    console.error('[Audit Logs] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve audit logs' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      severity = 'INFO',
      category = 'SYSTEM',
      action,
      userId = 'anonymous',
      sessionId,
      roomId,
      metadata = {},
      verify = false,
    } = body

    if (!action) {
      return NextResponse.json(
        { error: 'action field is required' },
        { status: 400 }
      )
    }

    if (verify) {
      // Log with constitutional verification (B9)
      const result = await auditLogger.logWithVerification({
        severity,
        category,
        action,
        userId,
        sessionId,
        roomId,
        metadata,
      })

      return NextResponse.json({
        success: true,
        audit: result.audit,
        verification: {
          score: result.verification.score,
          allowed: result.verification.allowed,
          violations: result.verification.violations.length,
        },
      })
    }

    const entry = await auditLogger.log({
      severity,
      category,
      action,
      userId,
      sessionId,
      roomId,
      metadata,
    })

    return NextResponse.json({ success: true, audit: entry })
  } catch (error) {
    console.error('[Audit Logs] Error creating entry:', error)
    return NextResponse.json(
      { error: 'Failed to create audit entry' },
      { status: 500 }
    )
  }
}
