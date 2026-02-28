/** @jest-environment node */

import { ConstitutionalCore, Constitution } from '@/lib/services/constitutional-core'
import { resetSingleton } from '../../helpers/reset-singleton'

describe('ConstitutionalCore', () => {
  let core: ConstitutionalCore

  beforeEach(() => {
    resetSingleton(ConstitutionalCore)
    core = ConstitutionalCore.getInstance()
  })

  afterEach(() => {
    resetSingleton(ConstitutionalCore)
  })

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const a = ConstitutionalCore.getInstance()
      const b = ConstitutionalCore.getInstance()
      expect(a).toBe(b)
    })
  })

  describe('Constitution object', () => {
    it('should define principles array', () => {
      expect(Array.isArray(Constitution.principles)).toBe(true)
      expect(Constitution.principles.length).toBeGreaterThan(0)
    })

    it('should include safety, privacy, quality, and intent principles', () => {
      const text = Constitution.principles.join(' ').toLowerCase()
      expect(text).toContain('harmful')
      expect(text).toContain('privacy')
      expect(text).toContain('quality')
      expect(text).toContain('user intent')
    })
  })

  describe('evaluateAction', () => {
    it('should approve a safe action', async () => {
      const verdict = await core.evaluateAction('Create a new React component', 'agent')
      expect(verdict.approved).toBe(true)
      expect(verdict.reasoning).toBeDefined()
      expect(verdict.vetoId).toBeUndefined()
    })

    it('should reject "delete database" as harmful', async () => {
      const verdict = await core.evaluateAction('delete database tables', 'agent')
      expect(verdict.approved).toBe(false)
      expect(verdict.reasoning).toContain('safety')
      expect(verdict.vetoId).toBeDefined()
      expect(verdict.vetoId).toMatch(/^VETO-/)
    })

    it('should reject "rm -rf" as harmful', async () => {
      const verdict = await core.evaluateAction('rm -rf / to clean up', 'agent')
      expect(verdict.approved).toBe(false)
      expect(verdict.reasoning).toContain('safety')
    })

    it('should be case-insensitive for harmful detection', async () => {
      const verdict = await core.evaluateAction('DELETE DATABASE now', 'agent')
      expect(verdict.approved).toBe(false)
    })

    it('should return proper verdict structure', async () => {
      const verdict = await core.evaluateAction('safe action', 'context')
      expect(verdict).toHaveProperty('approved')
      expect(verdict).toHaveProperty('reasoning')
      expect(typeof verdict.approved).toBe('boolean')
      expect(typeof verdict.reasoning).toBe('string')
    })
  })
})
