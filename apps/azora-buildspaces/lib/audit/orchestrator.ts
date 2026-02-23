/**
 * Audit Orchestrator
 * 
 * Coordinates execution of all audit modules and aggregates results
 * 
 * Constitutional Compliance:
 * - Truth as Currency: Orchestrates factual audits
 * - Transparency: All audit operations are logged
 * - Ubuntu Philosophy: Serves collective understanding
 */

import { randomUUID } from 'crypto'
import type { 
  IAuditor, 
  AuditReport, 
  AuditResult, 
  AuditConfig,
  Blocker,
  Recommendation 
} from './types'
import { LaunchStatus, Severity, AuditCategory } from './types'
import { ReportGenerator } from './report-generator'

export class AuditOrchestrator {
  private auditors: IAuditor[] = []
  private reportGenerator: ReportGenerator
  
  constructor() {
    this.reportGenerator = new ReportGenerator()
  }
  
  /**
   * Register an auditor
   */
  registerAuditor(auditor: IAuditor): void {
    this.auditors.push(auditor)
    console.log(`✅ Registered auditor: ${auditor.name}`)
  }
  
  /**
   * Run full audit across all registered auditors
   */
  async runFullAudit(config: AuditConfig = {}): Promise<AuditReport> {
    const startTime = Date.now()
    const auditId = randomUUID()
    
    console.log('🚀 Starting Buildspaces Launch Readiness Audit...')
    console.log(`   Audit ID: ${auditId}`)
    console.log(`   Auditors: ${this.auditors.length}`)
    console.log('')
    
    // Filter auditors based on config
    let auditorsToRun = this.auditors
    
    if (config.categories && config.categories.length > 0) {
      auditorsToRun = auditorsToRun.filter(a => 
        config.categories!.includes(a.category)
      )
    }
    
    if (config.skipCategories && config.skipCategories.length > 0) {
      auditorsToRun = auditorsToRun.filter(a => 
        !config.skipCategories!.includes(a.category)
      )
    }
    
    // Execute audits in parallel
    const results: AuditResult[] = []
    const auditPromises = auditorsToRun.map(async (auditor) => {
      const auditorStartTime = Date.now()
      
      try {
        console.log(`⏳ Running: ${auditor.name}...`)
        const result = await auditor.audit()
        const duration = Date.now() - auditorStartTime
        
        const statusEmoji = result.passed ? '✅' : '⚠️'
        console.log(`${statusEmoji} ${auditor.name}: ${result.score}/100 (${duration}ms)`)
        
        if (config.verbose && result.findings.length > 0) {
          console.log(`   Findings: ${result.findings.length} (${result.criticalCount} critical, ${result.highCount} high)`)
        }
        
        return result
      } catch (error) {
        console.error(`❌ ${auditor.name} failed:`, error)
        
        // Return a failed result
        return {
          category: auditor.category,
          score: 0,
          passed: false,
          findings: [{
            id: randomUUID(),
            category: auditor.category,
            severity: Severity.CRITICAL,
            title: `Auditor Execution Failed`,
            description: `The ${auditor.name} auditor failed to execute: ${error instanceof Error ? error.message : String(error)}`,
            remediation: ['Fix the auditor implementation', 'Check logs for details']
          }],
          criticalCount: 1,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
          infoCount: 0,
          executionTime: Date.now() - auditorStartTime,
          timestamp: new Date()
        }
      }
    })
    
    results.push(...await Promise.all(auditPromises))
    
    console.log('')
    console.log('📊 Calculating overall score...')
    
    // Calculate overall score (weighted average)
    const overallScore = this.calculateOverallScore(results)
    
    // Determine launch status
    const launchStatus = this.determineLaunchStatus(results, overallScore)
    
    // Extract blockers
    const blockers = this.extractBlockers(results)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(results)
    
    // Calculate summary statistics
    const summary = this.calculateSummary(results)
    
    // Build report
    const report: AuditReport = {
      id: auditId,
      timestamp: new Date(),
      overallScore,
      launchStatus,
      results,
      blockers,
      recommendations,
      summary: {
        ...summary,
        totalExecutionTime: Date.now() - startTime
      },
      metadata: {
        auditVersion: '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        buildspacesVersion: process.env.npm_package_version
      }
    }
    
    console.log('')
    console.log('✅ Audit complete!')
    console.log(`   Overall Score: ${overallScore}/100`)
    console.log(`   Launch Status: ${launchStatus}`)
    console.log(`   Total Findings: ${summary.totalFindings}`)
    console.log(`   Critical Issues: ${summary.criticalFindings}`)
    console.log(`   Blockers: ${blockers.length}`)
    console.log(`   Execution Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`)
    console.log('')
    
    // Save report if output path specified
    if (config.outputPath) {
      await this.reportGenerator.saveReport(report, config.outputPath)
    }
    
    // Fail if blockers exist and config says to fail
    if (config.failOnBlockers && blockers.length > 0) {
      throw new Error(`Audit failed: ${blockers.length} critical blocker(s) found`)
    }
    
    return report
  }
  
