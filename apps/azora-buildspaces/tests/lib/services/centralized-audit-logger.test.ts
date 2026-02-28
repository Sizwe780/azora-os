/** @jest-environment node */

import {
  CentralizedAuditLogger,
  type AuditEntry,
  type AuditSink,
} from '@/lib/services/centralized-audit-logger'

describe('CentralizedAuditLogger', () => {
  let logger: CentralizedAuditLogger

  beforeEach(() => {
    logger = new CentralizedAuditLogger()
  })

  describe('log', () => {
    it('should create audit entry with id and timestamp', async () => {
      const entry = await logger.log({
        severity: 'INFO',
        category: 'SYSTEM',
        action: 'test-action',
        userId: 'user-1',
        metadata: { key: 'value' },
      })

      expect(entry.id).toMatch(/^audit_/)
      expect(entry.timestamp).toBeDefined()
      expect(entry.action).toBe('test-action')
      expect(entry.userId).toBe('user-1')
    })

    it('should fan-out to all registered sinks', async () => {
      const received: AuditEntry[] = []
      const testSink: AuditSink = {
        name: 'test',
        async write(entry) {
          received.push(entry)
        },
      }

      logger.addSink(testSink)

      await logger.log({
        severity: 'INFO',
        category: 'SYSTEM',
        action: 'sink-test',
        userId: 'user-1',
        metadata: {},
      })

      expect(received).toHaveLength(1)
      expect(received[0].action).toBe('sink-test')
    })

    it('should not fail when a sink throws', async () => {
      const failingSink: AuditSink = {
        name: 'failing',
        async write() {
          throw new Error('sink failed')
        },
      }

      logger.addSink(failingSink)

      // Should not throw
      const entry = await logger.log({
        severity: 'ERROR',
        category: 'SECURITY',
        action: 'failing-sink-test',
        userId: 'user-1',
        metadata: {},
      })

      expect(entry.id).toBeDefined()
    })
  })

  describe('query', () => {
    beforeEach(async () => {
      await logger.log({ severity: 'INFO', category: 'SYSTEM', action: 'a1', userId: 'u1', metadata: {} })
      await logger.log({ severity: 'WARNING', category: 'SECURITY', action: 'a2', userId: 'u2', metadata: {} })
      await logger.log({ severity: 'CRITICAL', category: 'CONSTITUTIONAL', action: 'a3', userId: 'u1', metadata: {} })
    })

    it('should return all entries when no filters', () => {
      const results = logger.query()
      expect(results.length).toBe(3)
    })

    it('should filter by userId', () => {
      const results = logger.query({ userId: 'u1' })
      expect(results.length).toBe(2)
    })

    it('should filter by severity', () => {
      const results = logger.query({ severity: 'CRITICAL' })
      expect(results.length).toBe(1)
      expect(results[0].action).toBe('a3')
    })

    it('should filter by category', () => {
      const results = logger.query({ category: 'SECURITY' })
      expect(results.length).toBe(1)
    })

    it('should respect limit', () => {
      const results = logger.query({ limit: 2 })
      expect(results.length).toBe(2)
    })
  })

  describe('getStats', () => {
    it('should aggregate statistics correctly', async () => {
      await logger.log({ severity: 'INFO', category: 'SYSTEM', action: 'a1', userId: 'u1', metadata: {}, constitutionalScore: 100, constitutionalAllowed: true })
      await logger.log({ severity: 'WARNING', category: 'SECURITY', action: 'a2', userId: 'u1', metadata: {}, constitutionalScore: 80, constitutionalAllowed: false })

      const stats = logger.getStats('u1')

      expect(stats.total).toBe(2)
      expect(stats.bySeverity.INFO).toBe(1)
      expect(stats.bySeverity.WARNING).toBe(1)
      expect(stats.avgConstitutionalScore).toBe(90)
      expect(stats.complianceRate).toBe(50)
    })
  })

  describe('removeSink', () => {
    it('should remove sink by name', async () => {
      const received: AuditEntry[] = []
      logger.addSink({ name: 'removable', async write(e) { received.push(e) } })
      logger.removeSink('removable')

      await logger.log({ severity: 'INFO', category: 'SYSTEM', action: 'test', userId: 'u1', metadata: {} })

      expect(received).toHaveLength(0)
    })
  })
})
