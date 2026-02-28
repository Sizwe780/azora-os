import { auditLogger, type AuditSeverity } from '@/lib/services/centralized-audit-logger';

/**
 * Constitutional Auth Audit Logging
 *
 * Logs all authentication and authorization events for constitutional compliance
 * via the centralized audit logger (B11/C4). Events flow through the standard
 * audit pipeline including console, in-memory buffer, and any registered sinks.
 *
 * Constitutional Alignment:
 * - Truth/Transparency: Complete auth event logging (Article VIII)
 * - Audit Trail: All auth actions recorded to centralized logger
 * - User Rights: Users can review their account activity
 * - Security: Detects suspicious patterns (failed logins, IP switching)
 */

export interface AuthAuditEvent {
  action: 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET' | 'EMAIL_VERIFIED' | 'ROLE_CHANGED' | 'SESSION_INVALID' | 'RATE_LIMITED';
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

/** Map auth event action to audit severity. */
function eventSeverity(event: AuthAuditEvent): AuditSeverity {
  if (!event.success) {
    if (event.action === 'RATE_LIMITED') return 'WARNING';
    if (event.action === 'SESSION_INVALID') return 'WARNING';
    return 'ERROR';
  }
  if (event.action === 'ROLE_CHANGED') return 'WARNING';
  return 'INFO';
}

/**
 * Log an authentication event via the centralized audit logger.
 *
 * Events are recorded with category=AUTH, allowing the compliance dashboard
 * and /api/audit/logs endpoint to query and aggregate auth patterns.
 */
export async function logAuthEvent(event: AuthAuditEvent) {
  try {
    await auditLogger.log({
      severity: eventSeverity(event),
      category: 'AUTH',
      action: `AUTH_${event.action}`,
      userId: event.userId || 'anonymous',
      metadata: {
        userEmail: event.userEmail,
        userAgent: event.userAgent,
        ipAddress: event.ipAddress,
        success: event.success,
        reason: event.reason,
        ...event.metadata,
      },
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    });
  } catch (error) {
    console.error('[AUTH_AUDIT] Failed to log event:', error);
    // Don't throw - audit logs shouldn't break auth flow
  }
}

/**
 * Get auth audit trail for a user.
 * Queries the centralized in-memory buffer for AUTH-category entries.
 */
export async function getAuthAuditTrail(userId: string, days = 30) {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return auditLogger.query({
      userId,
      category: 'AUTH',
      since: since.toISOString(),
      limit: 500,
    });
  } catch (error) {
    console.error('[AUTH_AUDIT] Failed to retrieve audit trail:', error);
    return [];
  }
}

// ── Suspicious Activity Detection ────────────────────────────────────

/** Thresholds for suspicious pattern detection. */
const FAILED_LOGIN_THRESHOLD = parseInt(process.env.AUTH_FAILED_LOGIN_THRESHOLD || '5', 10);
const FAILED_LOGIN_WINDOW_MS = parseInt(process.env.AUTH_FAILED_LOGIN_WINDOW_MS || '900000', 10); // 15 min
const MULTI_IP_THRESHOLD = parseInt(process.env.AUTH_MULTI_IP_THRESHOLD || '3', 10);
const MULTI_IP_WINDOW_MS = parseInt(process.env.AUTH_MULTI_IP_WINDOW_MS || '300000', 10); // 5 min

/**
 * Detect suspicious auth patterns by inspecting recent audit entries.
 *
 * Checks:
 * 1. N failed logins within a configurable time window
 * 2. Logins from multiple distinct IPs in a short window
 */
export async function detectSuspiciousActivity(userId: string): Promise<{
  isSuspicious: boolean;
  reason?: string;
  failedAttempts?: number;
}> {
  try {
    const now = Date.now();

    // Pull recent AUTH entries for this user
    const recentEntries = auditLogger.query({
      userId,
      category: 'AUTH',
      limit: 200,
    });

    // ── Check 1: Failed login spike ──────────────────────────────────
    const failedLogins = recentEntries.filter((e) => {
      const age = now - new Date(e.timestamp).getTime();
      return (
        age <= FAILED_LOGIN_WINDOW_MS &&
        e.action === 'AUTH_LOGIN' &&
        (e.metadata as Record<string, unknown>)?.success === false
      );
    });

    if (failedLogins.length >= FAILED_LOGIN_THRESHOLD) {
      return {
        isSuspicious: true,
        reason: `${failedLogins.length} failed login attempts in the last ${Math.round(FAILED_LOGIN_WINDOW_MS / 60000)} minutes`,
        failedAttempts: failedLogins.length,
      };
    }

    // ── Check 2: Multiple distinct IPs in short window ───────────────
    const recentSuccessLogins = recentEntries.filter((e) => {
      const age = now - new Date(e.timestamp).getTime();
      return (
        age <= MULTI_IP_WINDOW_MS &&
        e.action === 'AUTH_LOGIN' &&
        (e.metadata as Record<string, unknown>)?.success === true
      );
    });

    const uniqueIps = new Set(
      recentSuccessLogins
        .map((e) => e.ipAddress || (e.metadata as Record<string, unknown>)?.ipAddress as string)
        .filter(Boolean),
    );

    if (uniqueIps.size >= MULTI_IP_THRESHOLD) {
      return {
        isSuspicious: true,
        reason: `Logins from ${uniqueIps.size} distinct IPs in the last ${Math.round(MULTI_IP_WINDOW_MS / 60000)} minutes`,
        failedAttempts: failedLogins.length,
      };
    }

    return { isSuspicious: false, failedAttempts: failedLogins.length };
  } catch (error) {
    console.error('[AUTH_AUDIT] Failed to detect suspicious activity:', error);
    return { isSuspicious: false };
  }
}
