/**
 * Audit Report Generator
 * 
 * Generates comprehensive audit reports in markdown and JSON formats
 * 
 * Constitutional Compliance:
 * - Truth as Currency: Reports contain only verified facts
 * - Transparency: All findings clearly documented
 * - Ubuntu Philosophy: Reports serve collective understanding
 */

import { writeFileSync } from 'fs'
import { join } from 'path'
import type { AuditReport, AuditResult, Finding, Blocker, Recommendation } from './types'
import { Severity, LaunchStatus, AuditCategory } from './types'

export class ReportGenerator {
  /**
   * Generate markdown report
   */
  generateMarkdown(report: AuditReport): string {
    const lines: string[] = []
    
    // Header
    lines.push('# 🚀 BUILDSPACES LAUNCH READINESS AUDIT REPORT')
    lines.push('')
    lines.push(`**Generated**: ${report.timestamp.toISOString()}`)
    lines.push(`**Audit ID**: ${report.id}`)
    lines.push(`**Overall Score**: ${report.overallScore}/100`)
    lines.push(`**Launch Status**: ${this.getStatusEmoji(report.launchStatus)} **${report.launchStatus}**`)
    lines.push('')
    lines.push('---')
    lines.push('')
    
    // Executive Summary
    lines.push('## 📊 EXECUTIVE SUMMARY')
    lines.push('')
    lines.push(`This audit evaluated ${report.summary.categoriesAudited} categories of the Buildspaces application against Constitutional requirements and launch readiness criteria.`)
    lines.push('')
    lines.push('### Key Metrics')
    lines.push('')
    lines.push('| Metric | Value |')
    lines.push('|--------|-------|')
    lines.push(`| Overall Score | ${report.overallScore}/100 |`)
    lines.push(`| Categories Passed | ${report.summary.categoriesPassed}/${report.summary.categoriesAudited} |`)
    lines.push(`| Total Findings | ${report.summary.totalFindings} |`)
    lines.push(`| Critical Issues | ${report.summary.criticalFindings} |`)
    lines.push(`| High Priority | ${report.summary.highFindings} |`)
    lines.push(`| Medium Priority | ${report.summary.mediumFindings} |`)
    lines.push(`| Low Priority | ${report.summary.lowFindings} |`)
    lines.push(`| Execution Time | ${(report.summary.totalExecutionTime / 1000).toFixed(2)}s |`)
    lines.push('')
    
    // Blockers
    if (report.blockers.length > 0) {
      lines.push('---')
      lines.push('')
      lines.push('## 🔴 CRITICAL BLOCKERS')
      lines.push('')
      lines.push('The following issues **MUST** be resolved before launch:')
      lines.push('')
      
      report.blockers.forEach((blocker, index) => {
        lines.push(`### ${index + 1}. ${blocker.title}`)
        lines.push('')
        lines.push(`**Category**: ${blocker.category}`)
        lines.push(`**Impact**: ${blocker.impact}`)
        lines.push(`**Estimated Fix Time**: ${blocker.estimatedFixTime}`)
        lines.push('')
        lines.push(`${blocker.description}`)
        lines.push('')
        lines.push('**Remediation Steps**:')
        blocker.remediation.forEach(step => {
          lines.push(`- ${step}`)
        })
        lines.push('')
      })
    }
    
    // Category Results
    lines.push('---')
    lines.push('')
    lines.push('## 📋 AUDIT RESULTS BY CATEGORY')
    lines.push('')
    
    // Sort results by score (lowest first to highlight problems)
    const sortedResults = [...report.results].sort((a, b) => a.score - b.score)
    
    sortedResults.forEach(result => {
      const statusEmoji = result.passed ? '✅' : '⚠️'
      lines.push(`### ${statusEmoji} ${this.getCategoryName(result.category)}`)
      lines.push('')
      lines.push(`**Score**: ${result.score}/100 | **Status**: ${result.passed ? 'PASSED' : 'NEEDS ATTENTION'}`)
      lines.push('')
      
      if (result.findings.length > 0) {
        lines.push(`**Findings**: ${result.findings.length} (${result.criticalCount} critical, ${result.highCount} high, ${result.mediumCount} medium, ${result.lowCount} low)`)
        lines.push('')
        
        // Group findings by severity
        const critical = result.findings.filter(f => f.severity === Severity.CRITICAL)
        const high = result.findings.filter(f => f.severity === Severity.HIGH)
        const medium = result.findings.filter(f => f.severity === Severity.MEDIUM)
        const low = result.findings.filter(f => f.severity === Severity.LOW)
        
        if (critical.length > 0) {
          lines.push('#### 🔴 Critical Issues')
          lines.push('')
          critical.forEach(finding => {
            lines.push(this.formatFinding(finding))
          })
        }
        
        if (high.length > 0) {
          lines.push('#### 🟠 High Priority')
          lines.push('')
          high.forEach(finding => {
            lines.push(this.formatFinding(finding))
          })
        }
        
        if (medium.length > 0) {
          lines.push('#### 🟡 Medium Priority')
          lines.push('')
          medium.forEach(finding => {
            lines.push(this.formatFinding(finding))
          })
        }
        
        if (low.length > 0) {
          lines.push('#### 🔵 Low Priority')
          lines.push('')
          low.forEach(finding => {
            lines.push(this.formatFinding(finding))
          })
        }
      } else {
        lines.push('✅ No issues found in this category.')
        lines.push('')
      }
      
      lines.push('---')
      lines.push('')
    })
    
    // Recommendations
    if (report.recommendations.length > 0) {
      lines.push('## 💡 RECOMMENDATIONS')
      lines.push('')
      lines.push('The following improvements are recommended to enhance the system:')
      lines.push('')
      
      const highPriority = report.recommendations.filter(r => r.priority === 'HIGH')
      const mediumPriority = report.recommendations.filter(r => r.priority === 'MEDIUM')
      const lowPriority = report.recommendations.filter(r => r.priority === 'LOW')
      
      if (highPriority.length > 0) {
        lines.push('### High Priority')
        lines.push('')
        highPriority.forEach(rec => {
          lines.push(`- **${rec.title}** (${rec.category})`)
          lines.push(`  - ${rec.description}`)
          lines.push(`  - Benefit: ${rec.benefit}`)
          lines.push(`  - Effort: ${rec.estimatedEffort}`)
          lines.push('')
        })
      }
      
      if (mediumPriority.length > 0) {
        lines.push('### Medium Priority')
        lines.push('')
        mediumPriority.forEach(rec => {
          lines.push(`- **${rec.title}** (${rec.category})`)
          lines.push(`  - ${rec.description}`)
          lines.push(`  - Benefit: ${rec.benefit}`)
          lines.push(`  - Effort: ${rec.estimatedEffort}`)
          lines.push('')
        })
      }
      
      if (lowPriority.length > 0) {
        lines.push('### Low Priority')
        lines.push('')
        lowPriority.forEach(rec => {
          lines.push(`- **${rec.title}** (${rec.category})`)
          lines.push(`  - ${rec.description}`)
          lines.push(`  - Benefit: ${rec.benefit}`)
          lines.push(`  - Effort: ${rec.estimatedEffort}`)
          lines.push('')
        })
      }
    }
    
    // Footer
    lines.push('---')
    lines.push('')
    lines.push('## 📝 METADATA')
    lines.push('')
    lines.push('| Property | Value |')
    lines.push('|----------|-------|')
    lines.push(`| Audit Version | ${report.metadata.auditVersion} |`)
    lines.push(`| Node Version | ${report.metadata.nodeVersion} |`)
    lines.push(`| Platform | ${report.metadata.platform} |`)
    if (report.metadata.buildspacesVersion) {
      lines.push(`| Buildspaces Version | ${report.metadata.buildspacesVersion} |`)
    }
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('*"Ngiyakwazi ngoba sikwazi" - "I can because we are"*')
    lines.push('')
    lines.push('**Constitutional AI Systems**: ACTIVE AND MONITORING')
    
    return lines.join('\n')
  }
  
