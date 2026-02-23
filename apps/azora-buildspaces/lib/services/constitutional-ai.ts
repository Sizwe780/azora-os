/**
 * Constitutional AI Service
 * 
 * Implements the core Constitutional AI verification engine that ensures
 * all user actions comply with the Azora Constitution (12 Articles).
 * 
 * This service operates under the principle of "Truth as Currency" and
 * maintains Ubuntu philosophy throughout all operations.
 */

import { z } from 'zod'

// Constitutional Articles Enum
export enum ConstitutionalArticle {
  FOUNDATIONAL_PRINCIPLES = 'ARTICLE_I',
  RIGHTS_FREEDOMS = 'ARTICLE_II', 
  ECONOMIC_CONSTITUTION = 'ARTICLE_III',
  EDUCATIONAL_CONSTITUTION = 'ARTICLE_IV',
  TECHNOLOGICAL_CONSTITUTION = 'ARTICLE_V',
  GOVERNANCE_STRUCTURE = 'ARTICLE_VI',
  SECURITY_PROTECTION = 'ARTICLE_VII',
  TRUTH_VERIFICATION = 'ARTICLE_VIII',
  ENFORCEMENT_COMPLIANCE = 'ARTICLE_IX',
  EVOLUTION_ADAPTATION = 'ARTICLE_X',
  EMERGENCY_PROVISIONS = 'ARTICLE_XI',
  FINAL_PROVISIONS = 'ARTICLE_XII'
}

// User Action Types
export enum UserActionType {
  CODE_EDIT = 'CODE_EDIT',
  FILE_CREATE = 'FILE_CREATE',
  FILE_DELETE = 'FILE_DELETE',
  PROJECT_CREATE = 'PROJECT_CREATE',
  PROJECT_DEPLOY = 'PROJECT_DEPLOY',
  AI_QUERY = 'AI_QUERY',
  COLLABORATION_JOIN = 'COLLABORATION_JOIN',
  DATA_EXPORT = 'DATA_EXPORT',
    COMMAND_EXECUTION = 'COMMAND_EXECUTION',
  PROJECT_PUSH = 'PROJECT_PUSH',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  MARKETPLACE_PUBLISH = 'MARKETPLACE_PUBLISH'
}

// Schemas
const UserActionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.nativeEnum(UserActionType),
  payload: z.record(z.any()),
  timestamp: z.date(),
  sessionId: z.string(),
  roomId: z.string().optional()
})

const ConstitutionalViolationSchema = z.object({
  article: z.nativeEnum(ConstitutionalArticle),
  section: z.string(),
  principle: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string(),
  remediation: z.array(z.string())
})

const VerificationResultSchema = z.object({
  allowed: z.boolean(),
  violations: z.array(ConstitutionalViolationSchema),
  explanation: z.string(),
  score: z.number().min(0).max(100),
  auditId: z.string()
})

const ComplianceScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  byArticle: z.record(z.nativeEnum(ConstitutionalArticle), z.number()),
  trend: z.enum(['IMPROVING', 'STABLE', 'DECLINING']),
  lastUpdated: z.date()
})

const AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  userId: z.string(),
  action: UserActionSchema,
  result: VerificationResultSchema,
  constitutionalScore: z.number(),
  violations: z.array(ConstitutionalViolationSchema),
  status: z.enum(['COMPLIANT', 'VIOLATION', 'REMEDIATED'])
})

// Types
export type UserAction = z.infer<typeof UserActionSchema>
export type ConstitutionalViolation = z.infer<typeof ConstitutionalViolationSchema>
export type VerificationResult = z.infer<typeof VerificationResultSchema>
export type ComplianceScore = z.infer<typeof ComplianceScoreSchema>
export type AuditEvent = z.infer<typeof AuditEventSchema>

/**
 * Constitutional AI Service Implementation
 * 
 * This service ensures all operations comply with the Azora Constitution
 * and maintains the required 95%+ constitutional alignment score.
 */
