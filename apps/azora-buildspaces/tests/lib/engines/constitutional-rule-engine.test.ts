/** @jest-environment node */

import {
  ConstitutionalRuleEngine,
  type ConstitutionalRule,
  type ValidationProfile,
} from '@/lib/engines/constitutional-rule-engine'
import {
  ConstitutionalArticle,
  UserActionType,
  type UserAction,
} from '@/lib/services/constitutional-ai'

function makeAction(overrides: Partial<UserAction> = {}): UserAction {
  return {
    id: 'test-action',
    userId: 'user-1',
    type: UserActionType.AI_QUERY,
    payload: { explainable: true },
    timestamp: new Date(),
    sessionId: 'session-1',
    ...overrides,
  }
}

describe('ConstitutionalRuleEngine', () => {
  let engine: ConstitutionalRuleEngine

  beforeEach(() => {
    engine = new ConstitutionalRuleEngine('STANDARD')
  })

  describe('evaluate', () => {
    it('should return no violations for a compliant action', () => {
      const action = makeAction()
      const violations = engine.evaluate(action)
      expect(violations).toEqual([])
    })

    it('should detect Ubuntu collaboration violation', () => {
      const action = makeAction({
        type: UserActionType.PROJECT_CREATE,
        payload: { isPrivate: true },
      })
      const violations = engine.evaluate(action)
      const ubuntu = violations.find((v) => v.article === ConstitutionalArticle.FOUNDATIONAL_PRINCIPLES)
      expect(ubuntu).toBeDefined()
      expect(ubuntu!.section).toBe('1.1')
    })

    it('should detect data consent violation (CRITICAL)', () => {
      const action = makeAction({
        type: UserActionType.DATA_EXPORT,
        payload: { includePersonalData: true, userConsent: false },
      })
      const violations = engine.evaluate(action)
      expect(violations.some((v) => v.severity === 'CRITICAL')).toBe(true)
    })

    it('should detect Truth No-Mock Protocol violation', () => {
      const action = makeAction({
        type: UserActionType.CODE_EDIT,
        payload: { content: 'function stub() { /* TODO implement */ }' },
      })
      const violations = engine.evaluate(action)
      const truth = violations.find((v) => v.article === ConstitutionalArticle.TRUTH_VERIFICATION)
      expect(truth).toBeDefined()
      expect(truth!.section).toBe('8.3')
    })

    it('should detect standalone TODO comments', () => {
      const action = makeAction({
        type: UserActionType.CODE_EDIT,
        payload: { content: '// TODO: add validation later' },
      })
      const violations = engine.evaluate(action)
      expect(violations.some((v) => v.article === ConstitutionalArticle.TRUTH_VERIFICATION)).toBe(true)
    })

    it('should detect deployment without audit', () => {
      const action = makeAction({
        type: UserActionType.PROJECT_DEPLOY,
        payload: { hasConstitutionalAudit: false },
      })
      const violations = engine.evaluate(action)
      expect(violations.some((v) => v.article === ConstitutionalArticle.ENFORCEMENT_COMPLIANCE)).toBe(true)
    })

    it('should detect emergency action without justification', () => {
      const action = makeAction({
        payload: { isEmergency: true },
      })
      const violations = engine.evaluate(action)
      expect(violations.some((v) => v.article === ConstitutionalArticle.EMERGENCY_PROVISIONS)).toBe(true)
    })
  })

  describe('computeScore', () => {
    it('should return 100 when no violations', () => {
      expect(engine.computeScore([])).toBe(100)
    })

    it('should apply correct penalties', () => {
      const violations = [
        { article: ConstitutionalArticle.RIGHTS_FREEDOMS, section: '2.1', principle: 'test', severity: 'CRITICAL' as const, description: 'test', remediation: [] },
        { article: ConstitutionalArticle.FOUNDATIONAL_PRINCIPLES, section: '1.1', principle: 'test', severity: 'LOW' as const, description: 'test', remediation: [] },
      ]
      // 100 - 25 (CRITICAL) - 3 (LOW) = 72
      expect(engine.computeScore(violations)).toBe(72)
    })

    it('should never return below 0', () => {
      const violations = Array(10).fill({
        article: ConstitutionalArticle.RIGHTS_FREEDOMS,
        section: '2.1',
        principle: 'test',
        severity: 'CRITICAL' as const,
        description: 'test',
        remediation: [],
      })
      expect(engine.computeScore(violations)).toBe(0)
    })
  })

  describe('evaluateWithVerdict', () => {
    it('should allow compliant actions under STANDARD profile', () => {
      const action = makeAction()
      const result = engine.evaluateWithVerdict(action)
      expect(result.allowed).toBe(true)
      expect(result.score).toBe(100)
      expect(result.profile).toBe('STANDARD')
    })

    it('should block actions with CRITICAL violations', () => {
      const action = makeAction({
        type: UserActionType.DATA_EXPORT,
        payload: { includePersonalData: true, userConsent: false },
      })
      const result = engine.evaluateWithVerdict(action)
      expect(result.allowed).toBe(false)
    })
  })

  describe('profiles', () => {
    it('should skip TRUTH_NO_MOCK rule under DEVELOPMENT profile', () => {
      const devEngine = new ConstitutionalRuleEngine('DEVELOPMENT')
      const action = makeAction({
        type: UserActionType.CODE_EDIT,
        payload: { content: 'function stub(){}' },
      })
      const violations = devEngine.evaluate(action)
      expect(violations.find((v) => v.article === ConstitutionalArticle.TRUTH_VERIFICATION)).toBeUndefined()
    })

    it('should enforce all rules under STRICT profile', () => {
      const strictEngine = new ConstitutionalRuleEngine('STRICT')
      const action = makeAction({
        type: UserActionType.CODE_EDIT,
        payload: { content: 'this is a placeholder' },
      })
      const violations = strictEngine.evaluate(action)
      expect(violations.length).toBeGreaterThan(0)
    })
  })

  describe('dynamic rules', () => {
    it('should allow adding a custom rule', () => {
      const customRule: ConstitutionalRule = {
        id: 'CUSTOM_TEST_RULE',
        article: ConstitutionalArticle.FINAL_PROVISIONS,
        section: '12.99',
        principle: 'Test principle',
        severity: 'LOW',
        evaluate: () => ['custom violation'],
        remediation: ['fix it'],
        enabled: true,
      }

      engine.addRule(customRule)
      const action = makeAction()
      const violations = engine.evaluate(action)
      expect(violations.find((v) => v.section === '12.99')).toBeDefined()
    })

    it('should allow removing a rule', () => {
      expect(engine.removeRule('UBUNTU_COLLABORATION')).toBe(true)
      const action = makeAction({
        type: UserActionType.PROJECT_CREATE,
        payload: { isPrivate: true },
      })
      const violations = engine.evaluate(action)
      expect(violations.find((v) => v.section === '1.1')).toBeUndefined()
    })

    it('should allow disabling a rule', () => {
      expect(engine.setRuleEnabled('UBUNTU_COLLABORATION', false)).toBe(true)
      const action = makeAction({
        type: UserActionType.PROJECT_CREATE,
        payload: { isPrivate: true },
      })
      const violations = engine.evaluate(action)
      expect(violations.find((v) => v.section === '1.1')).toBeUndefined()
    })
  })

  describe('computeAlignmentScores', () => {
    it('should return 100 for all articles when no violations', () => {
      const scores = engine.computeAlignmentScores([])
      for (const article of Object.values(ConstitutionalArticle)) {
        expect(scores[article]).toBe(100)
      }
    })

    it('should penalize the correct article', () => {
      const violations = [
        {
          article: ConstitutionalArticle.RIGHTS_FREEDOMS,
          section: '2.1',
          principle: 'test',
          severity: 'CRITICAL' as const,
          description: 'test',
          remediation: [],
        },
      ]
      const scores = engine.computeAlignmentScores(violations)
      expect(scores[ConstitutionalArticle.RIGHTS_FREEDOMS]).toBe(75)
      expect(scores[ConstitutionalArticle.FOUNDATIONAL_PRINCIPLES]).toBe(100)
    })
  })
})
