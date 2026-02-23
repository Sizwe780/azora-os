/**
 * Simple JavaScript runner for AI Agent Auditor
 * Avoids TypeScript module resolution issues
 */

const path = require('path');

async function runAudit() {
  console.log('🤖 Running AI Agent Integration Audit...\n');
  
  try {
    // Import the compiled auditor
    const { AIAgentAuditor } = require('../lib/audit/auditors/ai-agent-auditor');
    
    const buildspacesRoot = path.join(__dirname, '..');
    const auditor = new AIAgentAuditor(buildspacesRoot);
    
    console.log(`📋 Auditor: ${auditor.name}`);
    console.log(`📂 Category: ${auditor.category}\n`);
    
    const result = await auditor.audit();
    
    console.log('='.repeat(80));
    console.log('AUDIT RESULTS');
    console.log('='.repeat(80));
    console.log(`\n📊 Score: ${result.score}/100`);
    console.log(`✅ Passed: ${result.passed ? 'YES' : 'NO'}`);
    console.log(`⏱️  Execution Time: ${result.executionTime}ms\n`);
    
    console.log('📋 FINDINGS SUMMARY');
    console.log('-'.repeat(80));
    console.log(`🔴 Critical: ${result.criticalCount}`);
    console.log(`🟠 High: ${result.highCount}`);
    console.log(`🟡 Medium: ${result.mediumCount}`);
    console.log(`🟢 Low: ${result.lowCount}`);
    console.log(`📊 Total: ${result.findings.length}\n`);
    
    if (result.findings.length > 0) {
      console.log('🔍 DETAILED FINDINGS');
      console.log('-'.repeat(80));
      
      result.findings.forEach((finding, index) => {
        console.log(`\n${index + 1}. [${finding.severity}] ${finding.title}`);
        console.log(`   ${finding.description}`);
        if (finding.filePath) {
          console.log(`   📁 File: ${finding.filePath}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(result.passed ? '✅ AUDIT PASSED' : '❌ AUDIT FAILED');
    console.log('='.repeat(80) + '\n');
    
    process.exit(result.passed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error running audit:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runAudit();
