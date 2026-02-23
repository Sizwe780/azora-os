/**
 * Test Script for Constitutional Auditor
 * 
 * Runs the Constitutional Auditor and displays results
 */

import { ConstitutionalAuditor } from '../lib/audit/auditors/constitutional-auditor'
import { AuditOrchestrator } from '../lib/audit/orchestrator'
import path from 'path'

async function main() {
  console.log('🛡️  Testing Constitutional Auditor\n')
  
  // Get the buildspaces root directory
  const buildspacesRoot = path.join(__dirname, '..')
  
  // Create auditor
  const auditor = new ConstitutionalAuditor(buildspacesRoot)
  
  // Create orchestrator
  const orchestrator = new AuditOrchestrator()
  orchestrator.registerAuditor(auditor)
  
  // Run audit
  const report = await orchestrator.runFullAudit({
    verbose: true,
    outputPath: path.join(buildspacesRoot, '.kiro/specs/buildspaces-launch-audit/constitutional-audit-test.md')
  })
  
  console.log('\n📊 Constitutional Audit Results:')
  console.log('================================')
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
    
    // Show first 5 findings
    const sampleFindings = report.results[0]?.findings.slice(0, 5) || []
    
    for (const finding of sampleFindings) {
      console.log(`\n[${finding.severity}] ${finding.title}`)
      console.log(`  Article: ${finding.constitutionalArticle}`)
      console.log(`  ${finding.description}`)
    }
    
    if (report.results[0]?.findings.length > 5) {
      console.log(`\n... and ${report.results[0].findings.length - 5} more findings`)
    }
  }
  
  console.log('\n✅ Test complete!')
  console.log(`📄 Full report saved to: .kiro/specs/buildspaces-launch-audit/constitutional-audit-test.md`)
}

main().catch(console.error)
