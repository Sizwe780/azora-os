/**
 * Test Script for Authentication Security Auditor
 * 
 * Runs the Authentication Security Auditor and displays results
 */

import { AuthAuditor } from '../lib/audit/auditors/auth-auditor'
import { AuditOrchestrator } from '../lib/audit/orchestrator'
import path from 'path'

async function main() {
  console.log('🔐 Testing Authentication Security Auditor\n')
  
  // Get the buildspaces root directory
  const buildspacesRoot = path.join(__dirname, '..')
  
  // Create auditor
  const auditor = new AuthAuditor(buildspacesRoot)
  
  // Create orchestrator
  const orchestrator = new AuditOrchestrator()
  orchestrator.registerAuditor(auditor)
  
  // Run audit
  const report = await orchestrator.runFullAudit({
    verbose: true,
    outputPath: path.join(buildspacesRoot, '.kiro/specs/buildspaces-launch-audit/auth-audit-test.md')
  })
  
  console.log('\n📊 Authentication Security Audit Results:')
  console.log('=========================================')
  console.log(`Overall Score: ${report.overallScore}/100`)
  console.log(`Launch Status: ${report.launchStatus}`)
  console.log(`Total Findings: ${report.summary.totalFindings}`)
  console.log(`  - Critical: ${report.summary.criticalFindings}`)
  console.log(`  - High: ${report.summary.highFindings}`)
  console.log(`  - Medium: ${report.summary.mediumFindings}`)
  console.log(`  - Low: ${report.summary.lowFindings}`)
  console.log(`  - Info: ${report.summary.infoFindings}`)
  console.log(`\nBlockers: ${report.blockers.length}`)
  console.log(`Recommendations: ${report.recommendations.length}`)
  
  if (report.results[0]?.findings.length > 0) {
    console.log('\n📋 Sample Findings:')
    console.log('==================')
    
    // Show first 10 findings
    const sampleFindings = report.results[0]?.findings.slice(0, 10) || []
    
    for (const finding of sampleFindings) {
      console.log(`\n[${finding.severity}] ${finding.title}`)
      if (finding.requirement) {
        console.log(`  Requirement: ${finding.requirement}`)
      }
      console.log(`  ${finding.description}`)
      if (finding.filePath) {
        console.log(`  File: ${finding.filePath}${finding.lineNumber ? `:${finding.lineNumber}` : ''}`)
      }
    }
    
    if (report.results[0].findings.length > 10) {
      console.log(`\n... and ${report.results[0].findings.length - 10} more findings`)
    }
  }
  
  console.log('\n✅ Test complete!')
  console.log(`📄 Full report saved to: .kiro/specs/buildspaces-launch-audit/auth-audit-test.md`)
}

main().catch(console.error)
