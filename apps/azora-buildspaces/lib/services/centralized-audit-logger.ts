/**
 * Centralized Audit Logger (B11/C4)
 *
 * Provides a single audit-logging pipeline for all BuildSpaces operations.
 * Supports multiple output targets: console, database (Prisma), and
 * configurable external sinks (e.g. Datadog, Elasticsearch).
 *
 * Every audit entry records the constitutional compliance context so that
 * the compliance dashboard can aggregate scores system-wide.
 */

import { randomUUID } from 'crypto'
import { constitutionalAI, type VerificationResult, UserActionType, type UserAction } from './constitutional-ai'

// ── Types ─────────────────────────────────────────────────────────────

export type AuditSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

export type AuditCategory =
  | 'AUTH'
  | 'AI_QUERY'
  | 'CODE_EXECUTION'
  | 'FILE_OPERATION'
  | 'DEPLOYMENT'
  | 'COLLABORATION'
  | 'MARKETPLACE'
  | 'CONSTITUTIONAL'
  | 'SECURITY'
  | 'SYSTEM'

export interface AuditEntry {
  id: string
  timestamp: string
  severity: AuditSeverity
  category: AuditCategory
  action: string
  userId: string
  sessionId?: string
  roomId?: string
  metadata: Record<string, unknown>
  constitutionalScore?: number
  constitutionalAllowed?: boolean
  ipAddress?: string
  userAgent?: string
  duration?: number
}

export interface AuditSink {
  name: string
  write(entry: AuditEntry): Promise<void>
}

// ── Console Sink ──────────────────────────────────────────────────────

const consoleSink: AuditSink = {
  name: 'console',
  async write(entry) {
    const prefix = `[AUDIT:${entry.severity}]`
    const msg = `${prefix} ${entry.timestamp} | ${entry.category} | ${entry.action} | user=${entry.userId}`
    if (entry.severity === 'CRITICAL' || entry.severity === 'ERROR') {
      console.error(msg, entry.metadata)
    } else {
      console.info(msg)
    }
  },
}

// ── In-memory buffer (for dashboard queries when no DB) ───────────────

const MAX_BUFFER = 10_000

// ── Service ───────────────────────────────────────────────────────────

export class CentralizedAuditLogger {
  private sinks: AuditSink[] = [consoleSink]
  private buffer: AuditEntry[] = []
  /** Register an additional output sink (e.g. database, external service). */
  addSink(sink: AuditSink): void {
    this.sinks.push(sink)
  }

  /** Remove a registered sink by name. */
  removeSink(name: string): void {
    this.sinks = this.sinks.filter((s) => s.name !== name)
  }

  /**
   * Log an audit entry and fan-out to all registered sinks.
   * Failures in individual sinks are logged but do not prevent other
   * sinks from receiving the event.
   */
  async log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    const full: AuditEntry = {
      ...entry,
      id: `audit_${randomUUID()}`,
      timestamp: new Date().toISOString(),
    }

    // Buffer for in-memory queries
    this.buffer.push(full)
    if (this.buffer.length > MAX_BUFFER) {
      this.buffer = this.buffer.slice(-MAX_BUFFER)
    }

    // Fan-out to sinks (fire-and-forget per sink)
    const writes = this.sinks.map(async (sink) => {
      try {
        await sink.write(full)
      } catch (err) {
        console.error(`[AuditLogger] Sink "${sink.name}" failed:`, err)
      }
    })
    await Promise.allSettled(writes)

    return full
  }

  /**
   * Convenience: log an action with automatic constitutional verification (B9).
   * Returns the audit entry plus the constitutional verdict.
   */
  async logWithVerification(
    entry: Omit<AuditEntry, 'id' | 'timestamp' | 'constitutionalScore' | 'constitutionalAllowed'>,
  ): Promise<{ audit: AuditEntry; verification: VerificationResult }> {
    const action: UserAction = {
      id: `action_${randomUUID()}`,
      userId: entry.userId,
      type: this.mapCategoryToActionType(entry.category),
      payload: entry.metadata as Record<string, any>,
      timestamp: new Date(),
      sessionId: entry.sessionId || 'system',
      roomId: entry.roomId,
    }

    const verification = await constitutionalAI.verifyAction(action)

    const audit = await this.log({
      ...entry,
      constitutionalScore: verification.score,
      constitutionalAllowed: verification.allowed,
    })

    return { audit, verification }
  }

  /** Query the in-memory buffer. */
  query(opts?: {
    userId?: string
    category?: AuditCategory
    severity?: AuditSeverity
    limit?: number
    since?: string
  }): AuditEntry[] {
    let results = [...this.buffer]

    if (opts?.userId) results = results.filter((e) => e.userId === opts.userId)
    if (opts?.category) results = results.filter((e) => e.category === opts.category)
    if (opts?.severity) results = results.filter((e) => e.severity === opts.severity)
    if (opts?.since) {
      const sinceDate = new Date(opts.since).getTime()
      results = results.filter((e) => new Date(e.timestamp).getTime() >= sinceDate)
    }

    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return results.slice(0, opts?.limit ?? 100)
  }

  /** Aggregate stats for the dashboard. */
  getStats(userId?: string): {
    total: number
    bySeverity: Record<AuditSeverity, number>
    byCategory: Record<string, number>
    avgConstitutionalScore: number
    complianceRate: number
  } {
    const entries = userId ? this.buffer.filter((e) => e.userId === userId) : this.buffer

    const bySeverity: Record<AuditSeverity, number> = { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 }
    const byCategory: Record<string, number> = {}
    let scoreSum = 0
    let scoreCount = 0
    let allowedCount = 0

    for (const e of entries) {
      bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1
      byCategory[e.category] = (byCategory[e.category] || 0) + 1
      if (e.constitutionalScore !== undefined) {
        scoreSum += e.constitutionalScore
        scoreCount++
      }
      if (e.constitutionalAllowed) allowedCount++
    }

    return {
      total: entries.length,
      bySeverity,
      byCategory,
      avgConstitutionalScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 100,
      complianceRate: entries.length > 0 ? Math.round((allowedCount / entries.length) * 100) : 100,
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────

  private mapCategoryToActionType(category: AuditCategory): UserActionType {
    const map: Record<AuditCategory, UserActionType> = {
      AUTH: UserActionType.SETTINGS_CHANGE,
      AI_QUERY: UserActionType.AI_QUERY,
      CODE_EXECUTION: UserActionType.CODE_EDIT,
      FILE_OPERATION: UserActionType.FILE_CREATE,
      DEPLOYMENT: UserActionType.PROJECT_DEPLOY,
      COLLABORATION: UserActionType.COLLABORATION_JOIN,
      MARKETPLACE: UserActionType.MARKETPLACE_PUBLISH,
      CONSTITUTIONAL: UserActionType.COMMAND_EXECUTION,
      SECURITY: UserActionType.SETTINGS_CHANGE,
      SYSTEM: UserActionType.COMMAND_EXECUTION,
    }
    return map[category] || UserActionType.COMMAND_EXECUTION
  }
}

// ── Singleton ─────────────────────────────────────────────────────────

export const auditLogger = new CentralizedAuditLogger()
