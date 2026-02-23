/**
 * Test script for Database Auditor
 * 
 * Tests database connectivity and schema verification
 */

import { DatabaseAuditor } from '../lib/audit/auditors/database-auditor'

async function testDatabaseAuditor() {
  console.log('🔍 Testing Database Auditor...\n')

  const auditor = new DatabaseAuditor()

  try {
    const result = await auditor.audit()

    console.log('📊 Audit Results:')
    console.log(`  Category: ${result.category}`)
    console.log(`  Score: ${result.score}/100`)
    console.log(`  Passed: ${result.passed ? '✅' : '❌'}`)
    console.log(`  Execution Time: ${result.executionTime}ms`)
    console.log()

    console.log('📈 Finding Counts:')
    console.log(`  Critical: ${result.criticalCount}`)
    console.log(`  High: ${result.highCount}`)
    console.log(`  Medium: ${result.mediumCount}`)
    console.log(`  Low: ${result.lowCount}`)
    console.log(`  Info: ${result.infoCount}`)
    console.log()

    if (result.findings.length > 0) {
      console.log('🔎 Findings:')
      result.findings.forEach((finding, index) => {
        const icon = finding.severity === 'CRITICAL' ? '🔴' :
                     finding.severity === 'HIGH' ? '🟠' :
                     finding.severity === 'MEDIUM' ? '🟡' :
                     finding.severity === 'LOW' ? '🔵' : 'ℹ️'
        
        console.log(`\n${index + 1}. ${icon} [${finding.severity}] ${finding.title}`)
        console.log(`   ${finding.description}`)
        
        if (finding.filePath) {
          console.log(`   File: ${finding.filePath}`)
        }
        
        if (finding.evidence) {
          console.log(`   Evidence: ${finding.evidence}`)
        }
        
        if (finding.requirement) {
          console.log(`   Requirement: ${finding.requirement}`)
        }
        
        if (finding.remediation && finding.remediation.length > 0) {
          console.log(`   Remediation:`)
          finding.remediation.forEach(step => {
            console.log(`     - ${step}`)
          })
        }
      })
    }

    console.log('\n✅ Database Auditor test completed')
    process.exit(result.passed ? 0 : 1)

  } catch (error) {
    console.error('❌ Database Auditor test failed:', error)
    process.exit(1)
  }
}

testDatabaseAuditor()
