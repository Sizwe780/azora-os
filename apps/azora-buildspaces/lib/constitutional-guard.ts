/**
 * Constitutional Guard - The Guardian Middleware
 * 
 * Constitutional Compliance:
 * - TRANSPARENCY: All requests logged for audit
 * - VALIDATION: Enforces Constitutional AI principles
 * - TRUTH ECONOMICS: Prevents mock/fake submissions
 * 
 * This middleware intercepts every agent request and validates it
 * against the Azora Constitution before allowing it to proceed.
 */

import type { AgentRequest } from './agent-bridge'

/**
 * Constitutional Violation Record
 */
export interface ConstitutionalViolation {
  /** Violation type */
  type: 'NO_MOCK' | 'TRUTH' | 'TRANSPARENCY' | 'PRIVACY' | 'SAFETY'
  /** Article of the constitution violated */
  article: string
  /** Human-readable violation message */
  message: string
  /** Severity (1-10, where 10 is critical) */
  severity: number
}

/**
 * Constitutional Validation Result
 */
export interface ConstitutionalValidationResult {
  /** Whether the request passed validation */
  passed: boolean
  /** List of violations (empty if passed) */
  violations: ConstitutionalViolation[]
  /** Constitutional health score (0-100) */
  healthScore: number
  /** Validation timestamp */
  timestamp: number
}

/**
 * Validate an agent request against Constitutional principles
 * 
 * Constitutional AI Operating System - Foundational Principles:
 * 1. Truth as Currency - No fake/mock data
 * 2. Transparency - All actions logged and explainable
 * 3. Privacy Protection - No unauthorized data exposure
 * 4. Safety First - No harmful outputs
 * 5. No Mock Protocol - Real implementations only
 */
