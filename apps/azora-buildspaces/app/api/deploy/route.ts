import { NextRequest, NextResponse } from 'next/server'
import { constitutionalAI, UserActionType } from '@/lib/services/constitutional-ai'
import { WorkspaceManager } from '@/lib/services/workspace-manager'

// POST /api/deploy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { environment = 'staging', buildType = 'production', projectName, userId } = body

    const action = {
      id: `action_deploy_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
      userId: userId || 'unknown',
      type: UserActionType.PROJECT_DEPLOY,
      payload: { environment, buildType, projectName },
      timestamp: new Date(),
      sessionId: `session_deploy_${Date.now()}`
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

    const wm = WorkspaceManager.getInstance()
    const deployResult = await wm.executeCommand({ type: 'deploy', parameters: { environment, buildType, projectName } })

    return NextResponse.json({ success: true, deployResult })
  } catch (error) {
    return NextResponse.json({ error: 'Deploy failed', message: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
