/**
 * Runtime Constitutional Rule Engine (E1/B8)
 *
 * Evaluates actions against CONSTITUTION.md articles in real-time using a
 * data-driven rule registry. Each rule maps to a specific Constitutional
 * Article + Section and provides:
 *   - A predicate that inspects the action payload
 *   - Severity, principle text, and remediation guidance
 *
 * The engine supports dynamic rule addition, per-profile thresholds, and
 * alignment scoring that feeds into the compliance dashboard (E2).
 */

import {
  ConstitutionalArticle,
  type UserAction,
  type ConstitutionalViolation,
  UserActionType,
} from '../services/constitutional-ai'

// ── Rule Definition ──────────────────────────────────────────────────

export interface ConstitutionalRule {
  id: string
  article: ConstitutionalArticle
  section: string
  principle: string
  severity: ConstitutionalViolation['severity']
  /** Return a non-empty array of violation descriptions if the rule is breached. */
  evaluate: (action: UserAction) => string[]
  /** Remediation steps when the rule fires. */
  remediation: string[]
  /** Whether the rule is currently active. */
  enabled: boolean
}

export type ValidationProfile = 'STRICT' | 'STANDARD' | 'LENIENT' | 'DEVELOPMENT'

interface ProfileConfig {
  /** Minimum score to pass (0-100). */
  threshold: number
  /** Disabled rule IDs for this profile. */
  disabledRules: string[]
}

const PROFILE_CONFIGS: Record<ValidationProfile, ProfileConfig> = {
  STRICT: { threshold: 95, disabledRules: [] },
  STANDARD: { threshold: 85, disabledRules: [] },
  LENIENT: { threshold: 70, disabledRules: ['TRUTH_NO_MOCK'] },
  DEVELOPMENT: { threshold: 50, disabledRules: ['TRUTH_NO_MOCK', 'ENFORCEMENT_AUDIT'] },
}

// ── Built-in Rules ───────────────────────────────────────────────────