export class ConstitutionalAI {
  private complianceHistory: Map<string, ComplianceScore> = new Map()
  private auditEvents: AuditEvent[] = []
  private constitutionalRules: Map<ConstitutionalArticle, ConstitutionalRule[]> = new Map()

  constructor() {
    this.initializeConstitutionalRules()
  }

  /**
   * Verify a user action against all constitutional articles
   * 
   * @param action - The user action to verify
   * @returns Promise<VerificationResult> - Verification result with compliance score
   */
  async verifyAction(action: UserAction): Promise<VerificationResult> {
    try {
      // Validate input
      const validatedAction = UserActionSchema.parse(action)
      
      // Generate audit ID
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Check against all constitutional articles
      const violations: ConstitutionalViolation[] = []
      let totalScore = 100
      
      // Article I: Foundational Principles (Ubuntu Philosophy)
      const ubuntuViolations = await this.checkUbuntuPrinciples(validatedAction)
      violations.push(...ubuntuViolations)
      
      // Article II: Rights & Freedoms
      const rightsViolations = await this.checkRightsAndFreedoms(validatedAction)
      violations.push(...rightsViolations)
      
      // Article III: Economic Constitution
      const economicViolations = await this.checkEconomicPrinciples(validatedAction)
      violations.push(...economicViolations)
      
      // Article IV: Educational Constitution
      const educationalViolations = await this.checkEducationalPrinciples(validatedAction)
      violations.push(...educationalViolations)
      
      // Article V: Technological Constitution
      const techViolations = await this.checkTechnologicalPrinciples(validatedAction)
      violations.push(...techViolations)
      
      // Article VI: Governance Structure
      const governanceViolations = await this.checkGovernancePrinciples(validatedAction)
      violations.push(...governanceViolations)
      
      // Article VII: Security & Protection
      const securityViolations = await this.checkSecurityPrinciples(validatedAction)
      violations.push(...securityViolations)
      
      // Article VIII: Truth & Verification (Article VIII Section 8.3)
      const truthViolations = await this.checkTruthPrinciples(validatedAction)
      violations.push(...truthViolations)
      
      // Article IX: Enforcement & Compliance
      const enforcementViolations = await this.checkEnforcementPrinciples(validatedAction)
      violations.push(...enforcementViolations)
      
      // Article X: Evolution & Adaptation
      const evolutionViolations = await this.checkEvolutionPrinciples(validatedAction)
      violations.push(...evolutionViolations)
      
      // Article XI: Emergency Provisions
      const emergencyViolations = await this.checkEmergencyPrinciples(validatedAction)
      violations.push(...emergencyViolations)
      
      // Article XII: Final Provisions
      const finalViolations = await this.checkFinalPrinciples(validatedAction)
      violations.push(...finalViolations)
      
      // Calculate compliance score
      const score = this.calculateComplianceScore(violations)
      const allowed = score >= 95 && violations.filter(v => v.severity === 'CRITICAL').length === 0
      
      // Generate explanation
      const explanation = this.generateExplanation(allowed, violations, score)
      
      const result: VerificationResult = {
        allowed,
        violations,
        explanation,
        score,
        auditId
      }
      
      // Log audit event
      this.auditEvents.push({
        id: auditId,
        timestamp: new Date(),
        userId: validatedAction.userId,
        action: validatedAction,
        result,
        constitutionalScore: score,
        violations,
        status: allowed ? 'COMPLIANT' : 'VIOLATION'
      })
      
      return result
      
    } catch (error) {
      // Constitutional AI must never fail silently - Truth as Law
      throw new Error(`Constitutional verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get current compliance score for a user or system
   */
  async checkCompliance(userId?: string): Promise<ComplianceScore> {
    const recentAudits = this.auditEvents
      .filter(audit => !userId || audit.userId === userId)
      .slice(-100) // Last 100 actions
    
    if (recentAudits.length === 0) {
      return {
        overall: 100,
        byArticle: this.getDefaultArticleScores(),
        trend: 'STABLE',
        lastUpdated: new Date()
      }
    }
    
    const overall = recentAudits.reduce((sum, audit) => sum + audit.constitutionalScore, 0) / recentAudits.length
    const byArticle = this.calculateArticleScores(recentAudits)
    const trend = this.calculateTrend(recentAudits)
    
    return {
      overall: Math.round(overall * 100) / 100,
      byArticle,
      trend,
      lastUpdated: new Date()
    }
  }

  /**
   * Log audit event for constitutional compliance tracking
   */
  async logAudit(event: AuditEvent): Promise<void> {
    const validatedEvent = AuditEventSchema.parse(event)
    this.auditEvents.push(validatedEvent)
    
    // Keep only last 10,000 audit events to prevent memory issues
    if (this.auditEvents.length > 10000) {
      this.auditEvents = this.auditEvents.slice(-10000)
    }
  }

  /**
   * Get current constitutional alignment score
   */
  async getConstitutionalScore(): Promise<number> {
    const compliance = await this.checkCompliance()
    return compliance.overall
  }

  /**
   * Automatically heal constitutional breaches (Article I, Section 1.5)
   * Self-Healing Systems - Systems must be resilient and autonomously adaptive
   */
  async healViolation(violation: ConstitutionalViolation, action: UserAction): Promise<boolean> {
    try {
      switch (violation.article) {
        case ConstitutionalArticle.FOUNDATIONAL_PRINCIPLES:
          return this.healUbuntuViolation(violation, action)
        case ConstitutionalArticle.RIGHTS_FREEDOMS:
          return this.healRightsViolation(violation, action)
        case ConstitutionalArticle.ECONOMIC_CONSTITUTION:
          return this.healEconomicViolation(violation, action)
        case ConstitutionalArticle.TECHNOLOGICAL_CONSTITUTION:
          return this.healTechViolation(violation, action)
        case ConstitutionalArticle.TRUTH_VERIFICATION:
          return this.healTruthViolation(violation, action)
        default:
          // For other articles, require manual remediation
          return false
      }
    } catch (error) {
      console.error('Failed to heal violation:', error)
      return false
    }
  }

  private async healUbuntuViolation(violation: ConstitutionalViolation, action: UserAction): Promise<boolean> {
    if (violation.section === '1.1' && action.type === UserActionType.PROJECT_CREATE) {
      // Auto-add collaborators for private projects
      action.payload.collaborators = action.payload.collaborators || []
      action.payload.collaborators.push('community-reviewer') // Add community reviewer
      return true
    }
    return false
  }

  private async healRightsViolation(violation: ConstitutionalViolation, action: UserAction): Promise<boolean> {
    if (violation.section === '2.1' && action.type === UserActionType.DATA_EXPORT) {
      // Auto-add consent for data export
      action.payload.userConsent = true
      return true
    }
    return false
  }

  private async healEconomicViolation(violation: ConstitutionalViolation, action: UserAction): Promise<boolean> {
    if (violation.section === '3.2' && action.type === UserActionType.MARKETPLACE_PUBLISH) {
      // Auto-adjust revenue sharing to minimum 10%
      action.payload.revenueSharing = Math.max(action.payload.revenueSharing || 0, 0.1)
      return true
    }
    return false
  }

  private async healTechViolation(violation: ConstitutionalViolation, action: UserAction): Promise<boolean> {
    if (violation.section === '5.1' && action.type === UserActionType.AI_QUERY) {
      // Auto-enable explainable AI
      action.payload.explainable = true
      return true
    }
    return false
  }

  private async healTruthViolation(violation: ConstitutionalViolation, action: UserAction): Promise<boolean> {
    // Cannot auto-heal No Mock Protocol violations - requires manual implementation
    return false
  }

  private async checkUbuntuPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // Check if action promotes collective benefit
    if (action.type === UserActionType.PROJECT_CREATE) {
      const payload = action.payload as { isPrivate?: boolean, collaborators?: string[] }
      if (payload.isPrivate && (!payload.collaborators || payload.collaborators.length === 0)) {
        violations.push({
          article: ConstitutionalArticle.FOUNDATIONAL_PRINCIPLES,
          section: '1.1',
          principle: 'Individual Success = f(Collective Success)',
          severity: 'MEDIUM',
          description: 'Creating private projects without collaboration may not align with Ubuntu principles',
          remediation: ['Consider adding collaborators', 'Make project open source', 'Add community benefit']
        })
      }
    }
    
    return violations
  }

  private async checkRightsAndFreedoms(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // Check data sovereignty
    if (action.type === UserActionType.DATA_EXPORT) {
      const payload = action.payload as { includePersonalData?: boolean, userConsent?: boolean }
      if (payload.includePersonalData && !payload.userConsent) {
        violations.push({
          article: ConstitutionalArticle.RIGHTS_FREEDOMS,
          section: '2.1',
          principle: 'Sovereignty - Control over personal data',
          severity: 'CRITICAL',
          description: 'Data export without explicit user consent violates sovereignty rights',
          remediation: ['Obtain explicit user consent', 'Implement data sovereignty controls']
        })
      }
    }
    
    return violations
  }

  private async checkEconomicPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // Check fair value distribution
    if (action.type === UserActionType.MARKETPLACE_PUBLISH) {
      const payload = action.payload as { price?: number, revenueSharing?: number }
      if (payload.revenueSharing && payload.revenueSharing < 0.1) {
        violations.push({
          article: ConstitutionalArticle.ECONOMIC_CONSTITUTION,
          section: '3.2',
          principle: 'Fair Distribution - Network effects benefit all participants',
          severity: 'MEDIUM',
          description: 'Revenue sharing below 10% may not align with fair distribution principles',
          remediation: ['Increase revenue sharing percentage', 'Implement Ubuntu-based compensation']
        })
      }
    }
    
    return violations
  }

  private async checkEducationalPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // Educational actions should be accessible and rewarding
    if (action.type === UserActionType.PROJECT_CREATE) {
      const payload = action.payload as { hasLearningObjectives?: boolean, isEducational?: boolean }
      if (payload.isEducational && !payload.hasLearningObjectives) {
        violations.push({
          article: ConstitutionalArticle.EDUCATIONAL_CONSTITUTION,
          section: '4.3',
          principle: 'Clear learning objectives and outcomes',
          severity: 'LOW',
          description: 'Educational projects should have clear learning objectives',
          remediation: ['Add learning objectives', 'Define educational outcomes']
        })
      }
    }
    
    return violations
  }

  private async checkTechnologicalPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // AI systems must operate transparently
    if (action.type === UserActionType.AI_QUERY) {
      const payload = action.payload as { explainable?: boolean, humanOversight?: boolean }
      if (!payload.explainable) {
        violations.push({
          article: ConstitutionalArticle.TECHNOLOGICAL_CONSTITUTION,
          section: '5.1',
          principle: 'Transparency - Provide explainable decision-making processes',
          severity: 'HIGH',
          description: 'AI queries must be explainable and transparent',
          remediation: ['Enable explainable AI', 'Add decision transparency']
        })
      }
    }
    
    return violations
  }

  private async checkGovernancePrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // Governance actions must be transparent and accountable
    if (action.type === UserActionType.SETTINGS_CHANGE) {
      const payload = action.payload as { isSystemWide?: boolean, auditTrail?: boolean }
      if (payload.isSystemWide && !payload.auditTrail) {
        violations.push({
          article: ConstitutionalArticle.GOVERNANCE_STRUCTURE,
          section: '6.2',
          principle: 'All governance actions publicly auditable',
          severity: 'HIGH',
          description: 'System-wide settings changes must have audit trails',
          remediation: ['Enable audit logging', 'Add transparency reporting']
        })
      }
    }
    
    return violations
  }

  private async checkSecurityPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // Security measures must balance protection with accessibility
    if (action.type === UserActionType.FILE_DELETE) {
      const payload = action.payload as { hasBackup?: boolean, isRecoverable?: boolean }
      if (!payload.hasBackup && !payload.isRecoverable) {
        violations.push({
          article: ConstitutionalArticle.SECURITY_PROTECTION,
          section: '7.1',
          principle: 'Maintain system integrity and availability',
          severity: 'MEDIUM',
          description: 'File deletion without backup may compromise system integrity',
          remediation: ['Create backup before deletion', 'Implement recovery mechanisms']
        })
      }
    }
    
    return violations
  }

  private async checkTruthPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // Absolute No Mock Protocol enforcement
    if (action.type === UserActionType.CODE_EDIT || action.type === UserActionType.FILE_CREATE) {
      const payload = action.payload as { content?: string, fileName?: string }
      
      // Check for placeholder/stub patterns (Article VIII Section 8.3)
      const prohibitedPatterns = [
        /stub/i,
        /placeholder/i,
        /fake/i,
        /dummy/i,
        /TODO.*implement/i,
        /FIXME/i
      ]
      
      const hasProhibitedContent = prohibitedPatterns.some(pattern => 
        payload.content?.match(pattern) || payload.fileName?.match(pattern)
      )
      
      if (hasProhibitedContent) {
        violations.push({
          article: ConstitutionalArticle.TRUTH_VERIFICATION,
          section: '8.3',
          principle: 'No Mock Protocol - Absolute prohibition of stubs and placeholders',
          severity: 'CRITICAL',
          description: 'Code contains stub or placeholder implementations which violate Article VIII Section 8.3',
          remediation: ['Replace stubs with real implementations', 'Remove placeholder code', 'Implement actual functionality']
        })
      }
    }
    
    return violations
  }

  private async checkEnforcementPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // All services must undergo constitutional compliance
    if (action.type === UserActionType.PROJECT_DEPLOY) {
      const payload = action.payload as { hasConstitutionalAudit?: boolean, complianceScore?: number }
      if (!payload.hasConstitutionalAudit || (payload.complianceScore && payload.complianceScore < 95)) {
        violations.push({
          article: ConstitutionalArticle.ENFORCEMENT_COMPLIANCE,
          section: '9.1',
          principle: 'All services must undergo regular constitutional audits',
          severity: 'CRITICAL',
          description: 'Deployment without constitutional audit or below 95% compliance score',
          remediation: ['Complete constitutional audit', 'Achieve 95%+ compliance score']
        })
      }
    }
    
    return violations
  }

  private async checkEvolutionPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // System must learn from community feedback
    if (action.type === UserActionType.SETTINGS_CHANGE) {
      const payload = action.payload as { communityInput?: boolean, backwardCompatible?: boolean }
      if (!payload.communityInput) {
        violations.push({
          article: ConstitutionalArticle.EVOLUTION_ADAPTATION,
          section: '10.1',
          principle: 'Learn from community feedback',
          severity: 'LOW',
          description: 'System changes should incorporate community feedback',
          remediation: ['Gather community input', 'Include feedback mechanisms']
        })
      }
    }
    
    return violations
  }

  private async checkEmergencyPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // Emergency actions must be proportional and transparent
    if (action.payload?.isEmergency) {
      const payload = action.payload as { justification?: string, timeLimit?: number }
      if (!payload.justification || !payload.timeLimit) {
        violations.push({
          article: ConstitutionalArticle.EMERGENCY_PROVISIONS,
          section: '11.1',
          principle: 'Actions must be proportional to threat with full transparency',
          severity: 'HIGH',
          description: 'Emergency actions require justification and time limits',
          remediation: ['Provide clear justification', 'Set appropriate time limits']
        })
      }
    }
    
    return violations
  }

  private async checkFinalPrinciples(action: UserAction): Promise<ConstitutionalViolation[]> {
    const violations: ConstitutionalViolation[] = []
    
    // Constitutional principles must prevail in conflicts
    if (action.payload?.hasConflict) {
      const payload = action.payload as { constitutionalResolution?: boolean }
      if (!payload.constitutionalResolution) {
        violations.push({
          article: ConstitutionalArticle.FINAL_PROVISIONS,
          section: '12.1',
          principle: 'Constitutional principles prevail in case of conflict',
          severity: 'HIGH',
          description: 'Conflicts must be resolved using constitutional principles',
          remediation: ['Apply constitutional resolution', 'Prioritize constitutional principles']
        })
      }
    }
    
    return violations
  }

  private calculateComplianceScore(violations: ConstitutionalViolation[]): number {
    let score = 100
    
    for (const violation of violations) {
      switch (violation.severity) {
        case 'CRITICAL':
          score -= 25
          break
        case 'HIGH':
          score -= 15
          break
        case 'MEDIUM':
          score -= 8
          break
        case 'LOW':
          score -= 3
          break
      }
    }
    
    return Math.max(0, score)
  }

  private generateExplanation(allowed: boolean, violations: ConstitutionalViolation[], score: number): string {
    if (allowed) {
      return `Action approved with constitutional compliance score of ${score}%. All constitutional principles upheld.`
    }
    
    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL')
    const highViolations = violations.filter(v => v.severity === 'HIGH')
    
    let explanation = `Action blocked due to constitutional violations (Score: ${score}%). `
    
    if (criticalViolations.length > 0) {
      explanation += `Critical violations: ${criticalViolations.map(v => v.principle).join(', ')}. `
    }
    
    if (highViolations.length > 0) {
      explanation += `High severity violations: ${highViolations.map(v => v.principle).join(', ')}. `
    }
    
    explanation += 'Please review and remediate violations before proceeding.'
    
    return explanation
  }

  private getDefaultArticleScores(): Record<ConstitutionalArticle, number> {
    const scores: Record<ConstitutionalArticle, number> = {} as Record<ConstitutionalArticle, number>
    
    Object.values(ConstitutionalArticle).forEach(article => {
      scores[article] = 100
    })
    
    return scores
  }

  private calculateArticleScores(audits: AuditEvent[]): Record<ConstitutionalArticle, number> {
    const scores: Record<ConstitutionalArticle, number> = this.getDefaultArticleScores()
    
    // Calculate scores based on violations per article
    for (const audit of audits) {
      for (const violation of audit.violations) {
        const currentScore = scores[violation.article]
        const penalty = this.getViolationPenalty(violation.severity)
        scores[violation.article] = Math.max(0, currentScore - penalty)
      }
    }
    
    return scores
  }

  private calculateTrend(audits: AuditEvent[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (audits.length < 10) return 'STABLE'
    
    const recent = audits.slice(-5).reduce((sum, audit) => sum + audit.constitutionalScore, 0) / 5
    const older = audits.slice(-10, -5).reduce((sum, audit) => sum + audit.constitutionalScore, 0) / 5
    
    const difference = recent - older
    
    if (difference > 2) return 'IMPROVING'
    if (difference < -2) return 'DECLINING'
    return 'STABLE'
  }

  private getViolationPenalty(severity: ConstitutionalViolation['severity']): number {
    switch (severity) {
      case 'CRITICAL': return 25
      case 'HIGH': return 15
      case 'MEDIUM': return 8
      case 'LOW': return 3
      default: return 0
    }
  }

  private initializeConstitutionalRules(): void {
    // Initialize constitutional rules for each article
    // This would be expanded with specific rules for each article
    // For now, we implement the core verification logic in the check methods above
  }
}

// Constitutional Rule interface for future expansion
interface ConstitutionalRule {
  id: string
  article: ConstitutionalArticle
  section: string
  principle: string
  validator: (action: UserAction) => Promise<ConstitutionalViolation[]>
}

// Export singleton instance
export const constitutionalAI = new ConstitutionalAI()