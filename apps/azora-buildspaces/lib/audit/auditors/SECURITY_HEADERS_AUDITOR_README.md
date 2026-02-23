# Security Headers Auditor

## Overview
The Security Headers Auditor verifies that all required security headers are properly configured in `next.config.mjs` to protect against common web vulnerabilities.

## Purpose
Ensures compliance with security best practices and constitutional requirements (Article VII: Security & Protection) by validating HTTP security headers.

## Headers Checked

### Required Headers (Critical)
1. **Strict-Transport-Security (HSTS)**
   - Forces HTTPS connections
   - Prevents man-in-the-middle attacks
   - Expected: `max-age=63072000; includeSubDomains; preload`

2. **Content-Security-Policy (CSP)**
   - Prevents XSS and injection attacks
   - Controls resource loading
   - Expected: Policy with `default-src`, `script-src`, `style-src` directives

3. **X-Frame-Options**
   - Prevents clickjacking attacks
   - Expected: `SAMEORIGIN` or `DENY`

4. **X-Content-Type-Options**
   - Prevents MIME type sniffing
   - Expected: `nosniff`

5. **X-XSS-Protection**
   - Enables browser XSS filtering
   - Expected: `1; mode=block`

### Recommended Headers (Optional)
1. **Referrer-Policy**
   - Controls referrer information
   - Recommended: `strict-origin-when-cross-origin`

2. **Permissions-Policy**
   - Restricts browser feature access
   - Recommended: `camera=(), microphone=(), geolocation=()`

## Usage

### Basic Usage
```typescript
import { SecurityHeadersAuditor } from './auditors/security-headers-auditor'

const auditor = new SecurityHeadersAuditor()
const result = await auditor.audit()

console.log(`Score: ${result.score}/100`)
console.log(`Passed: ${result.passed}`)
console.log(`Critical Issues: ${result.criticalCount}`)
```

### Test Script
```bash
npx tsx scripts/test-security-headers-auditor.ts
```

## Scoring

### Score Calculation
- Base Score: 100
- Critical (missing required header): -20 points
- High (incorrect value): -10 points
- Medium (missing recommended header): -5 points
- Low (minor issues): -2 points

### Pass Criteria
- Score ≥ 90/100
- Zero critical findings

## Findings

### Finding Types
1. **Critical**: Missing required security header
2. **High**: Incorrect header value
3. **Medium**: Missing recommended header
4. **Low**: Minor configuration issues
5. **Info**: Properly configured headers

### Remediation
Each finding includes:
- Description of the issue
- Constitutional article reference
- Requirement number
- Step-by-step remediation instructions
- Example configuration

## Example Output

```
📊 AUDIT RESULTS
Score: 80/100
Status: FAILED

🔴 Critical: 1
   - Missing Content-Security-Policy header

ℹ️ Info: 6
   - Strict-Transport-Security properly configured
   - X-Frame-Options properly configured
   - X-Content-Type-Options properly configured
   - X-XSS-Protection properly configured
   - Referrer-Policy header configured
   - Permissions-Policy header configured
```

## Constitutional Compliance

### Article VII: Security & Protection
Verifies implementation of the Azora Aegis security framework through proper security header configuration.

### Article II, Section 2.2: Privacy Protection
Ensures user privacy through headers that control information leakage and unauthorized access.

### Truth as Currency
Performs real verification of configuration files with no mock implementations.

## Integration

### With Audit Orchestrator
```typescript
import { AuditOrchestrator } from './orchestrator'
import { SecurityHeadersAuditor } from './auditors/security-headers-auditor'

const orchestrator = new AuditOrchestrator()
orchestrator.registerAuditor(new SecurityHeadersAuditor())

const report = await orchestrator.runFullAudit()
```

## Common Issues

### Issue: Missing Content-Security-Policy
**Severity**: Critical
**Solution**: Add CSP header to next.config.mjs
```javascript
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
}
```

### Issue: Incorrect HSTS Configuration
**Severity**: High
**Solution**: Ensure HSTS includes preload directive
```javascript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
}
```

## Best Practices

1. **CSP Configuration**
   - Start with restrictive policy
   - Add exceptions as needed
   - Test thoroughly before deployment
   - Use CSP reporting to identify violations

2. **HSTS Configuration**
   - Use long max-age (2 years minimum)
   - Include subdomains
   - Add to preload list

3. **Regular Audits**
   - Run auditor before each deployment
   - Monitor for configuration drift
   - Update headers as security standards evolve

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- CONSTITUTION.md - Article VII: Security & Protection
- Requirements Document - Requirements 12.1-12.5

## Maintenance

### Adding New Headers
1. Add header definition to `getExpectedHeaders()`
2. Specify expected value or pattern
3. Add requirement reference
4. Update documentation

### Updating Validation Logic
1. Modify `checkHeader()` method
2. Update pattern matching
3. Add test cases
4. Update remediation instructions

---

**Version**: 1.0.0
**Last Updated**: 2026-02-18
**Maintainer**: Azora Buildspaces Team