const BUILT_IN_RULES: ConstitutionalRule[] = [
  // Article I – Ubuntu / Foundational Principles
  {
    id: 'UBUNTU_COLLABORATION',
    article: ConstitutionalArticle.FOUNDATIONAL_PRINCIPLES,
    section: '1.1',
    principle: 'Individual Success = f(Collective Success)',
    severity: 'MEDIUM',
    evaluate: (action) => {
      if (action.type === UserActionType.PROJECT_CREATE) {
        const p = action.payload as { isPrivate?: boolean; collaborators?: string[] }
        if (p.isPrivate && (!p.collaborators || p.collaborators.length === 0)) {
          return ['Private project created without collaborators']
        }
      }
      return []
    },
    remediation: ['Add at least one collaborator', 'Consider open-sourcing the project'],
    enabled: true,
  },

  // Article II – Rights & Freedoms
  {
    id: 'RIGHTS_DATA_CONSENT',
    article: ConstitutionalArticle.RIGHTS_FREEDOMS,
    section: '2.1',
    principle: 'Sovereignty – Control over personal data',
    severity: 'CRITICAL',
    evaluate: (action) => {
      if (action.type === UserActionType.DATA_EXPORT) {
        const p = action.payload as { includePersonalData?: boolean; userConsent?: boolean }
        if (p.includePersonalData && !p.userConsent) {
          return ['Data export without user consent']
        }
      }
      return []
    },
    remediation: ['Obtain explicit user consent before exporting personal data'],
    enabled: true,
  },

  // Article III – Economic Constitution
  {
    id: 'ECONOMIC_FAIR_SHARE',
    article: ConstitutionalArticle.ECONOMIC_CONSTITUTION,
    section: '3.2',
    principle: 'Fair Distribution – Network effects benefit all participants',
    severity: 'MEDIUM',
    evaluate: (action) => {
      if (action.type === UserActionType.MARKETPLACE_PUBLISH) {
        const p = action.payload as { revenueSharing?: number }
        if (p.revenueSharing !== undefined && p.revenueSharing < 0.1) {
          return ['Revenue sharing below minimum 10% threshold']
        }
      }
      return []
    },
    remediation: ['Set revenue sharing to at least 10%'],
    enabled: true,
  },

  // Article V – Technological Constitution
  {
    id: 'TECH_EXPLAINABLE_AI',
    article: ConstitutionalArticle.TECHNOLOGICAL_CONSTITUTION,
    section: '5.1',
    principle: 'Transparency – Explainable decision-making',
    severity: 'HIGH',
    evaluate: (action) => {
      if (action.type === UserActionType.AI_QUERY) {
        const p = action.payload as { explainable?: boolean }
        if (p.explainable === false) {
          return ['AI query without explainability flag']
        }
      }
      return []
    },
    remediation: ['Enable explainable AI for all queries'],
    enabled: true,
  },

  // Article VI – Governance
  {
    id: 'GOVERNANCE_AUDIT_TRAIL',
    article: ConstitutionalArticle.GOVERNANCE_STRUCTURE,
    section: '6.2',
    principle: 'All governance actions publicly auditable',
    severity: 'HIGH',
    evaluate: (action) => {
      if (action.type === UserActionType.SETTINGS_CHANGE) {
        const p = action.payload as { isSystemWide?: boolean; auditTrail?: boolean }
        if (p.isSystemWide && !p.auditTrail) {
          return ['System-wide change without audit trail']
        }
      }
      return []
    },
    remediation: ['Enable audit logging for system-wide changes'],
    enabled: true,
  },

  // Article VII – Security & Protection
  {
    id: 'SECURITY_BACKUP',
    article: ConstitutionalArticle.SECURITY_PROTECTION,
    section: '7.1',
    principle: 'Maintain system integrity and availability',
    severity: 'MEDIUM',
    evaluate: (action) => {
      if (action.type === UserActionType.FILE_DELETE) {
        const p = action.payload as { hasBackup?: boolean; isRecoverable?: boolean }
        if (!p.hasBackup && !p.isRecoverable) {
          return ['File deletion without backup or recovery mechanism']
        }
      }
      return []
    },
    remediation: ['Create backup before deletion', 'Enable soft-delete'],
    enabled: true,
  },

  // Article VIII – Truth & Verification (No Mock Protocol)
  {
    id: 'TRUTH_NO_MOCK',
    article: ConstitutionalArticle.TRUTH_VERIFICATION,
    section: '8.3',
    principle: 'No Mock Protocol – Absolute prohibition of stubs and placeholders',
    severity: 'CRITICAL',
    evaluate: (action) => {
      if (
        action.type === UserActionType.CODE_EDIT ||
        action.type === UserActionType.FILE_CREATE
      ) {
        const p = action.payload as { content?: string; fileName?: string }
        const patterns = [/stub/i, /placeholder/i, /fake/i, /dummy/i, /TODO/i, /FIXME/i]
        const matches = patterns.filter(
          (pat) => p.content?.match(pat) || p.fileName?.match(pat),
        )
        return matches.map((pat) => `Prohibited pattern detected: ${pat.source}`)
      }
      return []
    },
    remediation: ['Replace stubs with real implementations', 'Remove placeholder code'],
    enabled: true,
  },

  // Article IX – Enforcement & Compliance
  {
    id: 'ENFORCEMENT_AUDIT',
    article: ConstitutionalArticle.ENFORCEMENT_COMPLIANCE,
    section: '9.1',
    principle: 'All services must undergo constitutional audits',
    severity: 'CRITICAL',
    evaluate: (action) => {
      if (action.type === UserActionType.PROJECT_DEPLOY) {
        const p = action.payload as { hasConstitutionalAudit?: boolean; complianceScore?: number }
        if (!p.hasConstitutionalAudit) {
          return ['Deployment attempted without constitutional audit']
        }
        if (p.complianceScore !== undefined && p.complianceScore < 95) {
          return [`Compliance score ${p.complianceScore}% below required 95%`]
        }
      }
      return []
    },
    remediation: ['Run constitutional audit before deployment', 'Achieve 95%+ compliance'],
    enabled: true,
  },

  // Article XI – Emergency Provisions
  {
    id: 'EMERGENCY_TRANSPARENCY',
    article: ConstitutionalArticle.EMERGENCY_PROVISIONS,
    section: '11.1',
    principle: 'Emergency actions must be proportional with full transparency',
    severity: 'HIGH',
    evaluate: (action) => {
      const p = action.payload as { isEmergency?: boolean; justification?: string; timeLimit?: number }
      if (p.isEmergency && (!p.justification || !p.timeLimit)) {
        return ['Emergency action without justification or time limit']
      }
      return []
    },
    remediation: ['Provide clear justification', 'Set time-bounded limits'],
    enabled: true,
  },
]

