/**
 * Security Headers Auditor
 * 
 * Verifies that all security headers are properly configured in next.config.mjs
 * to protect against common web vulnerabilities.
 * 
 * Constitutional Compliance:
 * - Article VII: Security & Protection (Azora Aegis security framework)
 * - Article II, Section 2.2: Privacy Protection
 * - Truth as Currency: Real security header verification, no mocks
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import type { IAuditor, AuditResult, Finding } from '../types'
import { AuditCategory, Severity } from '../types'

interface SecurityHeader {
  name: string
  expectedValue?: string
  expectedPattern?: RegExp
  isPresent: boolean
  actualValue?: string
  isCorrect: boolean
  requirement: string
  description: string
  bestPractice: string
}

export class SecurityHeadersAuditor implements IAuditor {
  name = 'Security Headers Auditor'
  category = AuditCategory.SECURITY_HEADERS
  description = 'Verifies security headers are properly configured'
  
  private configPath: string
  private headers: SecurityHeader[] = []
  
  constructor(buildspacesRoot?: string) {
    // If buildspacesRoot is provided, use it directly (it's already the full path)
    if (buildspacesRoot) {
      this.configPath = path.join(buildspacesRoot, 'next.config.mjs')
    } else {
      // Check if we're already in the buildspaces directory
      const cwd = process.cwd()
      if (cwd.includes('azora-buildspaces')) {
        this.configPath = path.join(cwd, 'next.config.mjs')
      } else {
        this.configPath = path.join(cwd, 'apps', 'azora-buildspaces', 'next.config.mjs')
      }
    }
  }
  
  async audit(): Promise<AuditResult> {
    const startTime = Date.now()
    const findings: Finding[] = []
    
    console.log('  🛡️  Auditing security headers configuration...')
    
    // Task 9.1: Audit next.config.mjs headers
    await this.auditNextConfig()
    
    // Analyze headers and generate findings
    const headerFindings = this.analyzeHeaders()
    findings.push(...headerFindings)
    
    // Calculate score
    const score = this.calculateScore(findings)
    
    // Count findings by severity
    const criticalCount = findings.filter(f => f.severity === Severity.CRITICAL).length
    const highCount = findings.filter(f => f.severity === Severity.HIGH).length
    const mediumCount = findings.filter(f => f.severity === Severity.MEDIUM).length
    const lowCount = findings.filter(f => f.severity === Severity.LOW).length
    const infoCount = findings.filter(f => f.severity === Severity.INFO).length
    
    return {
      category: this.category,
      score,
      passed: score >= 90 && criticalCount === 0,
      findings,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      infoCount,
      executionTime: Date.now() - startTime,
      timestamp: new Date()
    }
  }
  
  /**
   * Task 9.1: Audit next.config.mjs for security headers
   */
  private async auditNextConfig(): Promise<void> {
    console.log(`  📄 Reading configuration: ${this.configPath}`)
    
    if (!fs.existsSync(this.configPath)) {
      console.error(`  ❌ Configuration file not found: ${this.configPath}`)
      this.headers = this.getExpectedHeaders().map(header => ({
        ...header,
        isPresent: false,
        isCorrect: false
      }))
      return
    }
    
    const configContent = fs.readFileSync(this.configPath, 'utf-8')
    
    // Parse headers from the config file
    const expectedHeaders = this.getExpectedHeaders()
    
    for (const expected of expectedHeaders) {
      const headerInfo = this.checkHeader(configContent, expected.name, expected.expectedPattern, expected.expectedValue)
      
      this.headers.push({
        ...expected,
        isPresent: headerInfo.isPresent,
        actualValue: headerInfo.actualValue,
        isCorrect: headerInfo.isCorrect
      })
    }
    
    console.log(`  ✅ Analyzed ${this.headers.length} security headers`)
  }
  
  /**
   * Get expected security headers with their requirements
   */
  private getExpectedHeaders(): Omit<SecurityHeader, 'isPresent' | 'actualValue' | 'isCorrect'>[] {
    return [
      {
        name: 'Strict-Transport-Security',
        expectedPattern: /max-age=\d+.*includeSubDomains.*preload/i,
        requirement: '12.1',
        description: 'HTTP Strict Transport Security (HSTS) forces HTTPS connections',
        bestPractice: 'max-age=63072000; includeSubDomains; preload'
      },
      {
        name: 'Content-Security-Policy',
        expectedPattern: /default-src|script-src|style-src/i,
        requirement: '12.2',
        description: 'Content Security Policy prevents XSS and injection attacks',
        bestPractice: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
      },
      {
        name: 'X-Frame-Options',
        expectedPattern: /^(DENY|SAMEORIGIN)$/i,
        requirement: '12.3',
        description: 'X-Frame-Options prevents clickjacking attacks',
        bestPractice: 'SAMEORIGIN or DENY'
      },
      {
        name: 'X-Content-Type-Options',
        expectedValue: 'nosniff',
        requirement: '12.4',
        description: 'X-Content-Type-Options prevents MIME type sniffing',
        bestPractice: 'nosniff'
      },
      {
        name: 'X-XSS-Protection',
        expectedPattern: /1.*mode=block/i,
        requirement: '12.5',
        description: 'X-XSS-Protection enables browser XSS filtering',
        bestPractice: '1; mode=block'
      }
    ]
  }
  
  /**
   * Check if a specific header is present and correctly configured
   */
  private checkHeader(
    configContent: string,
    headerName: string,
    expectedPattern?: RegExp,
    expectedValue?: string
  ): { isPresent: boolean; actualValue?: string; isCorrect: boolean } {
    // Look for the header in the config (simple string value)
    const headerRegex = new RegExp(
      `key:\\s*['"\`]${headerName}['"\`]\\s*,\\s*value:\\s*['"\`]([^'"\`]+)['"\`]`,
      'i'
    )
    
    let match = configContent.match(headerRegex)
    
    // If not found, try to match array-based value (for CSP)
    if (!match) {
      const arrayHeaderRegex = new RegExp(
        `key:\\s*['"\`]${headerName}['"\`]\\s*,\\s*value:\\s*\\[([\\s\\S]*?)\\]\\.join\\(`,
        'i'
      )
      match = configContent.match(arrayHeaderRegex)
      
      if (match) {
        // Extract the array content and simulate the joined value
        const arrayContent = match[1]
        // For CSP, just check if it has the expected directives
        if (expectedPattern && expectedPattern.test(arrayContent)) {
          return {
            isPresent: true,
            actualValue: 'CSP directives found (array format)',
            isCorrect: true
          }
        }
      }
    }
    
    if (!match) {
      return { isPresent: false, isCorrect: false }
    }
    
    const actualValue = match[1]
    
    // Check if value matches expected pattern or value
    let isCorrect = false
    
    if (expectedPattern) {
      isCorrect = expectedPattern.test(actualValue)
    } else if (expectedValue) {
      isCorrect = actualValue.toLowerCase() === expectedValue.toLowerCase()
    } else {
      // If no expected value/pattern, just check presence
      isCorrect = true
    }
    
    return {
      isPresent: true,
      actualValue,
      isCorrect
    }
  }
  
  /**
   * Analyze headers and generate findings
   */
  private analyzeHeaders(): Finding[] {
    const findings: Finding[] = []
    
    // Check each required header
    for (const header of this.headers) {
      if (!header.isPresent) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.CRITICAL,
          title: `Missing security header: ${header.name}`,
          description: `The ${header.name} header is not configured in next.config.mjs. ${header.description}`,
          filePath: this.configPath,
          evidence: `Header "${header.name}" not found in configuration`,
          remediation: [
            `Add ${header.name} header to next.config.mjs`,
            `Recommended value: ${header.bestPractice}`,
            'Add to the headers() async function in the config',
            'Example: { key: "' + header.name + '", value: "' + header.bestPractice + '" }'
          ],
          requirement: header.requirement,
          constitutionalArticle: 'Article VII (Security & Protection)'
        })
      } else if (!header.isCorrect) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.HIGH,
          title: `Incorrect ${header.name} header value`,
          description: `The ${header.name} header is present but does not follow security best practices.`,
          filePath: this.configPath,
          evidence: `Current value: "${header.actualValue}"`,
          remediation: [
            `Update ${header.name} header value`,
            `Current: ${header.actualValue}`,
            `Recommended: ${header.bestPractice}`,
            'Ensure the value provides adequate security protection'
          ],
          requirement: header.requirement,
          constitutionalArticle: 'Article VII (Security & Protection)'
        })
      } else {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.INFO,
          title: `${header.name} properly configured`,
          description: `The ${header.name} header is present and correctly configured.`,
          filePath: this.configPath,
          evidence: `Value: "${header.actualValue}"`,
          remediation: [],
          requirement: header.requirement
        })
      }
    }
    
    // Check for additional recommended headers
    const additionalHeaders = this.checkAdditionalHeaders()
    findings.push(...additionalHeaders)
    
    return findings
  }
  
  /**
   * Check for additional recommended security headers
   */
  private checkAdditionalHeaders(): Finding[] {
    const findings: Finding[] = []
    
    if (!fs.existsSync(this.configPath)) {
      return findings
    }
    
    const configContent = fs.readFileSync(this.configPath, 'utf-8')
    
    // Check for Referrer-Policy
    const hasReferrerPolicy = /key:\s*['"`]Referrer-Policy['"`]/i.test(configContent)
    if (!hasReferrerPolicy) {
      findings.push({
        id: randomUUID(),
        category: this.category,
        severity: Severity.MEDIUM,
        title: 'Missing Referrer-Policy header',
        description: 'The Referrer-Policy header controls how much referrer information is sent with requests.',
        filePath: this.configPath,
        remediation: [
          'Add Referrer-Policy header to next.config.mjs',
          'Recommended value: strict-origin-when-cross-origin',
          'This prevents leaking sensitive information in referrer headers'
        ],
        requirement: '12.2'
      })
    } else {
      findings.push({
        id: randomUUID(),
        category: this.category,
        severity: Severity.INFO,
        title: 'Referrer-Policy header configured',
        description: 'The Referrer-Policy header is present (recommended but not required).',
        filePath: this.configPath,
        remediation: [],
        requirement: '12.2'
      })
    }
    
    // Check for Permissions-Policy
    const hasPermissionsPolicy = /key:\s*['"`]Permissions-Policy['"`]/i.test(configContent)
    if (!hasPermissionsPolicy) {
      findings.push({
        id: randomUUID(),
        category: this.category,
        severity: Severity.LOW,
        title: 'Missing Permissions-Policy header',
        description: 'The Permissions-Policy header controls which browser features can be used.',
        filePath: this.configPath,
        remediation: [
          'Add Permissions-Policy header to next.config.mjs',
          'Recommended value: camera=(), microphone=(), geolocation=()',
          'This restricts access to sensitive browser APIs'
        ],
        requirement: '12.2'
      })
    } else {
      findings.push({
        id: randomUUID(),
        category: this.category,
        severity: Severity.INFO,
        title: 'Permissions-Policy header configured',
        description: 'The Permissions-Policy header is present (recommended but not required).',
        filePath: this.configPath,
        remediation: [],
        requirement: '12.2'
      })
    }
    
    return findings
  }
  
  /**
   * Calculate security headers score
   */
  private calculateScore(findings: Finding[]): number {
    const criticalCount = findings.filter(f => f.severity === Severity.CRITICAL).length
    const highCount = findings.filter(f => f.severity === Severity.HIGH).length
    const mediumCount = findings.filter(f => f.severity === Severity.MEDIUM).length
    const lowCount = findings.filter(f => f.severity === Severity.LOW).length
    
    // Start with perfect score
    let score = 100
    
    // Deduct points for findings
    score -= criticalCount * 20  // Critical: -20 points each (missing required header)
    score -= highCount * 10      // High: -10 points each (incorrect value)
    score -= mediumCount * 5     // Medium: -5 points each (missing recommended header)
    score -= lowCount * 2        // Low: -2 points each (minor issues)
    
    // Ensure score doesn't go below 0
    return Math.max(0, score)
  }
}