  /**
   * Generate JSON report
   */
  generateJSON(report: AuditReport): string {
    return JSON.stringify(report, null, 2)
  }
  
  /**
   * Save report to file system
   */
  async saveReport(report: AuditReport, outputPath: string): Promise<void> {
    // Save markdown report
    const markdownPath = join(outputPath, 'audit-report.md')
    const markdown = this.generateMarkdown(report)
    writeFileSync(markdownPath, markdown, 'utf-8')
    
    // Save JSON report
    const jsonPath = join(outputPath, 'audit-report.json')
    const json = this.generateJSON(report)
    writeFileSync(jsonPath, json, 'utf-8')
    
    console.log(`✅ Reports saved:`)
    console.log(`   - ${markdownPath}`)
    console.log(`   - ${jsonPath}`)
  }
  
  /**
   * Format a single finding
   */
  private formatFinding(finding: Finding): string {
    const lines: string[] = []
    
    lines.push(`**${finding.title}**`)
    lines.push('')
    lines.push(finding.description)
    lines.push('')
    
    if (finding.filePath) {
      lines.push(`📁 File: \`${finding.filePath}\`${finding.lineNumber ? `:${finding.lineNumber}` : ''}`)
      lines.push('')
    }
    
    if (finding.evidence) {
      lines.push('```')
      lines.push(finding.evidence)
      lines.push('```')
      lines.push('')
    }
    
    if (finding.constitutionalArticle) {
      lines.push(`⚖️ Constitutional Reference: ${finding.constitutionalArticle}`)
      lines.push('')
    }
    
    if (finding.requirement) {
      lines.push(`📋 Requirement: ${finding.requirement}`)
      lines.push('')
    }
    
    if (finding.remediation.length > 0) {
      lines.push('**Remediation**:')
      finding.remediation.forEach(step => {
        lines.push(`- ${step}`)
      })
      lines.push('')
    }
    
    return lines.join('\n')
  }
  
  /**
   * Get status emoji
   */
  private getStatusEmoji(status: LaunchStatus): string {
    switch (status) {
      case LaunchStatus.READY:
        return '✅'
      case LaunchStatus.NEEDS_WORK:
        return '⚠️'
      case LaunchStatus.BLOCKED:
        return '🔴'
      default:
        return '❓'
    }
  }
  
  /**
   * Get human-readable category name
   */
  private getCategoryName(category: AuditCategory): string {
    const names: Record<AuditCategory, string> = {
      [AuditCategory.CONSTITUTIONAL_COMPLIANCE]: 'Constitutional Compliance',
      [AuditCategory.NO_MOCK_PROTOCOL]: 'No Mock Protocol',
      [AuditCategory.AUTHENTICATION_SECURITY]: 'Authentication & Security',
      [AuditCategory.DATABASE]: 'Database & Schema',
      [AuditCategory.AI_AGENTS]: 'AI Agent Integration',
      [AuditCategory.FILE_SYSTEM_SECURITY]: 'File System Security',
      [AuditCategory.ECONOMIC_SYSTEM]: 'Economic System',
      [AuditCategory.SECURITY_HEADERS]: 'Security Headers',
      [AuditCategory.DEPLOYMENT_READINESS]: 'Deployment Readiness',
      [AuditCategory.PERFORMANCE]: 'Performance Baseline'
    }
    
    return names[category] || category
  }
}
