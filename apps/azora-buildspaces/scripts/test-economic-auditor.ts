/**
 * Test Script for Economic System Auditor
 * 
 * Tests the economic auditor against the Buildspaces codebase
 */

import { EconomicAuditor } from '../lib/audit/auditors/economic-auditor'
import * as path from 'path'

async function main() {
  console.log('='.repeat(80))
  console.log('ECONOMIC SYSTEM AUDITOR TEST')
  console.log('='.repeat(80))
  console.log()

  // Get workspace root (3 levels up from this script)
  const workspaceRoot = path.resolve(__dirname, '../../..')

  console.log(`Workspace Root: ${workspaceRoot}`)
  console.log()

  // Create and run auditor
  const auditor = new EconomicAuditor(workspaceRoot)
  const result = await auditor.audit()

  // Display results
  console.log()
  console.log('='.repeat(80))
  console.log('AUDIT RESULTS')
  console.log('='.repeat(80))
  console.log()
  console.log(`Category: ${result.category}`)
  console.log(`Score: ${result.score}/100`)
  console.log(`Status: ${result.passed ? 'PASSED ✅' : 'FAILED ❌'}`)
  console.log(`Execution Time: ${result.executionTime}ms`)
  console.log()

  // Display findings summary
  console.log('Findings Summary:')
  console.log(`  Critical: ${result.criticalCount}`)
  console.log(`  High: ${result.highCount}`)
  console.log(`  Medium: ${result.mediumCount}`)
  console.log(`  Low: ${result.lowCount}`)
  console.log(`  Info: ${result.infoCount}`)
  console.log()

  // Display detailed findings
  if (result.findings.length > 0) {
    console.log('='.repeat(80))
    console.log('DETAILED FINDINGS')
    console.log('='.repeat(80))
    console.log()

    for (const finding of result.findings) {
      const icon = finding.severity === 'INFO' ? '✅' : 
                   finding.severity === 'LOW' ? '⚠️' :
                   finding.severity === 'MEDIUM' ? '⚠️' :
                   finding.severity === 'HIGH' ? '❌' : '🚨'

      console.log(`${icon} [${finding.severity}] ${finding.title}`)
      console.log(`   ${finding.description}`)
      
      if (finding.filePath) {
        console.log(`   File: ${finding.filePath}`)
      }
      
      if (finding.constitutionalArticle) {
        console.log(`   Constitutional: ${finding.constitutionalArticle}`)
      }
      
      if (finding.requirement) {
        console.log(`   Requirement: ${finding.requirement}`)
      }
      
      if (finding.evidence) {
        console.log(`   Evidence: ${finding.evidence}`)
      }
      
      if (finding.remediation.length > 0) {
        console.log(`   Remediation:`)
        finding.remediation.forEach(step => {
          console.log(`     - ${step}`)
        })
      }
      
      console.log()
    }
  }

  // Summary
  console.log('='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log()

  if (result.score >= 95) {
    console.log('✅ EXCELLENT: Economic system is fully compliant with Article III')
  } else if (result.score >= 80) {
    console.log('✅ GOOD: Economic system meets minimum requirements')
  } else if (result.score >= 60) {
    console.log('⚠️  NEEDS WORK: Economic system has significant issues')
  } else {
    console.log('❌ BLOCKED: Economic system is not ready for launch')
  }

  console.log()
  console.log(`Total Findings: ${result.findings.length}`)
  console.log(`Critical Issues: ${result.criticalCount}`)
  console.log()

  // Exit with appropriate code
  process.exit(result.passed ? 0 : 1)
}

main().catch(error => {
  console.error('Error running economic auditor:', error)
  process.exit(1)
})
