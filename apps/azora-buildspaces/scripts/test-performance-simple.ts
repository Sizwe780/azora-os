/**
 * Simple test for Performance Auditor
 */

const { PerformanceAuditor } = require('../lib/audit/auditors/performance-auditor') as any

async function main() {
  console.log('Testing Performance Auditor...')
  
  const auditor = new PerformanceAuditor()
  console.log(`Name: ${auditor.name}`)
  console.log(`Category: ${auditor.category}`)
  
  const result = await auditor.audit()
  
  console.log(`\nScore: ${result.score}/100`)
  console.log(`Passed: ${result.passed}`)
  console.log(`Findings: ${result.findings.length}`)
  console.log(`  Critical: ${result.criticalCount}`)
  console.log(`  High: ${result.highCount}`)
  console.log(`  Medium: ${result.mediumCount}`)
  console.log(`  Low: ${result.lowCount}`)
  console.log(`  Info: ${result.infoCount}`)
  
  return result
}

main().catch(console.error)
