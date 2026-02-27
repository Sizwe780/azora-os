/**
 * No Mock Protocol Enforcer
 * 
 * Enforces Article VIII Section 8.3 of the Constitution:
 * "No mocks, stubs, placeholders, or fake implementations"
 * 
 * Constitutional Compliance:
 * - Truth as Currency: Only real implementations allowed
 * - No Mock Protocol: Zero tolerance for fake data
 * - Transparency: All violations are reported
 */

import { randomUUID } from 'crypto'
import { readFile, readdir } from 'fs/promises'
import { join, extname, basename, dirname } from 'path'
import type { IAuditor, AuditResult, Finding } from '../types'
import { AuditCategory, Severity } from '../types'

/**
 * Pattern detection for mock violations
 */
interface MockPattern {
  pattern: RegExp
  violationType: 'MOCK' | 'STUB' | 'PLACEHOLDER' | 'FAKE' | 'DUMMY' | 'TODO'
  severity: Severity
  description: string
}

/**
 * Context for a detected violation
 */
interface ViolationContext {
  filePath: string
  lineNumber: number
  line: string
  violationType: string
  severity: Severity
  matchedPattern: string
}

/**
 * File type classification
 */
enum FileType {
  TEST = 'TEST',
  SOURCE = 'SOURCE',
  CONFIG = 'CONFIG',
  UI = 'UI'
}

export class NoMockProtocolEnforcer implements IAuditor {
  name = 'No Mock Protocol Enforcer'
  category = AuditCategory.NO_MOCK_PROTOCOL
  description = 'Enforces Article VIII Section 8.3 - No mocks, stubs, or placeholders'
  
  private readonly buildspacesPath: string
  private readonly patterns: MockPattern[]
  
  constructor(buildspacesPath: string = process.cwd()) {
    this.buildspacesPath = buildspacesPath
    this.patterns = this.initializePatterns()
  }
  