  /**
   * Calculate overall score as weighted average
   */
  private calculateOverallScore(results: AuditResult[]): number {
    if (results.length === 0) return 0
    
    // All categories have equal weight for now
    const totalScore = results.reduce((sum, result) => sum + result.score, 0)
    return Math.round(totalScore / results.length)
  }
  
  /**
   * Determine launch status based on results
   */
  private determineLaunchStatus(results: AuditResult[], overallScore: number): LaunchStatus {
    // Check for critical findings
    const hasCritical = results.some(r => r.criticalCount > 0)
    
    if (hasCritical) {
      return LaunchStatus.BLOCKED
    }
    
    // Check overall score
    if (overallScore >= 90) {
      return LaunchStatus.READY
    } else if (overallScore >= 70) {
      return LaunchStatus.NEEDS_WORK
    } else {
      return LaunchStatus.BLOCKED
    }
  }
  
  /**
   * Extract critical blockers from results
   */
  private extractBlockers(results: AuditResult[]): Blocker[] {
    const blockers: Blocker[] = []
    
    results.forEach(result => {
      result.findings
        .filter(f => f.severity === Severity.CRITICAL)
        .forEach(finding => {
          blockers.push({
            id: finding.id,
            title: finding.title,
            description: finding.description,
            category: result.category,
            impact: 'Prevents safe launch of Buildspaces',
            estimatedFixTime: this.estimateFixTime(finding.severity),
            remediation: finding.remediation
          })
        })
    })
    
    return blockers
  }
  
  /**
   * Generate recommendations from findings
   */
  private generateRecommendations(results: AuditResult[]): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    results.forEach(result => {
      result.findings
        .filter(f => f.severity === Severity.HIGH || f.severity === Severity.MEDIUM)
        .forEach(finding => {
          const priority = finding.severity === Severity.HIGH ? 'HIGH' : 
                          finding.severity === Severity.MEDIUM ? 'MEDIUM' : 'LOW'
          
          recommendations.push({
            id: finding.id,
            priority,
            title: finding.title,
            description: finding.description,
            category: result.category,
            benefit: this.describeBenefit(finding.severity, result.category),
            estimatedEffort: this.estimateFixTime(finding.severity)
          })
        })
    })
    
    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }
  
  /**
   * Calculate summary statistics
   */
  private calculateSummary(results: AuditResult[]) {
    const totalFindings = results.reduce((sum, r) => sum + r.findings.length, 0)
    const criticalFindings = results.reduce((sum, r) => sum + r.criticalCount, 0)
    const highFindings = results.reduce((sum, r) => sum + r.highCount, 0)
    const mediumFindings = results.reduce((sum, r) => sum + r.mediumCount, 0)
    const lowFindings = results.reduce((sum, r) => sum + r.lowCount, 0)
    const infoFindings = results.reduce((sum, r) => sum + r.infoCount, 0)
    const categoriesAudited = results.length
    const categoriesPassed = results.filter(r => r.passed).length
    
    return {
      totalFindings,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
      infoFindings,
      categoriesAudited,
      categoriesPassed,
      totalExecutionTime: 0 // Will be set by caller
    }
  }
  
  /**
   * Estimate fix time based on severity
   */
  private estimateFixTime(severity: Severity): string {
    switch (severity) {
      case Severity.CRITICAL:
        return '2-4 hours'
      case Severity.HIGH:
        return '1-2 hours'
      case Severity.MEDIUM:
        return '30-60 minutes'
      case Severity.LOW:
        return '15-30 minutes'
      default:
        return '< 15 minutes'
    }
  }
  
  /**
   * Describe benefit of fixing an issue
   */
  private describeBenefit(severity: Severity, category: AuditCategory): string {
    const categoryBenefits: Record<AuditCategory, string> = {
      [AuditCategory.CONSTITUTIONAL_COMPLIANCE]: 'Ensures alignment with Azora Constitution and Ubuntu principles',
      [AuditCategory.NO_MOCK_PROTOCOL]: 'Guarantees production-ready code with no placeholders',
      [AuditCategory.AUTHENTICATION_SECURITY]: 'Protects user data and prevents unauthorized access',
      [AuditCategory.DATABASE]: 'Ensures data integrity and system reliability',
      [AuditCategory.AI_AGENTS]: 'Enables intelligent features and Constitutional AI governance',
      [AuditCategory.FILE_SYSTEM_SECURITY]: 'Prevents unauthorized file access and data breaches',
      [AuditCategory.ECONOMIC_SYSTEM]: 'Enables fair token distribution and economic opportunity',
      [AuditCategory.SECURITY_HEADERS]: 'Protects against common web vulnerabilities',
      [AuditCategory.DEPLOYMENT_READINESS]: 'Ensures smooth production deployment',
      [AuditCategory.PERFORMANCE]: 'Improves user experience and system efficiency'
    }
    
    return categoryBenefits[category] || 'Improves system quality and reliability'
  }
}