// ── Severity Penalties ───────────────────────────────────────────────

const SEVERITY_PENALTY: Record<ConstitutionalViolation['severity'], number> = {
  CRITICAL: 25,
  HIGH: 15,
  MEDIUM: 8,
  LOW: 3,
}

// ── Engine ────────────────────────────────────────────────────────────

export class ConstitutionalRuleEngine {
  private rules: ConstitutionalRule[]
  private profile: ValidationProfile

  constructor(profile: ValidationProfile = 'STANDARD') {
    this.rules = [...BUILT_IN_RULES]
    this.profile = profile
  }

  /** Add a custom rule at runtime. */
  addRule(rule: ConstitutionalRule): void {
    this.rules.push(rule)
  }

  /** Remove a rule by ID. */
  removeRule(ruleId: string): boolean {
    const before = this.rules.length
    this.rules = this.rules.filter((r) => r.id !== ruleId)
    return this.rules.length < before
  }

  /** Enable or disable a rule by ID. */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (rule) {
      rule.enabled = enabled
      return true
    }
    return false
  }

  /** Update the validation profile. */
  setProfile(profile: ValidationProfile): void {
    this.profile = profile
  }

  getProfile(): ValidationProfile {
    return this.profile
  }

  /** Return the list of registered rules. */
  getRules(): Readonly<ConstitutionalRule[]> {
    return this.rules
  }

  /**
   * Evaluate an action against all active rules and return violations.
   */
  evaluate(action: UserAction): ConstitutionalViolation[] {
    const profileCfg = PROFILE_CONFIGS[this.profile]
    const violations: ConstitutionalViolation[] = []

    for (const rule of this.rules) {
      if (!rule.enabled) continue
      if (profileCfg.disabledRules.includes(rule.id)) continue

      try {
        const issues = rule.evaluate(action)
        for (const desc of issues) {
          violations.push({
            article: rule.article,
            section: rule.section,
            principle: rule.principle,
            severity: rule.severity,
            description: desc,
            remediation: rule.remediation,
          })
        }
      } catch (err) {
        // Individual rule failure must not break the engine (fail-safe)
        console.error(`[ConstitutionalRuleEngine] Rule ${rule.id} threw:`, err)
      }
    }

    return violations
  }

  /**
   * Compute alignment score from violations.
   */
  computeScore(violations: ConstitutionalViolation[]): number {
    let score = 100
    for (const v of violations) {
      score -= SEVERITY_PENALTY[v.severity] ?? 0
    }
    return Math.max(0, score)
  }

  /**
   * Full evaluation: returns violations, score, and pass/fail verdict.
   */
  evaluateWithVerdict(action: UserAction): {
    violations: ConstitutionalViolation[]
    score: number
    allowed: boolean
    profile: ValidationProfile
  } {
    const violations = this.evaluate(action)
    const score = this.computeScore(violations)
    const threshold = PROFILE_CONFIGS[this.profile].threshold
    const hasCritical = violations.some((v) => v.severity === 'CRITICAL')
    const allowed = score >= threshold && !hasCritical

    return { violations, score, allowed, profile: this.profile }
  }

  /**
   * Constitutional Alignment Scoring (E2) – compute per-article scores.
   */
  computeAlignmentScores(violations: ConstitutionalViolation[]): Record<string, number> {
    const scores: Record<string, number> = {}
    for (const article of Object.values(ConstitutionalArticle)) {
      scores[article] = 100
    }
    for (const v of violations) {
      scores[v.article] = Math.max(0, (scores[v.article] ?? 100) - SEVERITY_PENALTY[v.severity])
    }
    return scores
  }
}

// ── Singleton ─────────────────────────────────────────────────────────

const defaultProfile: ValidationProfile =
  (process.env.CONSTITUTIONAL_PROFILE as ValidationProfile) || 'STANDARD'

export const constitutionalRuleEngine = new ConstitutionalRuleEngine(defaultProfile)
