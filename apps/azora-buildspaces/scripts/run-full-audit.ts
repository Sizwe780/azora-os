#!/usr/bin/env tsx
/**
 * Full Buildspaces Launch Readiness Audit Runner
 * 
 * Executes all audit modules and generates comprehensive report
 * 
 * Constitutional Compliance:
 * - Truth as Currency: Only real audit data
 * - Transparency: All findings documented
 * - Ubuntu Philosophy: Serves collective understanding
 */

import { resolve } from 'path'
import { AuditOrchestrator } from '../lib/audit/orchestrator'
import { ConstitutionalAuditor } from '../lib/audit/auditors/constitutional-auditor'
import { NoMockProtocolEnforcer } from '../lib/audit/auditors/no-mock-enforcer'
import { AuthAuditor } from '../lib/audit/auditors/auth-auditor'
// import { AIAgentAuditor } from '../lib/audit/auditors/ai-agent-auditor'
import { FileSystemAuditor } from '../lib/audit/auditors/file-system-auditor'
import { EconomicAuditor } from '../lib/audit/auditors/economic-auditor'
import { SecurityHeadersAuditor } from '../lib/audit/auditors/security-headers-auditor'
import { DeploymentAuditor } from '../lib/audit/auditors/deployment-auditor'
// import { PerformanceAuditor } from '../lib/audit/auditors/performance-auditor'

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗')
  console.log('║                                                                ║')
  console.log('║     AZORA BUILDSPACES LAUNCH READINESS AUDIT                   ║')
  console.log('║                                                                ║')
  console.log('║     Constitutional Compliance Verification                     ║')
  console.log('║     "Ngiyakwazi ngoba sikwazi" - "I can because we are"        ║')
  console.log('║                                                                ║')
  console.log('╚════════════════════════════════════════════════════════════════╝')
  console.log('')
  
  // Initialize orchestrator
  const orchestrator = new AuditOrchestrator()
  
  // Register all auditors
  console.log('📋 Registering auditors...')
  console.log('')
  
  const buildspacesRoot = resolve(__dirname, '..')
  
  orchestrator.registerAuditor(new ConstitutionalAuditor(buildspacesRoot))
  orchestrator.registerAuditor(new NoMockProtocolEnforcer(buildspacesRoot))
  orchestrator.registerAuditor(new AuthAuditor(buildspacesRoot))
  
  // Try to register DatabaseAuditor (may fail if Prisma not generated)
  try {
    const { DatabaseAuditor } = await import('../lib/audit/auditors/database-auditor')
    orchestrator.registerAuditor(new DatabaseAuditor())
  } catch (error) {
    console.log('⚠️  Skipping Database Auditor (Prisma client not generated)')
    console.log('')
  }
  
  // orchestrator.registerAuditor(new AIAgentAuditor(buildspacesRoot))
  orchestrator.registerAuditor(new FileSystemAuditor(buildspacesRoot))
  orchestrator.registerAuditor(new EconomicAuditor(buildspacesRoot))
  orchestrator.registerAuditor(new SecurityHeadersAuditor(buildspacesRoot))
  orchestrator.registerAuditor(new DeploymentAuditor())
  // orchestrator.registerAuditor(new PerformanceAuditor(buildspacesRoot))
  
  console.log('')
  console.log('═'.repeat(64))
  console.log('')
  
  // Run full audit
  const outputPath = resolve(__dirname, '../../../.kiro/specs/buildspaces-launch-audit')
  
  try {
    const report = await orchestrator.runFullAudit({
      outputPath,
      verbose: true,
      failOnBlockers: false
    })
    
    console.log('')
    console.log('═'.repeat(64))
    console.log('')
    console.log('📊 AUDIT SUMMARY')
    console.log('')
    console.log(`   Overall Score:     ${report.overallScore}/100`)
    console.log(`   Launch Status:     ${report.launchStatus}`)
    console.log(`   Total Findings:    ${report.summary.totalFindings}`)
    console.log(`   Critical Issues:   ${report.summary.criticalFindings}`)
    console.log(`   High Priority:     ${report.summary.highFindings}`)
    console.log(`   Medium Priority:   ${report.summary.mediumFindings}`)
    console.log(`   Blockers:          ${report.blockers.length}`)
    console.log(`   Recommendations:   ${report.recommendations.length}`)
    console.log('')
    
    if (report.blockers.length > 0) {
      console.log('🔴 CRITICAL BLOCKERS FOUND:')
      console.log('')
      report.blockers.forEach((blocker, index) => {
        console.log(`   ${index + 1}. ${blocker.title}`)
        console.log(`      Category: ${blocker.category}`)
        console.log(`      Fix Time: ${blocker.estimatedFixTime}`)
        console.log('')
      })
    }
    
    console.log('═'.repeat(64))
    console.log('')
    console.log('✅ Audit complete! Reports saved to:')
    console.log(`   ${outputPath}/audit-report.md`)
    console.log(`   ${outputPath}/audit-report.json`)
    console.log('')
    
    // Exit with appropriate code
    if (report.launchStatus === 'BLOCKED') {
      console.log('❌ Launch is BLOCKED due to critical issues')
      process.exit(1)
    } else if (report.launchStatus === 'NEEDS_WORK') {
      console.log('⚠️  Launch NEEDS WORK - address findings before launch')
      process.exit(0)
    } else {
      console.log('✅ System is READY for launch!')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('')
    console.error('❌ Audit failed with error:')
    console.error('')
    console.error(error)
    console.error('')
    process.exit(1)
  }
}

// Run the audit
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