  /**
   * Initialize detection patterns
   * Subtask 3.1: Create pattern detection engine
   */
  private initializePatterns(): MockPattern[] {
    return [
      // CRITICAL: Mock implementations in source code
      {
        pattern: /\bmock[A-Z]\w*/g,
        violationType: 'MOCK',
        severity: Severity.CRITICAL,
        description: 'Mock class or function name (e.g., MockService, mockData)'
      },
      {
        pattern: /\bMock\w+/g,
        violationType: 'MOCK',
        severity: Severity.CRITICAL,
        description: 'Mock class name (e.g., MockDatabase, MockAPI)'
      },
      {
        pattern: /createMock\w*/gi,
        violationType: 'MOCK',
        severity: Severity.CRITICAL,
        description: 'Mock creation function'
      },
      
      // CRITICAL: Stub implementations
      {
        pattern: /\bstub[A-Z]\w*/g,
        violationType: 'STUB',
        severity: Severity.CRITICAL,
        description: 'Stub implementation (e.g., stubService, stubFunction)'
      },
      {
        pattern: /\bStub\w+/g,
        violationType: 'STUB',
        severity: Severity.CRITICAL,
        description: 'Stub class name'
      },
      
      // HIGH: Fake implementations
      {
        pattern: /\bfake[A-Z]\w*/g,
        violationType: 'FAKE',
        severity: Severity.HIGH,
        description: 'Fake implementation (e.g., fakeData, fakeService)'
      },
      {
        pattern: /\bFake\w+/g,
        violationType: 'FAKE',
        severity: Severity.HIGH,
        description: 'Fake class name'
      },
      
      // HIGH: Dummy implementations
      {
        pattern: /\bdummy[A-Z]\w*/g,
        violationType: 'DUMMY',
        severity: Severity.HIGH,
        description: 'Dummy implementation (e.g., dummyData, dummyUser)'
      },
      {
        pattern: /\bDummy\w+/g,
        violationType: 'DUMMY',
        severity: Severity.HIGH,
        description: 'Dummy class name'
      },
      
      // MEDIUM: Placeholder implementations
      {
        pattern: /\/\/\s*TODO:?\s*(implement|add|fix|replace|remove mock)/gi,
        violationType: 'TODO',
        severity: Severity.MEDIUM,
        description: 'TODO comment indicating incomplete implementation'
      },
      {
        pattern: /\/\/\s*FIXME:?\s*(mock|stub|placeholder)/gi,
        violationType: 'TODO',
        severity: Severity.MEDIUM,
        description: 'FIXME comment indicating mock code'
      },
      {
        pattern: /throw new Error\(['"]Not implemented['"]\)/gi,
        violationType: 'PLACEHOLDER',
        severity: Severity.HIGH,
        description: 'Not implemented error - placeholder code'
      },
      {
        pattern: /return\s+\{\s*\/\/\s*mock/gi,
        violationType: 'MOCK',
        severity: Severity.CRITICAL,
        description: 'Returning mock data object'
      },
      
      // Context-aware patterns (need additional validation)
      {
        pattern: /placeholder\w*/gi,
        violationType: 'PLACEHOLDER',
        severity: Severity.MEDIUM,
        description: 'Placeholder reference (needs context validation)'
      }
    ]
  }
  
  /**
   * Execute the audit
   */
  async audit(): Promise<AuditResult> {
    const startTime = Date.now()
    const findings: Finding[] = []
    
    try {
      // Subtask 3.2: Implement codebase scanner
      const violations = await this.scanCodebase()
      
      // Convert violations to findings
      for (const violation of violations) {
        findings.push(this.createFinding(violation))
      }
      
      // Subtask 3.3: Verify production readiness
      const productionReadinessFindings = await this.verifyProductionReadiness()
      findings.push(...productionReadinessFindings)
      
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
        passed: criticalCount === 0 && highCount === 0,
        findings,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        infoCount,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      }
    } catch (error) {
      // Handle audit errors gracefully
      findings.push({
        id: randomUUID(),
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'Audit Execution Error',
        description: `Failed to complete No Mock Protocol audit: ${error instanceof Error ? error.message : String(error)}`,
        remediation: ['Check audit configuration', 'Verify file system access', 'Review error logs']
      })
      
      return {
        category: this.category,
        score: 0,
        passed: false,
        findings,
        criticalCount: 1,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        infoCount: 0,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      }
    }
  }
  
  /**
   * Scan entire codebase for violations
   * Subtask 3.2: Implement codebase scanner
   */
  private async scanCodebase(): Promise<ViolationContext[]> {
    const violations: ViolationContext[] = []
    
    // Get all TypeScript/JavaScript files
    const files = await this.getSourceFiles()
    
    console.log(`   Scanning ${files.length} files for mock violations...`)
    
    for (const filePath of files) {
      const fileViolations = await this.scanFile(filePath)
      violations.push(...fileViolations)
    }
    
    return violations
  }
  
  /**
   * Get all source files to scan
   */
  private async getSourceFiles(): Promise<string[]> {
    const files: string[] = []
    
    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name)
          
          // Skip excluded directories
          if (entry.isDirectory()) {
            if (this.shouldSkipDirectory(entry.name)) {
              continue
            }
            await scanDirectory(fullPath)
          } else if (entry.isFile()) {
            // Include TypeScript and JavaScript files
            if (this.shouldScanFile(fullPath)) {
              files.push(fullPath)
            }
          }
        }
      } catch (error) {
        // Directory might not exist or be accessible
        console.warn(`   Warning: Could not scan directory ${dir}`)
      }
    }
    
    await scanDirectory(this.buildspacesPath)
    return files
  }
  
  /**
   * Check if directory should be skipped
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = [
      'node_modules',
      '.next',
      '.turbo',
      'dist',
      'build',
      'coverage',
      '__tests__',
      'tests',
      '.git'
    ]
    
    return skipDirs.includes(dirName)
  }
  
  /**
   * Check if file should be scanned
   */
  private shouldScanFile(filePath: string): boolean {
    // Include TypeScript and JavaScript files
    const ext = extname(filePath)
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      return false
    }
    
    // Exclude test files
    const fileType = this.classifyFile(filePath)
    if (fileType === FileType.TEST) {
      return false
    }
    
    // Exclude config files
    if (fileType === FileType.CONFIG) {
      return false
    }
    
    return true
  }
  
  /**
   * Classify file type
   */
  private classifyFile(filePath: string): FileType {
    const fileName = basename(filePath)
    const dirName = dirname(filePath)
    
    // Test files
    if (
      fileName.includes('.test.') ||
      fileName.includes('.spec.') ||
      dirName.includes('__tests__') ||
      dirName.includes('/tests/') ||
      dirName.includes('\\tests\\')
    ) {
      return FileType.TEST
    }
    
    // Auditor files (contain pattern definitions, not actual mocks)
    if (
      dirName.includes('/audit/auditors') ||
      dirName.includes('\\audit\\auditors') ||
      fileName.includes('-auditor.ts')
    ) {
      return FileType.CONFIG
    }
    
    // Script files (test/validation scripts may contain test data)
    if (
      dirName.includes('/scripts') ||
      dirName.includes('\\scripts') ||
      fileName.startsWith('test-') ||
      fileName.startsWith('validate-')
    ) {
      return FileType.CONFIG
    }
    
    // Config files
    if (
      fileName.includes('.config.') ||
      fileName === 'jest.config.js' ||
      fileName === 'jest.setup.js' ||
      fileName === 'vitest.config.ts'
    ) {
      return FileType.CONFIG
    }
    
    // UI component files (may have legitimate "placeholder" text)
    if (
      dirName.includes('/components/') ||
      dirName.includes('\\components\\') ||
      fileName.includes('.component.')
    ) {
      return FileType.UI
    }
    
    return FileType.SOURCE
  }
  
  /**
   * Scan a single file for violations
   */
  private async scanFile(filePath: string): Promise<ViolationContext[]> {
    const violations: ViolationContext[] = []
    
    try {
      const content = await readFile(filePath, 'utf-8')
      const lines = content.split('\n')
      const fileType = this.classifyFile(filePath)
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNumber = i + 1
        
        // Apply each pattern
        for (const pattern of this.patterns) {
          const matches = line.matchAll(pattern.pattern)
          
          for (const match of matches) {
            // Context analysis to reduce false positives
            if (this.isLegitimateUse(line, match[0], fileType)) {
              continue
            }
            
            violations.push({
              filePath,
              lineNumber,
              line: line.trim(),
              violationType: pattern.violationType,
              severity: pattern.severity,
              matchedPattern: match[0]
            })
          }
        }
      }
    } catch (error) {
      console.warn(`   Warning: Could not scan file ${filePath}`)
    }
    
    return violations
  }
  
  /**
   * Context analysis to distinguish violations from legitimate uses
   * Subtask 3.1: Add context analysis
   */
  private isLegitimateUse(line: string, match: string, fileType: FileType): boolean {
    const lowerLine = line.toLowerCase()
    const lowerMatch = match.toLowerCase()
    
    // Allow "placeholder" in UI text (strings)
    if (lowerMatch.includes('placeholder') && fileType === FileType.UI) {
      // Check if it's in a string literal
      if (
        line.includes(`"${match}"`) ||
        line.includes(`'${match}'`) ||
        line.includes('`${') ||
        line.includes('placeholder=') ||
        line.includes('Placeholder')
      ) {
        return true
      }
    }
    
    // Allow comments that reference mocking in a documentation context
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      // But not TODO/FIXME comments about implementing
      if (
        !lowerLine.includes('todo') &&
        !lowerLine.includes('fixme') &&
        !lowerLine.includes('implement')
      ) {
        // Documentation comment, not a violation
        return true
      }
    }
    
    // Allow import statements from testing libraries (shouldn't be in source files anyway)
    if (lowerLine.includes('import') && lowerLine.includes('from')) {
      return true
    }
    
    // Allow type definitions that reference mocks (e.g., MockedFunction type)
    if (lowerLine.includes('type ') || lowerLine.includes('interface ')) {
      return true
    }
    
    return false
  }
  
  /**
   * Verify production readiness of API endpoints and services
   * Subtask 3.3: Verify production readiness
   */
  private async verifyProductionReadiness(): Promise<Finding[]> {
    const findings: Finding[] = []
    
    // Check API endpoints
    const apiPath = join(this.buildspacesPath, 'app', 'api')
    const apiFindings = await this.checkApiEndpoints(apiPath)
    findings.push(...apiFindings)
    
    // Check service implementations
    const servicesPath = join(this.buildspacesPath, 'lib', 'services')
    const serviceFindings = await this.checkServices(servicesPath)
    findings.push(...serviceFindings)
    
    return findings
  }
  
  /**
   * Check API endpoints for production readiness
   */
  private async checkApiEndpoints(apiPath: string): Promise<Finding[]> {
    const findings: Finding[] = []
    
    try {
      const files = await this.getFilesRecursive(apiPath)
      
      for (const file of files) {
        if (!file.endsWith('route.ts') && !file.endsWith('route.js')) {
          continue
        }
        
        const content = await readFile(file, 'utf-8')
        
        // Check for hardcoded mock data returns
        if (content.includes('return {') && content.includes('// mock')) {
          findings.push({
            id: randomUUID(),
            category: this.category,
            severity: Severity.CRITICAL,
            title: 'API Endpoint Returns Mock Data',
            description: `API endpoint ${file} appears to return hardcoded mock data instead of querying database or external services`,
            filePath: file,
            evidence: 'Found "return { // mock" pattern',
            remediation: [
              'Replace mock data with real database queries using Prisma',
              'Implement proper data fetching from external services',
              'Ensure all responses come from production data sources'
            ],
            requirement: '2.3, 2.4'
          })
        }
        
        // Check for TODO comments in API routes
        if (content.match(/\/\/\s*TODO.*implement/i)) {
          findings.push({
            id: randomUUID(),
            category: this.category,
            severity: Severity.HIGH,
            title: 'Incomplete API Implementation',
            description: `API endpoint ${file} has TODO comments indicating incomplete implementation`,
            filePath: file,
            evidence: 'Found TODO comment about implementation',
            remediation: [
              'Complete the implementation',
              'Remove TODO comments',
              'Test the endpoint thoroughly'
            ],
            requirement: '2.4'
          })
        }
      }
    } catch (error) {
      // API directory might not exist yet
      console.warn(`   Warning: Could not check API endpoints at ${apiPath}`)
    }
    
    return findings
  }
  
  /**
   * Check service implementations for production readiness
   */
  private async checkServices(servicesPath: string): Promise<Finding[]> {
    const findings: Finding[] = []
    
    try {
      const files = await this.getFilesRecursive(servicesPath)
      
      for (const file of files) {
        if (!file.endsWith('.ts') && !file.endsWith('.js')) {
          continue
        }
        
        const content = await readFile(file, 'utf-8')
        
        // Check for "Not implemented" errors
        if (content.includes('throw new Error') && content.match(/not implemented/i)) {
          findings.push({
            id: randomUUID(),
            category: this.category,
            severity: Severity.CRITICAL,
            title: 'Service Method Not Implemented',
            description: `Service ${file} has methods that throw "Not implemented" errors`,
            filePath: file,
            evidence: 'Found "throw new Error(\'Not implemented\')" pattern',
            remediation: [
              'Implement all service methods',
              'Remove placeholder error throws',
              'Add proper business logic'
            ],
            requirement: '2.4, 2.5'
          })
        }
        
        // Check for mock service classes
        if (content.match(/class\s+Mock\w+/)) {
          findings.push({
            id: randomUUID(),
            category: this.category,
            severity: Severity.CRITICAL,
            title: 'Mock Service Class in Production Code',
            description: `Service file ${file} contains a mock service class`,
            filePath: file,
            evidence: 'Found mock service class definition',
            remediation: [
              'Remove mock service class',
              'Implement real service with production logic',
              'Move mock to test files if needed for testing'
            ],
            requirement: '2.5'
          })
        }
      }
    } catch (error) {
      // Services directory might not exist yet
      console.warn(`   Warning: Could not check services at ${servicesPath}`)
    }
    
    return findings
  }
  
  /**
   * Get all files recursively
   */
  private async getFilesRecursive(dir: string): Promise<string[]> {
    const files: string[] = []
    
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        
        if (entry.isDirectory()) {
          if (!this.shouldSkipDirectory(entry.name)) {
            const subFiles = await this.getFilesRecursive(fullPath)
            files.push(...subFiles)
          }
        } else if (entry.isFile()) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directory might not exist
    }
    
    return files
  }
  
  /**
   * Create a finding from a violation
   */
  private createFinding(violation: ViolationContext): Finding {
    return {
      id: randomUUID(),
      category: this.category,
      severity: violation.severity,
      title: `${violation.violationType} Violation Detected`,
      description: `Found ${violation.violationType.toLowerCase()} pattern "${violation.matchedPattern}" in production code`,
      filePath: violation.filePath,
      lineNumber: violation.lineNumber,
      evidence: violation.line,
      remediation: this.getRemediation(violation.violationType),
      constitutionalArticle: 'Article VIII, Section 8.3',
      requirement: '2.1, 2.2'
    }
  }
  
  /**
   * Get remediation steps for violation type
   */
  private getRemediation(violationType: string): string[] {
    const remediations: Record<string, string[]> = {
      MOCK: [
        'Replace mock implementation with real production code',
        'Connect to actual database or external service',
        'Remove all mock-related code from production files',
        'Ensure Article VIII Section 8.3 compliance'
      ],
      STUB: [
        'Implement full functionality to replace stub',
        'Remove stub code from production files',
        'Add proper error handling and business logic'
      ],
      PLACEHOLDER: [
        'Complete the implementation',
        'Replace placeholder with production-ready code',
        'Test thoroughly before deployment'
      ],
      FAKE: [
        'Replace fake data with real data sources',
        'Implement proper data fetching logic',
        'Remove all fake implementations'
      ],
      DUMMY: [
        'Replace dummy data with real data',
        'Implement proper data models and queries',
        'Remove all dummy implementations'
      ],
      TODO: [
        'Complete the TODO item',
        'Implement the required functionality',
        'Remove TODO comment once complete',
        'Test the implementation'
      ]
    }
    
    return remediations[violationType] || ['Fix the violation', 'Ensure production-ready code']
  }
  
  /**
   * Calculate score based on findings
   */
  private calculateScore(findings: Finding[]): number {
    if (findings.length === 0) {
      return 100
    }
    
    // Deduct points based on severity
    let deductions = 0
    
    findings.forEach(finding => {
      switch (finding.severity) {
        case Severity.CRITICAL:
          deductions += 20
          break
        case Severity.HIGH:
          deductions += 10
          break
        case Severity.MEDIUM:
          deductions += 5
          break
        case Severity.LOW:
          deductions += 2
          break
        case Severity.INFO:
          deductions += 0
          break
      }
    })
    
    const score = Math.max(0, 100 - deductions)
    return score
  }
}
