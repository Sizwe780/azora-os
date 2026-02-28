/** @jest-environment node */

/**
 * Tests for the Auth Audit Log Integration (Phase 2A)
 * Verifies that auth events flow through the centralized audit logger
 * and that suspicious activity detection works correctly.
 */

import { logAuthEvent, getAuthAuditTrail, detectSuspiciousActivity } from '@/lib/auth-audit'
import { auditLogger } from '@/lib/services/centralized-audit-logger'

describe('Auth Audit Integration', () => {
  describe('logAuthEvent', () => {
    it('should log a successful login event to the centralized audit logger', async () => {
      const spy = jest.spyOn(auditLogger, 'log')

      await logAuthEvent({
        action: 'LOGIN',
        userId: 'user-1',
        userEmail: 'test@example.com',
        ipAddress: '1.2.3.4',
        userAgent: 'Mozilla/5.0',
        success: true,
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'AUTH',
          action: 'AUTH_LOGIN',
          userId: 'user-1',
          severity: 'INFO',
          metadata: expect.objectContaining({
            userEmail: 'test@example.com',
            success: true,
            ipAddress: '1.2.3.4',
          }),
        }),
      )

      spy.mockRestore()
    })

    it('should log a failed login with ERROR severity', async () => {
      const spy = jest.spyOn(auditLogger, 'log')

      await logAuthEvent({
        action: 'LOGIN',
        userId: 'user-1',
        success: false,
        reason: 'Invalid password',
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'ERROR',
          metadata: expect.objectContaining({
            success: false,
            reason: 'Invalid password',
          }),
        }),
      )

      spy.mockRestore()
    })

    it('should log RATE_LIMITED events with WARNING severity', async () => {
      const spy = jest.spyOn(auditLogger, 'log')

      await logAuthEvent({
        action: 'RATE_LIMITED',
        userId: 'user-1',
        success: false,
        reason: 'Too many attempts',
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'WARNING',
        }),
      )

      spy.mockRestore()
    })

    it('should log LOGOUT events with INFO severity', async () => {
      const spy = jest.spyOn(auditLogger, 'log')

      await logAuthEvent({
        action: 'LOGOUT',
        userId: 'user-1',
        success: true,
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'INFO',
          action: 'AUTH_LOGOUT',
        }),
      )

      spy.mockRestore()
    })

    it('should log SIGNUP events', async () => {
      const spy = jest.spyOn(auditLogger, 'log')

      await logAuthEvent({
        action: 'SIGNUP',
        userId: 'user-new',
        userEmail: 'new@example.com',
        success: true,
        metadata: { country: 'ZA' },
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'AUTH_SIGNUP',
          metadata: expect.objectContaining({
            country: 'ZA',
          }),
        }),
      )

      spy.mockRestore()
    })

    it('should not throw even if audit logger fails', async () => {
      const spy = jest.spyOn(auditLogger, 'log').mockRejectedValueOnce(new Error('Sink down'))

      // Should not throw
      await expect(
        logAuthEvent({ action: 'LOGIN', userId: 'u1', success: true }),
      ).resolves.toBeUndefined()

      spy.mockRestore()
    })
  })

  describe('getAuthAuditTrail', () => {
    it('should return auth events for a user', async () => {
      // Seed some events
      await logAuthEvent({ action: 'LOGIN', userId: 'trail-user', success: true })
      await logAuthEvent({ action: 'LOGOUT', userId: 'trail-user', success: true })

      const trail = await getAuthAuditTrail('trail-user')
      expect(trail.length).toBeGreaterThanOrEqual(2)
      expect(trail.every((e: any) => e.userId === 'trail-user')).toBe(true)
    })

    it('should return empty array for unknown user', async () => {
      const trail = await getAuthAuditTrail('nonexistent-user-xyz')
      expect(trail).toEqual([])
    })
  })

  describe('detectSuspiciousActivity', () => {
    it('should return not suspicious for a normal user', async () => {
      const result = await detectSuspiciousActivity('normal-user-999')
      expect(result.isSuspicious).toBe(false)
    })

    it('should detect failed login spikes', async () => {
      const userId = 'suspicious-user-spike'
      // Seed many failed logins
      for (let i = 0; i < 6; i++) {
        await logAuthEvent({
          action: 'LOGIN',
          userId,
          success: false,
          reason: 'Invalid password',
          ipAddress: '10.0.0.1',
        })
      }

      const result = await detectSuspiciousActivity(userId)
      expect(result.isSuspicious).toBe(true)
      expect(result.reason).toContain('failed login attempts')
      expect(result.failedAttempts).toBeGreaterThanOrEqual(5)
    })

    it('should detect multiple IP addresses', async () => {
      const userId = 'suspicious-user-multi-ip'
      // Seed logins from different IPs
      for (let i = 0; i < 4; i++) {
        await logAuthEvent({
          action: 'LOGIN',
          userId,
          success: true,
          ipAddress: `10.0.0.${i + 1}`,
        })
      }

      const result = await detectSuspiciousActivity(userId)
      expect(result.isSuspicious).toBe(true)
      expect(result.reason).toContain('distinct IPs')
    })
  })
})
