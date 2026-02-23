/**
 * Test Script for AI Agent Integration Auditor
 * 
 * Tests the AI Agent auditor to verify:
 * - All AI agents (Elara, Sankofa, Themba, Nia, Kwame) are integrated
 * - Constitutional AI service is operational
 * - Agent orchestration can route requests
 * - AI responses are explainable and transparent
 */

import { join } from 'path'
const { AIAgentAuditor } = require('../lib/audit/auditors/ai-agent-auditor') as any

async function testAIAgentAuditor() {
  console.log('🤖 Testing AI Agent Integration Auditor...\n')
  
  // Get buildspaces root directory
  const buildspacesRoot = join(__dirname, '..')
  
  // Create auditor instance
  const auditor = new AIAgentAuditor(buildspacesRoot)
  
  console.log(`📁 Auditing directory: ${buildspacesRoot}`)
  console.log(`📋 Auditor: ${auditor.name}`)
  console.log(`📂 Category: ${auditor.category}`)
  console.log(`📝 Description: ${auditor.description}\n`)
  
  // Run audit
  console.log('🔍 Running audit...\n')
  const startTime = Date.now()
  
  try {
    const result = await auditor.audit()
    const duration = Date.now() - startTime
    
    // Display results
    console.log('=' .repeat(80))
    console.log('AUDIT RESULTS')
    console.log('='.repeat(80))
    console.log(`\n📊 Score: ${result.score}/100`)
    console.log(`✅ Passed: ${result.passed ? 'YES' : 'NO'}`)
    console.log(`⏱️  Execution Time: ${result.executionTime}ms`)
    console.log(`📅 Timestamp: ${result.timestamp.toISOString()}\n`)
    
    // Findings summary
    console.log('📋 FINDINGS SUMMARY')
    console.log('-'.repeat(80))
    console.log(`🔴 Critical: ${result.criticalCount}`)
    console.log(`🟠 High: ${result.highCount}`)
    console.log(`🟡 Medium: ${result.mediumCount}`)
    console.log(`🟢 Low: ${result.lowCount}`)
    console.log(`ℹ️  Info: ${result.infoCount}`)
    console.log(`📊 Total: ${result.findings.length}\n`)
    
    // Detailed findings
    if (result.findings.length > 0) {
      console.log('🔍 DETAILED FINDINGS')
      console.log('-'.repeat(80))
      
      result.findings.forEach((finding: any, index: number) => {
        const severityEmojiMap = {
          CRITICAL: '🔴',
          HIGH: '🟠',
          MEDIUM: '🟡',
          LOW: '🟢',
          INFO: 'ℹ️'
        }
        const severityEmoji = severityEmojiMap[finding.severity as keyof typeof severityEmojiMap]
        
        console.log(`\n${index + 1}. ${severityEmoji} [${finding.severity}] ${finding.title}`)
        console.log(`   ${finding.description}`)
        
        if (finding.filePath) {
          console.log(`   📁 File: ${finding.filePath}`)
        }
        
        if (finding.constitutionalArticle) {
          console.log(`   📜 Constitutional: ${finding.constitutionalArticle}`)
        }
        
        if (finding.requirement) {
          console.log(`   📋 Requirement: ${finding.requirement}`)
        }
        
        if (finding.remediation && finding.remediation.length > 0) {
          console.log(`   🔧 Remediation:`)
          finding.remediation.forEach((step: any) => {
            console.log(`      - ${step}`)
          })
        }
      })
    } else {
      console.log('✅ No findings - all AI agents are properly integrated!')
    }
    
    console.log('\n' + '='.repeat(80))
    
    // Test-specific checks
    console.log('\n🧪 TEST VALIDATION')
    console.log('-'.repeat(80))
    
    // Check that audit ran successfully
    if (result.executionTime > 0) {
      console.log('✅ Audit executed successfully')
    } else {
      console.log('❌ Audit execution time is invalid')
    }
    
    // Check that score is calculated
    if (result.score >= 0 && result.score <= 100) {
      console.log('✅ Score is within valid range (0-100)')
    } else {
      console.log('❌ Score is out of range')
    }
    
    // Check that findings are categorized correctly
    const totalCounted = result.criticalCount + result.highCount + result.mediumCount + result.lowCount + result.infoCount
    if (totalCounted === result.findings.length) {
      console.log('✅ All findings are properly categorized')
    } else {
      console.log('❌ Finding count mismatch')
    }
    
    // Check for specific agent verifications
    const agentNames = ['Elara', 'Sankofa', 'Themba', 'Nia', 'Kwame']
    const agentFindings = result.findings.filter((f: any) => 
      agentNames.some(name => f.title.includes(name))
    )
    
    if (agentFindings.length > 0) {
      console.log(`✅ Agent verification checks performed (${agentFindings.length} findings)`)
    } else {
      console.log('ℹ️  No agent-specific findings (all agents may be properly integrated)')
    }
    
    // Check for Constitutional AI verification
    const constitutionalFindings = result.findings.filter((f: any) => 
      f.title.includes('Constitutional AI')
    )
    
    if (constitutionalFindings.length > 0 || result.findings.length === 0) {
      console.log('✅ Constitutional AI verification performed')
    } else {
      console.log('⚠️  No Constitutional AI findings')
    }
    
    // Check for orchestration verification
    const orchestrationFindings = result.findings.filter((f: any) => 
      f.title.includes('Orchestration') || f.title.includes('orchestrator')
    )
    
    if (orchestrationFindings.length > 0 || result.findings.length === 0) {
      console.log('✅ Agent orchestration verification performed')
    } else {
      console.log('⚠️  No orchestration findings')
    }
    
    console.log('\n' + '='.repeat(80))
    
    // Final verdict
    console.log('\n🎯 FINAL VERDICT')
    console.log('-'.repeat(80))
    
    if (result.passed) {
      console.log('✅ AI Agent Integration Audit PASSED')
      console.log('   All AI agents are properly integrated and operational.')
    } else {
      console.log('❌ AI Agent Integration Audit FAILED')
      console.log(`   Score: ${result.score}/100 (minimum 85 required)`)
      console.log(`   Critical Issues: ${result.criticalCount} (must be 0)`)
      
      if (result.criticalCount > 0) {
        console.log('\n   🔴 Critical issues must be resolved before launch:')
        result.findings
          .filter((f: any) => f.severity === 'CRITICAL')
          .forEach((f: any) => console.log(`      - ${f.title}`))
      }
    }
    
    console.log('\n' + '='.repeat(80))
    console.log(`\n✅ Test completed in ${duration}ms\n`)
    
    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1)
    
  } catch (error) {
    console.error('\n❌ Audit failed with error:')
    console.error(error)
    process.exit(1)
  }
}

// Run the test
testAIAgentAuditor().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
