/** @jest-environment node */

import {
  ConstitutionalAI,
  ConstitutionalArticle,
  UserActionType,
  type UserAction,
} from '@/lib/services/constitutional-ai'

describe('ConstitutionalAI Service', () => {
  let service: ConstitutionalAI

  beforeEach(() => {
    service = new ConstitutionalAI()
  })

  describe('verifyAction', () => {
    it('should allow compliant actions with high score', async () => {
      const action: UserAction = {
        id: 'test-1',
        userId: 'user-1',
        type: UserActionType.AI_QUERY,
        payload: { query: 'help me learn', explainable: true },
        timestamp: new Date(),
        sessionId: 'session-1',
      }

      const result = await service.verifyAction(action)

      expect(result.allowed).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(95)
      expect(result.auditId).toBeDefined()
    })

    it('should block actions with critical violations', async () => {
      const action: UserAction = {
        id: 'test-2',
        userId: 'user-1',
        type: UserActionType.DATA_EXPORT,
        payload: { includePersonalData: true, userConsent: false },
        timestamp: new Date(),
        sessionId: 'session-1',
      }

      const result = await service.verifyAction(action)

      expect(result.allowed).toBe(false)
      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations[0].severity).toBe('CRITICAL')
    })

    it('should detect stub/placeholder code as Truth Verification violation', async () => {
      const action: UserAction = {
        id: 'test-3',
        userId: 'user-1',
        type: UserActionType.CODE_EDIT,
        payload: { content: '// TODO implement this stub function' },
        timestamp: new Date(),
        sessionId: 'session-1',
      }

      const result = await service.verifyAction(action)

      const truthViolation = result.violations.find(
        (v) => v.article === ConstitutionalArticle.TRUTH_VERIFICATION
      )
      expect(truthViolation).toBeDefined()
      expect(truthViolation?.section).toBe('8.3')
    })

    it('should flag deployment without constitutional audit', async () => {
      const action: UserAction = {
        id: 'test-4',
        userId: 'user-1',
        type: UserActionType.PROJECT_DEPLOY,
        payload: { hasConstitutionalAudit: false },
        timestamp: new Date(),
        sessionId: 'session-1',
      }

      const result = await service.verifyAction(action)

      const enforcementViolation = result.violations.find(
        (v) => v.article === ConstitutionalArticle.ENFORCEMENT_COMPLIANCE
      )
      expect(enforcementViolation).toBeDefined()
    })
  })

  describe('checkCompliance', () => {
    it('should return 100 score when no actions logged', async () => {
      const compliance = await service.checkCompliance('user-1')

      expect(compliance.overall).toBe(100)
      expect(compliance.trend).toBe('STABLE')
    })

    it('should track compliance across multiple actions', async () => {
      // Log some compliant actions
      for (let i = 0; i < 3; i++) {
        await service.verifyAction({
          id: `multi-${i}`,
          userId: 'user-2',
          type: UserActionType.AI_QUERY,
          payload: { query: 'test', explainable: true },
          timestamp: new Date(),
          sessionId: 'session-1',
        })
      }

      const compliance = await service.checkCompliance('user-2')
      expect(compliance.overall).toBeGreaterThanOrEqual(95)
    })
  })

  describe('healViolation', () => {
    it('should auto-heal Ubuntu violation by adding community reviewer', async () => {
      const action: UserAction = {
        id: 'heal-1',
        userId: 'user-1',
        type: UserActionType.PROJECT_CREATE,
        payload: { isPrivate: true },
        timestamp: new Date(),
        sessionId: 'session-1',
      }

      const result = await service.verifyAction(action)
      const ubuntuViolation = result.violations.find(
        (v) => v.article === ConstitutionalArticle.FOUNDATIONAL_PRINCIPLES
      )

      if (ubuntuViolation) {
        const healed = await service.healViolation(ubuntuViolation, action)
        expect(healed).toBe(true)
        expect(action.payload.collaborators).toContain('community-reviewer')
      }
    })
  })
})
