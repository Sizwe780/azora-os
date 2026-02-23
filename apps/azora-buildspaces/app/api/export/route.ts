import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { constitutionalAI, UserActionType } from '@/lib/services/constitutional-ai'

// POST /api/export
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication for POST
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { payload = {}, userId } = body

    // Prefer session user id/email when available
    const sessionUserId = (session.user as any).id || session.user.email || (session.user as any).sub

    const action = {
      id: `action_export_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
      userId: sessionUserId || userId || 'unknown',
      type: UserActionType.DATA_EXPORT,
      payload,
      timestamp: new Date(),
      sessionId: `session_export_${Date.now()}`
    }

    const verification = await constitutionalAI.verifyAction(action)

    await constitutionalAI.logAudit({
      id: verification.auditId,
      timestamp: new Date(),
      userId: action.userId,
      action: action as any,
      result: verification as any,
      constitutionalScore: verification.score,
      violations: verification.violations,
      status: verification.allowed ? 'COMPLIANT' : 'VIOLATION'
    })

    if (!verification.allowed) {
      return NextResponse.json({ error: 'Constitutional Violation', message: verification.explanation }, { status: 403 })
    }

    // In a real implementation, we would redact secrets and return the export
    const safeExport = { ...payload }

    return NextResponse.json({ success: true, export: safeExport })
  } catch (error) {
    return NextResponse.json({ error: 'Export failed', message: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