export function validateConstitution(request: AgentRequest): ConstitutionalValidationResult {
  const violations: ConstitutionalViolation[] = []
  let healthScore = 100

  // 1. NO MOCK PROTOCOL - Validate payload is not empty/fake
  if (!request.payload.fileContent || request.payload.fileContent.trim().length === 0) {
    // Exception: Some signals don't require file content
    const noContentAllowed = ['GENERATE_COMPONENT', 'GENERATE_SPEC']

    if (!noContentAllowed.includes(request.signal)) {
      violations.push({
        type: 'NO_MOCK',
        article: 'Article I, Section 1.2.4 - No Mock Protocol',
        message: 'Cannot submit empty content. Truth Economics: provide real code for analysis.',
        severity: 8,
      })
      healthScore -= 30
    }
  }

  // 2. TRUTH PROTOCOL - Validate content is not placeholder text
  if (request.payload.fileContent) {
    const placeholderIndicators = [
      '// TODO',
      '// FAKE',
      '// PLACEHOLDER',
      'console.log("test")',
      'return null',
      'return true', // suspicious if that's the entire file
    ]

    const lowerContent = request.payload.fileContent.toLowerCase()
    const isSuspiciouslySimple =
      request.payload.fileContent.split('\n').filter(line => line.trim()).length < 3

    const hasPlaceholderIndicators = placeholderIndicators.some(indicator =>
      lowerContent.includes(indicator.toLowerCase())
    )

    if (isSuspiciouslySimple && hasPlaceholderIndicators) {
      violations.push({
        type: 'TRUTH',
        article: 'Article I, Section 1.2.1 - Truth as Currency',
        message:
          'Content appears to be placeholder code. Provide real implementation for Constitutional compliance.',
        severity: 6,
      })
      healthScore -= 20
    }
  }

  // 3. TRANSPARENCY - Validate request has context
  if (!request.payload.context && request.signal !== 'REVIEW_CODE') {
    // Soft violation - reduces score but doesn't block
    violations.push({
      type: 'TRANSPARENCY',
      article: 'Article I, Section 1.3 - Constitutional AI Governance',
      message: 'Missing context for agent request. Provide user intent for better transparency.',
      severity: 3,
    })
    healthScore -= 10
  }

  // 4. PRIVACY - Check for potential sensitive data leaks
  if (request.payload.fileContent) {
    const sensitivePatterns = [
      /api[_-]?key.*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/i,
      /password.*[=:]\s*['"][^'"]+['"]/i,
      /secret.*[=:]\s*['"][^'"]+['"]/i,
      /token.*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/i,
      /sk_[a-z]+_[a-zA-Z0-9]{20,}/i, // Stripe-like keys
      /[0-9]{3}-[0-9]{2}-[0-9]{4}/i, // SSN pattern
    ]

    for (const pattern of sensitivePatterns) {
      if (pattern.test(request.payload.fileContent)) {
        violations.push({
          type: 'PRIVACY',
          article: 'Article II, Section 2.1.2 - Privacy Protection',
          message:
            'Potential sensitive data detected (API key, password, or secret). Remove before submitting.',
          severity: 10,
        })
        healthScore -= 50
        break // One privacy violation is enough
      }
    }
  }

  // 5. SAFETY - Check for potentially harmful code patterns
  if (request.payload.fileContent) {
    const dangerousPatterns = [
      /eval\(/i,
      /Function\(/i,
      /dangerouslySetInnerHTML/i,
      /process\.env/i, // In client code
      /__dirname/i, // In client code
    ]

    let dangerCount = 0
    for (const pattern of dangerousPatterns) {
      if (pattern.test(request.payload.fileContent)) {
        dangerCount++
      }
    }

    if (dangerCount > 2) {
      violations.push({
        type: 'SAFETY',
        article: 'Article I, Section 1.2.6 - Service Never Enslavement',
        message: 'Multiple potentially unsafe code patterns detected. Review for security risks.',
        severity: 7,
      })
      healthScore -= 25
    }
  }

  // Determine if validation passed
  // Critical violations (severity >= 8) block the request
  const hasCriticalViolations = violations.some(v => v.severity >= 8)
  const passed = !hasCriticalViolations

  // Log validation result (Transparency)
  console.log('[ConstitutionalGuard] Validation:', {
    requestId: request.id,
    agent: request.agent,
    signal: request.signal,
    passed: passed ? '✅' : '❌',
    violations: violations.length,
    healthScore,
  })

  return {
    passed,
    violations,
    healthScore: Math.max(0, healthScore),
    timestamp: Date.now(),
  }
}

/**
 * Log constitutional check for audit trail
 */
export function logConstitutionalCheck(
  request: AgentRequest,
  result: ConstitutionalValidationResult
): void {
  const logEntry = {
    timestamp: new Date(result.timestamp).toISOString(),
    requestId: request.id,
    agent: request.agent,
    signal: request.signal,
    passed: result.passed,
    violations: result.violations,
    healthScore: result.healthScore,
  }

  // In production, this would write to a persistent audit log
  // For now, we'll use console with clear formatting
  if (result.passed) {
    console.log('✅ [ConstitutionalGuard] Request approved:', logEntry)
  } else {
    console.error('❌ [ConstitutionalGuard] Request blocked:', logEntry)
  }

  // Persist to database via API (Fire and forget)
  if (typeof window !== 'undefined') {
    fetch('/api/audit/constitutional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: request.signal,
        entityType: 'agent_request',
        entityId: request.id,
        preChecksPassed: result.passed,
        postChecksPassed: result.passed, // Simplified for now
        constitutionalConcern: !result.passed,
        auditDetails: {
          violations: result.violations,
          healthScore: result.healthScore,
          agent: request.agent
        }
      })
    }).catch(err => console.error('[ConstitutionalGuard] Failed to persist log:', err));

    // Store in localStorage for debugging (remove in production)
    try {
      const logs = JSON.parse(localStorage.getItem('constitutional-logs') || '[]')
      logs.push(logEntry)
      // Keep only last 100 logs
      if (logs.length > 100) logs.shift()
      localStorage.setItem('constitutional-logs', JSON.stringify(logs))
    } catch (error) {
      console.error('Failed to store constitutional log:', error)
    }
  }
}

/**
 * Get constitutional health metrics
 */
export function getConstitutionalHealth(): {
  totalRequests: number
  passedRequests: number
  averageHealthScore: number
  recentViolations: ConstitutionalViolation[]
} {
  if (typeof window === 'undefined') {
    return {
      totalRequests: 0,
      passedRequests: 0,
      averageHealthScore: 100,
      recentViolations: [],
    }
  }

  try {
    const logs = JSON.parse(localStorage.getItem('constitutional-logs') || '[]')
    const totalRequests = logs.length
    const passedRequests = logs.filter((log: any) => log.passed).length
    const avgScore =
      logs.reduce((sum: number, log: any) => sum + log.healthScore, 0) / (totalRequests || 1)

    const recentViolations = logs
      .filter((log: any) => !log.passed)
      .flatMap((log: any) => log.violations)
      .slice(-10)

    return {
      totalRequests,
      passedRequests,
      averageHealthScore: Math.round(avgScore),
      recentViolations,
    }
  } catch (error) {
    return {
      totalRequests: 0,
      passedRequests: 0,
      averageHealthScore: 100,
      recentViolations: [],
    }
  }
}
