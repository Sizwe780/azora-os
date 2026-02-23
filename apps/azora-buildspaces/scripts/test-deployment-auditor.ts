/**
 * Test Script for Deployment Readiness Auditor
 * 
 * Tests all deployment readiness checks:
 * - Docker configuration
 * - Kubernetes manifests
 * - Environment variables
 * - Health endpoints
 */

import { DeploymentAuditor } from '../lib/audit/auditors/deployment-auditor'

async function main() {
  console.log('='.repeat(80))
  console.log('DEPLOYMENT READINESS AUDITOR TEST')
  console.log('='.repeat(80))
  console.log()

  const auditor = new DeploymentAuditor()
  
  console.log(`Auditor: ${auditor.name}`)
  console.log(`Category: ${auditor.category}`)
  console.log(`Description: ${auditor.description}`)
  console.log()
  console.log('-'.repeat(80))
  console.log()

  try {
    const result = await auditor.audit()

    console.log()
    console.log('='.repeat(80))
    console.log('AUDIT RESULTS')
    console.log('='.repeat(80))
    console.log()
    console.log(`Overall Score: ${result.score}/100`)
    console.log(`Status: ${result.passed ? '✓ PASSED' : '✗ FAILED'}`)
    console.log(`Execution Time: ${result.executionTime}ms`)
    console.log()
    console.log('Finding Counts:')
    console.log(`  Critical: ${result.criticalCount}`)
    console.log(`  High: ${result.highCount}`)
    console.log(`  Medium: ${result.mediumCount}`)
    console.log(`  Low: ${result.lowCount}`)
    console.log(`  Info: ${result.infoCount}`)
    console.log()

    if (result.findings.length > 0) {
      console.log('-'.repeat(80))
      console.log('FINDINGS')
      console.log('-'.repeat(80))
      console.log()

      for (const finding of result.findings) {
        const icon = finding.severity === 'CRITICAL' ? '🔴' :
                     finding.severity === 'HIGH' ? '🟠' :
                     finding.severity === 'MEDIUM' ? '🟡' :
                     finding.severity === 'LOW' ? '🔵' : 'ℹ️'
        
        console.log(`${icon} [${finding.severity}] ${finding.title}`)
        console.log(`   ID: ${finding.id}`)
        console.log(`   ${finding.description}`)
        if (finding.evidence) {
          console.log(`   Evidence: ${finding.evidence}`)
        }
        if (finding.requirement) {
          console.log(`   Requirement: ${finding.requirement}`)
        }
        if (finding.constitutionalArticle) {
          console.log(`   Constitutional: ${finding.constitutionalArticle}`)
        }
        console.log(`   Remediation:`)
        for (const step of finding.remediation) {
          console.log(`     - ${step}`)
        }
        console.log()
      }
    }

    console.log('='.repeat(80))
    console.log('DEPLOYMENT READINESS SUMMARY')
    console.log('='.repeat(80))
    console.log()
    
    if (result.score >= 95) {
      console.log('✅ EXCELLENT - Ready for production deployment')
    } else if (result.score >= 80) {
      console.log('✓ GOOD - Minor improvements recommended')
    } else if (result.score >= 60) {
      console.log('⚠ NEEDS WORK - Address high priority issues')
    } else {
      console.log('❌ BLOCKED - Critical issues must be resolved')
    }
    console.log()

    process.exit(result.passed ? 0 : 1)

  } catch (error) {
    console.error('❌ Audit failed with error:')
    console.error(error)
    process.exit(1)
  }
}

main()
