/**
 * Test Script for No Mock Protocol Enforcer
 * 
 * Verifies the enforcer can detect mock violations
 */

import { NoMockProtocolEnforcer } from '../lib/audit/auditors/no-mock-enforcer'

async function main() {
  console.log('🧪 Testing No Mock Protocol Enforcer\n')
  
    // Determine root of the BuildSpaces app (not the entire mono-repo).
    // The script lives in apps/azora-buildspaces/scripts, so one level up
    // is the correct codebase to scan. A PROJECT_ROOT env var can override.
    const path = require('path')
    const rootDir = process.env.PROJECT_ROOT || path.resolve(__dirname, '..')
  
  console.log(`Scanning root: ${rootDir}`)
  const enforcer = new NoMockProtocolEnforcer(rootDir)
  
  console.log('Running audit...\n')
  const result = await enforcer.audit()
  
  console.log('\n📊 Audit Results:')
  console.log('================')
  console.log(`Score: ${result.score}/100`)
  console.log(`Passed: ${result.passed ? '✅' : '❌'}`)
  console.log(`Total Findings: ${result.findings.length}`)
  console.log(`  Critical: ${result.criticalCount}`)
  console.log(`  High: ${result.highCount}`)
  console.log(`  Medium: ${result.mediumCount}`)
  console.log(`  Low: ${result.lowCount}`)
  console.log(`  Info: ${result.infoCount}`)
  console.log(`Execution Time: ${result.executionTime}ms`)
  
  if (result.findings.length > 0) {
    console.log('\n🔍 Sample Findings (first 5):')
    console.log('============================')
    result.findings.slice(0, 5).forEach((finding, index) => {
      console.log(`\n${index + 1}. ${finding.title}`)
      console.log(`   Severity: ${finding.severity}`)
      console.log(`   File: ${finding.filePath}`)
      if (finding.lineNumber) {
        console.log(`   Line: ${finding.lineNumber}`)
      }
      if (finding.evidence) {
        console.log(`   Evidence: ${finding.evidence}`)
      }
    })
    
    if (result.findings.length > 5) {
      console.log(`\n... and ${result.findings.length - 5} more findings`)
    }
  }
  
  console.log('\n✅ Test complete!')
  
  // Exit with error code if critical violations found
  if (result.criticalCount > 0) {
    console.log('\n❌ CRITICAL VIOLATIONS FOUND - Launch blocked!')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
