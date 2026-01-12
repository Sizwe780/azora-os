import { auditLogger, AuditEventType, AuditSeverity } from '../../lib/audit-logger'

describe('AuditLogger persistence and hooks', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.DATABASE_URL
    delete process.env.SENTRY_DSN
  })

  it('stores logs in memory when no DATABASE_URL', async () => {
    await auditLogger.info(AuditEventType.HEALTH_CHECK, { ok: true })
    const logs = auditLogger.getRecentLogs(10)
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[logs.length - 1].eventType).toBe(AuditEventType.HEALTH_CHECK)
  })

  it('persists to Prisma when DATABASE_URL is set', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'

    const mockCreate = jest.fn().mockResolvedValue(true)
    const mockDisconnect = jest.fn().mockResolvedValue(true)

    jest.mock('@prisma/client', () => ({
      PrismaClient: function MockPrisma() {
        return { auditLog: { create: mockCreate }, $disconnect: mockDisconnect }
      }
    }))

    await auditLogger.info(AuditEventType.BUILDSPACE_CREATED, { name: 'test' })

    // Wait a tick for async persistence
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockCreate).toHaveBeenCalled()
  })

  it('sends to Sentry on error severity', async () => {
    process.env.SENTRY_DSN = 'https://example@sentry.io'

    const mockCapture = jest.fn()
    jest.mock('@sentry/node', () => ({ captureMessage: mockCapture }))

    await auditLogger.error(AuditEventType.ERROR, new Error('boom'))

    // Wait a tick
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockCapture).toHaveBeenCalled()
  })
})