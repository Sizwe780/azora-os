/**
 * Test Script for Performance Baseline Auditor
 */

async function main() {
  console.log('='.repeat(80))
  console.log('PERFORMANCE BASELINE AUDITOR TEST')
  console.log('='.repeat(80))
  console.log()

  try {
    // Import the compiled auditor
    const { PerformanceAuditor } = require('../lib/audit/auditors/performance-auditor.ts')
    const { Severity } = require('../lib/audit/types.ts')

    const auditor = new PerformanceAuditor()

    console.log(`Auditor: ${auditor.name}`)
    console.log(`Category: ${auditor.category}`)
    console.log(`Description: ${auditor.description}`)
    console.log()

    console.log('Running audit...')
    console.log()

    const result = await auditor.audit()

    console.log()
    console.log('='.repeat(80))
    console.log('AUDIT RESULTS')
    console.log('='.repeat(80))
    console.log()

    console.log(`Overall Score: ${result.score}/100`)
    console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`Execution Time: ${result.executionTime}ms`)
    console.log()

    console.log('Finding Summary:')
    console.log(`  Critical: ${result.criticalCount}`)
    console.log(`  High: ${result.highCount}`)
    console.log(`  Medium: ${result.mediumCount}`)
    console.log(`  Low: ${result.lowCount}`)
    console.log(`  Info: ${result.infoCount}`)
    console.log(`  Total: ${result.findings.length}`)
    console.log()

    // Display findings by severity
    const criticalFindings = result.findings.filter(f => f.severity === Severity.CRITICAL)
    const highFindings = result.findings.filter(f => f.severity === Severity.HIGH)
    const mediumFindings = result.findings.filter(f => f.severity === Severity.MEDIUM)
    const infoFindings = result.findings.filter(f => f.severity === Severity.INFO)

    if (criticalFindings.length > 0) {
      console.log('🔴 CRITICAL FINDINGS:')
      console.log('-'.repeat(80))
      criticalFindings.forEach((finding, index) => {
        console.log(`${index + 1}. ${finding.title}`)
        console.log(`   ${finding.description}`)
        if (finding.filePath) console.log(`   File: ${finding.filePath}`)
        console.log()
      })
    }

    if (highFindings.length > 0) {
      console.log('🟠 HIGH PRIORITY FINDINGS:')
      console.log('-'.repeat(80))
      highFindings.forEach((finding, index) => {
        console.log(`${index + 1}. ${finding.title}`)
        console.log(`   ${finding.description}`)
        if (finding.filePath) console.log(`   File: ${finding.filePath}`)
        if (finding.remediation.length > 0) {
          console.log(`   Remediation:`)
          finding.remediation.forEach(step => console.log(`     - ${step}`))
        }
        console.log()
      })
    }

    if (mediumFindings.length > 0) {
      console.log('🟡 MEDIUM PRIORITY FINDINGS:')
      console.log('-'.repeat(80))
      mediumFindings.forEach((finding, index) => {
        console.log(`${index + 1}. ${finding.title}`)
        console.log(`   ${finding.description}`)
        if (finding.filePath) console.log(`   File: ${finding.filePath}`)
        if (finding.remediation.length > 0) {
          console.log(`   Remediation:`)
          finding.remediation.forEach(step => console.log(`     - ${step}`))
        }
        console.log()
      })
    }

    if (infoFindings.length > 0) {
      console.log('ℹ️  INFORMATIONAL FINDINGS:')
      console.log('-'.repeat(80))
      infoFindings.forEach((finding, index) => {
        console.log(`${index + 1}. ${finding.title}`)
        console.log(`   ${finding.description}`)
        if (finding.filePath) console.log(`   File: ${finding.filePath}`)
        console.log()
      })
    }

    console.log('='.repeat(80))
    console.log('PERFORMANCE AUDIT COMPLETE')
    console.log('='.repeat(80))
    console.log()

    if (result.score >= 70) {
      console.log('✅ Performance baseline audit PASSED')
    } else {
      console.log('❌ Performance baseline audit FAILED')
    }

    process.exit(result.passed ? 0 : 1)
  } catch (error) {
    console.error('Test failed with error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
