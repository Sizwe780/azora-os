/**
 * Constitutional Audit Logger
 * 
 * Implements comprehensive audit logging for constitutional compliance.
 * All significant actions are logged with context for transparency and auditability.
 */

export enum AuditEventType {
  // Authentication events
  USER_LOGIN = "user.login",
  USER_LOGOUT = "user.logout",
  USER_SIGNUP = "user.signup",
  
  // BuildSpace events
  BUILDSPACE_CREATED = "buildspace.created",
  BUILDSPACE_UPDATED = "buildspace.updated",
  BUILDSPACE_DELETED = "buildspace.deleted",
  
  // Code execution events
  CODE_EXECUTED = "code.executed",
  CODE_EXECUTION_FAILED = "code.execution_failed",
  
  // Agent events
  AGENT_INVOKED = "agent.invoked",
  AGENT_COMPLETED = "agent.completed",
  AGENT_FAILED = "agent.failed",
  
  // Design events
  DESIGN_IMPORTED = "design.imported",
  DESIGN_GENERATED = "design.generated",
  
  // Security events
  RATE_LIMIT_EXCEEDED = "security.rate_limit_exceeded",
  UNAUTHORIZED_ACCESS = "security.unauthorized_access",
  SUSPICIOUS_ACTIVITY = "security.suspicious_activity",
  
  // System events
  HEALTH_CHECK = "system.health_check",
  ERROR = "system.error",
}

export enum AuditSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  eventType: AuditEventType
  severity: AuditSeverity
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action?: string
  details?: Record<string, unknown>
  constitutionalAlignment?: number
  success: boolean
  error?: string
}

class AuditLogger {
  private logs: AuditLogEntry[] = []
  private maxLogsInMemory = 1000
  
  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...entry,
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[AUDIT] ${auditEntry.severity.toUpperCase()} - ${auditEntry.eventType}:`,
        auditEntry.details || ""
      )
    }
    
    // Store in memory (limited)
    this.logs.push(auditEntry)
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift()
    }
    
    // Persist to database if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        const { PrismaClient } = await import("@prisma/client")
        const prisma = new PrismaClient()
        await prisma.auditLog.create({
          data: {
            id: auditEntry.id,
            timestamp: new Date(auditEntry.timestamp),
            eventType: auditEntry.eventType,
            severity: auditEntry.severity,
            userId: auditEntry.userId,
            sessionId: auditEntry.sessionId,
            ipAddress: auditEntry.ipAddress,
            userAgent: auditEntry.userAgent,
            resource: auditEntry.resource,
            action: auditEntry.action,
            details: auditEntry.details as any,
            constitutionalAlignment: auditEntry.constitutionalAlignment,
            success: auditEntry.success,
            error: auditEntry.error,
          }
        })
        await prisma.$disconnect()
      } catch (error) {
        console.error("[AUDIT] Failed to persist log:", error)
      }
    }

    // Send to external monitoring if configured
    if (process.env.SENTRY_DSN && (entry.severity === AuditSeverity.ERROR || entry.severity === AuditSeverity.CRITICAL)) {
      try {
        // @ts-ignore
        const Sentry = await import("@sentry/node")
        Sentry.captureMessage(`[AUDIT] ${auditEntry.severity} - ${auditEntry.eventType}: ${auditEntry.error || ''}`)
      } catch (err) {
        console.error('[AUDIT] Failed to send to Sentry:', err)
      }
    }
  }
  
  /**
   * Quick logging methods
   */
  async info(
    eventType: AuditEventType,
    details?: Record<string, unknown>,
    context?: Partial<AuditLogEntry>
  ): Promise<void> {
    await this.log({
      eventType,
      severity: AuditSeverity.INFO,
      success: true,
      details,
      ...context,
    })
  }
  
  async warning(
    eventType: AuditEventType,
    details?: Record<string, unknown>,
    context?: Partial<AuditLogEntry>
  ): Promise<void> {
    await this.log({
      eventType,
      severity: AuditSeverity.WARNING,
      success: true,
      details,
      ...context,
    })
  }
  
  async error(
    eventType: AuditEventType,
    error: Error | string,
    context?: Partial<AuditLogEntry>
  ): Promise<void> {
    await this.log({
      eventType,
      severity: AuditSeverity.ERROR,
      success: false,
      error: error instanceof Error ? error.message : error,
      details: error instanceof Error ? { stack: error.stack } : undefined,
      ...context,
    })
  }
  
  async critical(
    eventType: AuditEventType,
    error: Error | string,
    context?: Partial<AuditLogEntry>
  ): Promise<void> {
    await this.log({
      eventType,
      severity: AuditSeverity.CRITICAL,
      success: false,
      error: error instanceof Error ? error.message : error,
      details: error instanceof Error ? { stack: error.stack } : undefined,
      ...context,
    })
  }
  
  /**
   * Retrieve recent logs (for monitoring dashboards)
   */
  getRecentLogs(limit = 100): AuditLogEntry[] {
    return this.logs.slice(-limit)
  }
  
  /**
   * Filter logs by criteria
   */
  filterLogs(filter: {
    eventType?: AuditEventType
    severity?: AuditSeverity
    userId?: string
    startDate?: Date
    endDate?: Date
  }): AuditLogEntry[] {
    return this.logs.filter((log) => {
      if (filter.eventType && log.eventType !== filter.eventType) return false
      if (filter.severity && log.severity !== filter.severity) return false
      if (filter.userId && log.userId !== filter.userId) return false
      if (filter.startDate && new Date(log.timestamp) < filter.startDate) return false
      if (filter.endDate && new Date(log.timestamp) > filter.endDate) return false
      return true
    })
  }
  
  /**
   * Generate a unique ID for the log entry
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}

// Singleton instance
export const auditLogger = new AuditLogger()

/**
 * Helper to extract request context for audit logging
 */
export function extractRequestContext(request: Request): Partial<AuditLogEntry> {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  }
}
