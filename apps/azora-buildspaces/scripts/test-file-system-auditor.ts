/**
 * Test Script for File System Security Auditor
 * 
 * Tests the file system security auditor to verify it correctly identifies
 * security issues in file system operations.
 */

import { FileSystemAuditor } from '../lib/audit/auditors/file-system-auditor'

async function testFileSystemAuditor() {
  console.log('🧪 Testing File System Security Auditor\n')
  console.log('=' .repeat(60))
  
  try {
    const auditor = new FileSystemAuditor()
    
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
    
    console.log(`\n📋 Findings Summary:`)
    console.log(`   🔴 Critical: ${result.criticalCount}`)
    console.log(`   🟠 High: ${result.highCount}`)
    console.log(`   🟡 Medium: ${result.mediumCount}`)
    console.log(`   🟢 Low: ${result.lowCount}`)
    console.log(`   ℹ️  Info: ${result.infoCount}`)
    console.log(`   📊 Total: ${result.findings.length}`)
    
    if (result.findings.length > 0) {
      console.log(`\n🔍 Detailed Findings:\n`)
      
      result.findings.forEach((finding, index) => {
        const severityEmoji = {
          CRITICAL: '🔴',
          HIGH: '🟠',
          MEDIUM: '🟡',
          LOW: '🟢',
          INFO: 'ℹ️'
        }[finding.severity]
        
        console.log(`${index + 1}. ${severityEmoji} [${finding.severity}] ${finding.title}`)
        console.log(`   ${finding.description}`)
        
        if (finding.filePath) {
          console.log(`   📁 File: ${finding.filePath}`)
        }
        
        if (finding.lineNumber) {
          console.log(`   📍 Line: ${finding.lineNumber}`)
        }
        
        if (finding.evidence) {
          console.log(`   🔍 Evidence: ${finding.evidence}`)
        }
        
        if (finding.constitutionalArticle) {
          console.log(`   📜 Constitutional: ${finding.constitutionalArticle}`)
        }
        
        if (finding.requirement) {
          console.log(`   📋 Requirement: ${finding.requirement}`)
        }
        
        if (finding.remediation.length > 0) {
          console.log(`   💡 Remediation:`)
          finding.remediation.forEach(step => {
            console.log(`      - ${step}`)
          })
        }
        
        console.log()
      })
    }
    
    console.log('='.repeat(60))
    console.log('✅ File System Security Auditor test completed')
    console.log('='.repeat(60))
    
    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1)
    
  } catch (error) {
    console.error('\n❌ Error running auditor:', error)
    process.exit(1)
  }
}

// Run the test
testFileSystemAuditor()
