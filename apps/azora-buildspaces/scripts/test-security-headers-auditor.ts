/**
 * Test Script for Security Headers Auditor
 * 
 * Tests the Security Headers Auditor implementation
 */

import { SecurityHeadersAuditor } from '../lib/audit/auditors/security-headers-auditor'

async function testSecurityHeadersAuditor() {
  console.log('🧪 Testing Security Headers Auditor\n')
  console.log('=' .repeat(60))
  
  try {
    const auditor = new SecurityHeadersAuditor()
    
    console.log(`\n📋 Auditor: ${auditor.name}`)
    console.log(`📂 Category: ${auditor.category}`)
    console.log(`📝 Description: ${auditor.description}\n`)
    
    console.log('🔍 Running audit...\n')
    const result = await auditor.audit()
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 AUDIT RESULTS')
    console.log('='.repeat(60))
    
    console.log(`\n✅ Status: ${result.passed ? 'PASSED' : 'FAILED'}`)
    console.log(`📈 Score: ${result.score}/100`)
    console.log(`⏱️  Execution Time: ${result.executionTime}ms`)
    console.log(`📅 Timestamp: ${result.timestamp.toISOString()}`)
    
    console.log(`\n📊 Findings Summary:`)
    console.log(`   🔴 Critical: ${result.criticalCount}`)
    console.log(`   🟠 High: ${result.highCount}`)
    console.log(`   🟡 Medium: ${result.mediumCount}`)
    console.log(`   🟢 Low: ${result.lowCount}`)
    console.log(`   ℹ️  Info: ${result.infoCount}`)
    console.log(`   📝 Total: ${result.findings.length}`)
    
    if (result.findings.length > 0) {
      console.log(`\n📋 Detailed Findings:\n`)
      
      // Group findings by severity
      const bySeverity = {
        CRITICAL: result.findings.filter(f => f.severity === 'CRITICAL'),
        HIGH: result.findings.filter(f => f.severity === 'HIGH'),
        MEDIUM: result.findings.filter(f => f.severity === 'MEDIUM'),
        LOW: result.findings.filter(f => f.severity === 'LOW'),
        INFO: result.findings.filter(f => f.severity === 'INFO')
      }
      
      for (const [severity, findings] of Object.entries(bySeverity)) {
        if (findings.length > 0) {
          const icon = {
            CRITICAL: '🔴',
            HIGH: '🟠',
            MEDIUM: '🟡',
            LOW: '🟢',
            INFO: 'ℹ️'
          }[severity]
          
          console.log(`${icon} ${severity} (${findings.length})`)
          console.log('-'.repeat(60))
          
          findings.forEach((finding, index) => {
            console.log(`\n${index + 1}. ${finding.title}`)
            console.log(`   ${finding.description}`)
            
            if (finding.filePath) {
              console.log(`   📄 File: ${finding.filePath}`)
            }
            
            if (finding.evidence) {
              console.log(`   🔍 Evidence: ${finding.evidence}`)
            }
            
            if (finding.requirement) {
              console.log(`   📋 Requirement: ${finding.requirement}`)
            }
            
            if (finding.constitutionalArticle) {
              console.log(`   ⚖️  Constitutional: ${finding.constitutionalArticle}`)
            }
            
            if (finding.remediation && finding.remediation.length > 0) {
              console.log(`   🔧 Remediation:`)
              finding.remediation.forEach(step => {
                console.log(`      • ${step}`)
              })
            }
          })
          
          console.log()
        }
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ Security Headers Auditor test completed')
    console.log('='.repeat(60))
    
    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1)
    
  } catch (error) {
    console.error('\n❌ Error running Security Headers Auditor test:', error)
    process.exit(1)
  }
}

// Run the test
testSecurityHeadersAuditor()
