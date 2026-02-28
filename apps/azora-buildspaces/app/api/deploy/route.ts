import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { constitutionalAI, UserActionType } from '@/lib/services/constitutional-ai'
import { WorkspaceManager } from '@/lib/services/workspace-manager'
import { auditLogger } from '@/lib/services/centralized-audit-logger'

/**
 * Allowed deployment environments and build types.
 */
const VALID_ENVIRONMENTS = ['development', 'staging', 'production'] as const
const VALID_BUILD_TYPES = ['production', 'preview', 'debug'] as const

type DeployEnvironment = typeof VALID_ENVIRONMENTS[number]
type BuildType = typeof VALID_BUILD_TYPES[number]

/**
 * Pre-flight validation results.
 */
interface PreflightResult {
  passed: boolean
  checks: { name: string; passed: boolean; message: string }[]
}

/**
 * Run pre-flight checks before allowing a deployment.
 */
function runPreflightChecks(
  environment: string,
  buildType: string,
  projectName?: string,
): PreflightResult {
  const checks: PreflightResult['checks'] = []

  // 1. Environment validation
  checks.push({
    name: 'valid_environment',
    passed: (VALID_ENVIRONMENTS as readonly string[]).includes(environment),
    message: (VALID_ENVIRONMENTS as readonly string[]).includes(environment)
      ? `Environment "${environment}" is valid`
      : `Invalid environment "${environment}". Must be one of: ${VALID_ENVIRONMENTS.join(', ')}`,
  })

  // 2. Build type validation
  checks.push({
    name: 'valid_build_type',
    passed: (VALID_BUILD_TYPES as readonly string[]).includes(buildType),
    message: (VALID_BUILD_TYPES as readonly string[]).includes(buildType)
      ? `Build type "${buildType}" is valid`
      : `Invalid build type "${buildType}". Must be one of: ${VALID_BUILD_TYPES.join(', ')}`,
  })

  // 3. Project name required for production
  if (environment === 'production') {
    checks.push({
      name: 'project_name_required',
      passed: !!projectName && projectName.trim().length > 0,
      message: projectName
        ? `Project "${projectName}" specified`
        : 'Project name is required for production deployments',
    })
  }

  // 4. Production environment variable check
  if (environment === 'production') {
    const hasFirebase = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    checks.push({
      name: 'firebase_configured',
      passed: hasFirebase,
      message: hasFirebase
        ? 'Firebase service account is configured'
        : 'FIREBASE_SERVICE_ACCOUNT_JSON is required for production deployment',
    })
  }

  // 5. Database URL check
  const hasDb = !!process.env.DATABASE_URL
  checks.push({
    name: 'database_configured',
    passed: hasDb || environment === 'development',
    message: hasDb
      ? 'Database is configured'
      : environment === 'development'
        ? 'Database not required for development'
        : 'DATABASE_URL is required for non-development deployments',
  })

  return {
    passed: checks.every((c) => c.passed),
    checks,
  }
}

// POST /api/deploy
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}))
    const { environment = 'staging', buildType = 'production', projectName } = body
    const userId = (session.user as any).id;

    // ── Pre-flight validation ────────────────────────────────────────
    const preflight = runPreflightChecks(environment, buildType, projectName)

    if (!preflight.passed) {
      await auditLogger.log({
        severity: 'WARNING',
        category: 'DEPLOYMENT',
        action: 'DEPLOY_PREFLIGHT_FAILED',
        userId: userId || 'unknown',
        metadata: {
          environment,
          buildType,
          projectName,
          failedChecks: preflight.checks.filter((c) => !c.passed).map((c) => c.name),
        },
      })

      return NextResponse.json({
        error: 'Pre-flight validation failed',
        preflight,
      }, { status: 422 })
    }

    // ── Constitutional verification ──────────────────────────────────
    const action = {
      id: `action_deploy_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
      userId: userId || 'unknown',
      type: UserActionType.PROJECT_DEPLOY,
      payload: { environment, buildType, projectName, hasConstitutionalAudit: true },
      timestamp: new Date(),
      sessionId: `session_deploy_${Date.now()}`
    }

    const verification = await constitutionalAI.verifyAction(action)

    await auditLogger.log({
      severity: verification.allowed ? 'INFO' : 'WARNING',
      category: 'DEPLOYMENT',
      action: verification.allowed ? 'DEPLOY_APPROVED' : 'DEPLOY_BLOCKED',
      userId: action.userId,
      metadata: {
        environment,
        buildType,
        projectName,
        score: verification.score,
        violations: verification.violations.length,
        auditId: verification.auditId,
      },
      constitutionalScore: verification.score,
      constitutionalAllowed: verification.allowed,
    })

    if (!verification.allowed) {
      return NextResponse.json({
        error: 'Constitutional Violation',
        message: verification.explanation,
        preflight,
        constitutional: {
          score: verification.score,
          violations: verification.violations.length,
        },
      }, { status: 403 })
    }

    // ── Execute deployment ───────────────────────────────────────────
    const wm = WorkspaceManager.getInstance()
    const deployResult = await wm.executeCommand({ type: 'deploy', parameters: { environment, buildType, projectName } })

    return NextResponse.json({
      success: true,
      preflight,
      constitutional: { score: verification.score, auditId: verification.auditId },
      deployResult,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Deploy failed', message: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
