#!/usr/bin/env tsx
/**
 * Simple Audit Runner for Testing
 */

import { resolve } from 'path'
import { AuditOrchestrator } from '../lib/audit/orchestrator'
import { ConstitutionalAuditor } from '../lib/audit/auditors/constitutional-auditor'
import { NoMockProtocolEnforcer } from '../lib/audit/auditors/no-mock-enforcer'
import { AuthAuditor } from '../lib/audit/auditors/auth-auditor'

async function main() {
  console.log('Running simple audit...')
  
  const orchestrator = new AuditOrchestrator()
  const buildspacesRoot = resolve(__dirname, '..')
  
  orchestrator.registerAuditor(new ConstitutionalAuditor(buildspacesRoot))
  orchestrator.registerAuditor(new NoMockProtocolEnforcer(buildspacesRoot))
  orchestrator.registerAuditor(new AuthAuditor(buildspacesRoot))
  
  const outputPath = resolve(__dirname, '../../../.kiro/specs/buildspaces-launch-audit')
  
  const report = await orchestrator.runFullAudit({
    outputPath,
    verbose: true
  })
  
  console.log(`\nOverall Score: ${report.overallScore}/100`)
  console.log(`Launch Status: ${report.launchStatus}`)
}

main().catch(console.error)
