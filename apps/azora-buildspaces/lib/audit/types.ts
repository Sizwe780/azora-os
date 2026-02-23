/**
 * Audit System Type Definitions
 * 
 * Constitutional Compliance:
 * - Truth as Currency: All audit results are factual and verifiable
 * - Transparency: All findings are clearly documented
 * - No Mock Protocol: Real audit data only
 */

import { z } from 'zod'

// Severity levels for findings
export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

// Audit categories
export enum AuditCategory {
  CONSTITUTIONAL_COMPLIANCE = 'CONSTITUTIONAL_COMPLIANCE',
  NO_MOCK_PROTOCOL = 'NO_MOCK_PROTOCOL',
  AUTHENTICATION_SECURITY = 'AUTHENTICATION_SECURITY',
  DATABASE = 'DATABASE',
  AI_AGENTS = 'AI_AGENTS',
  FILE_SYSTEM_SECURITY = 'FILE_SYSTEM_SECURITY',
  ECONOMIC_SYSTEM = 'ECONOMIC_SYSTEM',
  SECURITY_HEADERS = 'SECURITY_HEADERS',
  DEPLOYMENT_READINESS = 'DEPLOYMENT_READINESS',
  PERFORMANCE = 'PERFORMANCE'
}

// Launch readiness status
export enum LaunchStatus {
  READY = 'READY',
  NEEDS_WORK = 'NEEDS_WORK',
  BLOCKED = 'BLOCKED'
}

// Zod Schemas
export const FindingSchema = z.object({
  id: z.string(),
  category: z.nativeEnum(AuditCategory),
  severity: z.nativeEnum(Severity),
  title: z.string(),
  description: z.string(),
  filePath: z.string().optional(),
  lineNumber: z.number().optional(),
  evidence: z.string().optional(),
  remediation: z.array(z.string()),
  constitutionalArticle: z.string().optional(),
  requirement: z.string().optional()
})

export const BlockerSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.nativeEnum(AuditCategory),
  impact: z.string(),
  estimatedFixTime: z.string(),
  remediation: z.array(z.string())
})

export const RecommendationSchema = z.object({
  id: z.string(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  title: z.string(),
  description: z.string(),
  category: z.nativeEnum(AuditCategory),
  benefit: z.string(),
  estimatedEffort: z.string()
})

export const AuditResultSchema = z.object({
  category: z.nativeEnum(AuditCategory),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  findings: z.array(FindingSchema),
  criticalCount: z.number(),
  highCount: z.number(),
  mediumCount: z.number(),
  lowCount: z.number(),
  infoCount: z.number(),
  executionTime: z.number(),
  timestamp: z.date()
})

export const AuditReportSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  overallScore: z.number().min(0).max(100),
  launchStatus: z.nativeEnum(LaunchStatus),
  results: z.array(AuditResultSchema),
  blockers: z.array(BlockerSchema),
  recommendations: z.array(RecommendationSchema),
  summary: z.object({
    totalFindings: z.number(),
    criticalFindings: z.number(),
    highFindings: z.number(),
    mediumFindings: z.number(),
    lowFindings: z.number(),
    infoFindings: z.number(),
    categoriesAudited: z.number(),
    categoriesPassed: z.number(),
    totalExecutionTime: z.number()
  }),
  metadata: z.object({
    auditVersion: z.string(),
    buildspacesVersion: z.string().optional(),
    nodeVersion: z.string(),
    platform: z.string()
  })
})

// TypeScript Types
export type Finding = z.infer<typeof FindingSchema>
export type Blocker = z.infer<typeof BlockerSchema>
export type Recommendation = z.infer<typeof RecommendationSchema>
export type AuditResult = z.infer<typeof AuditResultSchema>
export type AuditReport = z.infer<typeof AuditReportSchema>

// Auditor interface that all auditors must implement
export interface IAuditor {
  name: string
  category: AuditCategory
  description: string
  
  /**
   * Execute the audit and return results
   */
  audit(): Promise<AuditResult>
}

// Configuration for audit execution
export interface AuditConfig {
  categories?: AuditCategory[]
  skipCategories?: AuditCategory[]
  outputPath?: string
  verbose?: boolean
  failOnBlockers?: boolean
}
