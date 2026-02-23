const { PerformanceAuditor } = require('../lib/audit/auditors/performance-auditor.ts')

console.log('PerformanceAuditor:', PerformanceAuditor)
console.log('Type:', typeof PerformanceAuditor)

if (typeof PerformanceAuditor === 'function') {
  const auditor = new PerformanceAuditor()
  console.log('Created auditor:', auditor.name)
} else {
  console.log('Not a constructor!')
}
