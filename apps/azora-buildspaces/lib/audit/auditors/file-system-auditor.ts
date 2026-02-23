/**
 * File System Security Auditor
 * 
 * Verifies that file system operations are secure, sandboxed, and properly
 * scoped to user workspaces with path traversal prevention.
 * 
 * Constitutional Compliance:
 * - Article VII, Section 7.1: Azora Aegis (security framework)
 * - Article VII, Section 7.3: Privacy Protection (user data control)
 * - Article II, Section 2.1: User Sovereignty (workspace isolation)
 * - Truth as Currency: Real security checks, no mocks
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import type { IAuditor, AuditResult, Finding } from '../types'
import { AuditCategory, Severity } from '../types'

interface FileSystemEndpoint {
  path: string
  filePath: string
  method: string
  hasPathValidation: boolean
  hasAuthCheck: boolean
  hasWorkspaceScoping: boolean
  vulnerabilities: string[]
  lineNumber?: number
}

interface SecurityCheck {
  name: string
  passed: boolean
  details: string
  severity: Severity
}

export class FileSystemAuditor implements IAuditor {
  name = 'File System Security Auditor'
  category = AuditCategory.FILE_SYSTEM_SECURITY
  description = 'Verifies file system operations are secure and sandboxed'
  
  private buildspacesRoot: string
  private apiBasePath: string
  private serviceBasePath: string
  private endpoints: FileSystemEndpoint[] = []
  private securityChecks: SecurityCheck[] = []
  
  constructor(buildspacesRoot: string = 'apps/azora-buildspaces') {
    this.buildspacesRoot = buildspacesRoot
    // If buildspacesRoot is absolute, use it directly; otherwise join with cwd
    const isAbsolute = path.isAbsolute(buildspacesRoot)
    const basePath = isAbsolute ? buildspacesRoot : path.join(process.cwd(), buildspacesRoot)
    this.apiBasePath = path.join(basePath, 'app', 'api')
    this.serviceBasePath = path.join(basePath, 'lib', 'services')
  }
  
  async audit(): Promise<AuditResult> {
    const startTime = Date.now()
    const findings: Finding[] = []
    
    console.log('  📁 Auditing file system security...')
    
    // Task 7.1: Audit file system endpoints
    await this.auditFileSystemEndpoints()
    const endpointFindings = this.analyzeEndpoints()
    findings.push(...endpointFindings)
    
    // Task 7.2: Verify file upload security
    await this.verifyFileUploadSecurity()
    const uploadFindings = this.analyzeUploadSecurity()
    findings.push(...uploadFindings)
    
    // Verify file system service implementation
    await this.auditFileSystemService()
    const serviceFindings = this.analyzeServiceSecurity()
    findings.push(...serviceFindings)
    
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
   * Task 7.1: Audit file system endpoints
   * Check /api/fs and /api/fs/scan for security measures
   */
  private async auditFileSystemEndpoints(): Promise<void> {
    console.log('    → Scanning file system API endpoints...')
    
    // Check if API endpoints exist
    const fsApiPath = path.join(this.apiBasePath, 'fs')
    
    if (!fs.existsSync(fsApiPath)) {
      this.securityChecks.push({
        name: 'File System API Endpoints',
        passed: false,
        details: 'No file system API endpoints found at /api/fs',
        severity: Severity.INFO
      })
      return
    }
    
    // Scan for route.ts files in fs directory
    this.scanDirectory(fsApiPath, fsApiPath)
    
    console.log(`    → Found ${this.endpoints.length} file system endpoints`)
  }
  
  /**
   * Recursively scan directory for API route files
   */
  private scanDirectory(dirPath: string, basePath: string): void {
    if (!fs.existsSync(dirPath)) return
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      
      if (entry.isDirectory()) {
        this.scanDirectory(fullPath, basePath)
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        this.analyzeEndpointFile(fullPath, basePath)
      }
    }
  }
  
  /**
   * Analyze an API endpoint file for security measures
   */
  private analyzeEndpointFile(filePath: string, basePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    
    // Determine API path from file location
    const relativePath = path.relative(basePath, path.dirname(filePath))
    const apiPath = `/api/fs${relativePath ? '/' + relativePath.replace(/\\/g, '/') : ''}`
    
    // Check for HTTP methods
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    
    for (const method of methods) {
      const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${method}`, 'i')
      const hasMethod = methodRegex.test(content)
      
      if (hasMethod) {
        const endpoint: FileSystemEndpoint = {
          path: apiPath,
          filePath,
          method,
          hasPathValidation: this.checkPathValidation(content),
          hasAuthCheck: this.checkAuthProtection(content),
          hasWorkspaceScoping: this.checkWorkspaceScoping(content),
          vulnerabilities: this.detectVulnerabilities(content, lines)
        }
        
        this.endpoints.push(endpoint)
      }
    }
  }
  
  /**
   * Check if path traversal prevention is implemented
   */
  private checkPathValidation(content: string): boolean {
    // Look for path validation patterns
    const validationPatterns = [
      /path\.normalize/i,
      /path\.resolve/i,
      /\.\.\/|\.\.\\/, // Check if code looks for ../ patterns
      /path\s*traversal/i,
      /sanitize.*path/i,
      /validate.*path/i,
      /\.includes\(['"]\.\.['"]/, // Checks for '..' in path
    ]
    
    return validationPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * Check if authentication is required
   */
  private checkAuthProtection(content: string): boolean {
    const authPatterns = [
      /getServerSession/i,
      /requireAuth/i,
      /authenticate/i,
      /session.*required/i,
      /401.*Unauthorized/i
    ]
    
    return authPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * Check if operations are scoped to user's workspace
   */
  private checkWorkspaceScoping(content: string): boolean {
    const scopingPatterns = [
      /workspace.*id/i,
      /user.*workspace/i,
      /containerId/i,
      /projectId/i,
      /scope.*workspace/i,
      /workspace.*path/i
    ]
    
    return scopingPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * Detect security vulnerabilities in code
   */
  private detectVulnerabilities(content: string, lines: string[]): string[] {
    const vulnerabilities: string[] = []
    
    // Check for path traversal vulnerabilities
    if (content.includes('..') && !this.checkPathValidation(content)) {
      vulnerabilities.push('Potential path traversal vulnerability - no validation detected')
    }
    
    // Check for direct file system access without validation
    const dangerousPatterns = [
      { pattern: /fs\.readFileSync\([^)]*\)/g, message: 'Direct fs.readFileSync without path validation' },
      { pattern: /fs\.writeFileSync\([^)]*\)/g, message: 'Direct fs.writeFileSync without path validation' },
      { pattern: /fs\.unlinkSync\([^)]*\)/g, message: 'Direct fs.unlinkSync without path validation' },
      { pattern: /fs\.rmdirSync\([^)]*\)/g, message: 'Direct fs.rmdirSync without path validation' }
    ]
    
    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(content) && !this.checkPathValidation(content)) {
        vulnerabilities.push(message)
      }
    }
    
    // Check for missing authorization
    if (!this.checkAuthProtection(content)) {
      vulnerabilities.push('Missing authentication check')
    }
    
    // Check for missing workspace scoping
    if (!this.checkWorkspaceScoping(content)) {
      vulnerabilities.push('Missing workspace scoping - operations may not be isolated')
    }
    
    return vulnerabilities
  }
  
  /**
   * Task 7.2: Verify file upload security
   */
  private async verifyFileUploadSecurity(): Promise<void> {
    console.log('    → Verifying file upload security...')
    
    // Check for file upload endpoints
    const uploadEndpoints = this.endpoints.filter(e => 
      e.method === 'POST' && 
      (e.path.includes('upload') || e.path.includes('file'))
    )
    
    if (uploadEndpoints.length === 0) {
      this.securityChecks.push({
        name: 'File Upload Endpoints',
        passed: true,
        details: 'No file upload endpoints found',
        severity: Severity.INFO
      })
      return
    }
    
    // Check each upload endpoint for security measures
    for (const endpoint of uploadEndpoints) {
      const content = fs.readFileSync(endpoint.filePath, 'utf-8')
      
      const hasFileTypeValidation = this.checkFileTypeValidation(content)
      const hasFileSizeLimit = this.checkFileSizeLimit(content)
      const hasAuthCheck = endpoint.hasAuthCheck
      
      this.securityChecks.push({
        name: `Upload Security: ${endpoint.path}`,
        passed: hasFileTypeValidation && hasFileSizeLimit && hasAuthCheck,
        details: [
          `File type validation: ${hasFileTypeValidation ? '✓' : '✗'}`,
          `File size limit: ${hasFileSizeLimit ? '✓' : '✗'}`,
          `Authentication: ${hasAuthCheck ? '✓' : '✗'}`
        ].join(', '),
        severity: (!hasFileTypeValidation || !hasFileSizeLimit || !hasAuthCheck) 
          ? Severity.HIGH 
          : Severity.INFO
      })
    }
  }
  
  /**
   * Check if file type validation is implemented
   */
  private checkFileTypeValidation(content: string): boolean {
    const validationPatterns = [
      /mime.*type/i,
      /file.*type/i,
      /content.*type/i,
      /allowed.*extensions/i,
      /validate.*extension/i,
      /\.endsWith\(['"][.]/,
      /extension.*check/i
    ]
    
    return validationPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * Check if file size limits are enforced
   */
  private checkFileSizeLimit(content: string): boolean {
    const limitPatterns = [
      /max.*size/i,
      /size.*limit/i,
      /file.*size/i,
      /content.*length/i,
      /\.size\s*[<>]/,
      /bytes.*limit/i
    ]
    
    return limitPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * Audit the file system service implementation
   */
  private async auditFileSystemService(): Promise<void> {
    console.log('    → Auditing file system service...')
    
    const serviceFile = path.join(this.serviceBasePath, 'file-system.ts')
    
    if (!fs.existsSync(serviceFile)) {
      this.securityChecks.push({
        name: 'File System Service',
        passed: false,
        details: 'File system service not found',
        severity: Severity.HIGH
      })
      return
    }
    
    const content = fs.readFileSync(serviceFile, 'utf-8')
    
    // Check for mock implementations (No Mock Protocol)
    const hasMockImplementations = this.checkForMocks(content)
    
    this.securityChecks.push({
      name: 'No Mock Protocol - File System Service',
      passed: !hasMockImplementations,
      details: hasMockImplementations 
        ? 'Mock implementations detected in file system service'
        : 'No mock implementations found',
      severity: hasMockImplementations ? Severity.CRITICAL : Severity.INFO
    })
    
    // Check for backup mechanisms (Article VII Section 7.1)
    const hasBackupMechanism = this.checkBackupMechanism(content)
    
    this.securityChecks.push({
      name: 'Backup Mechanisms (Article VII Section 7.1)',
      passed: hasBackupMechanism,
      details: hasBackupMechanism
        ? 'Backup mechanism detected in file operations'
        : 'No backup mechanism found for file deletion',
      severity: hasBackupMechanism ? Severity.INFO : Severity.MEDIUM
    })
    
    // Check for path validation in service methods
    const hasPathValidation = this.checkPathValidation(content)
    
    this.securityChecks.push({
      name: 'Path Validation in Service',
      passed: hasPathValidation,
      details: hasPathValidation
        ? 'Path validation detected in service methods'
        : 'No path validation found in service methods',
      severity: hasPathValidation ? Severity.INFO : Severity.HIGH
    })
  }
  
  /**
   * Check for mock implementations
   */
  private checkForMocks(content: string): boolean {
    const mockPatterns = [
      /mock\w+/i,
      /\/\/\s*mock/i,
      /getMock/i,
      /return.*mock/i,
      /const\s+mock/i
    ]
    
    return mockPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * Check for backup mechanisms
   */
  private checkBackupMechanism(content: string): boolean {
    const backupPatterns = [
      /backup/i,
      /\.bak/i,
      /snapshot/i,
      /archive/i,
      /restore/i,
      /versioning/i
    ]
    
    return backupPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * Analyze endpoints and generate findings
   */
  private analyzeEndpoints(): Finding[] {
    const findings: Finding[] = []
    
    if (this.endpoints.length === 0) {
      findings.push({
        id: randomUUID(),
        category: this.category,
        severity: Severity.INFO,
        title: 'No File System API Endpoints',
        description: 'No file system API endpoints found. This may be expected if file operations are handled differently.',
        remediation: [
          'If file system operations are needed, implement secure API endpoints',
          'Ensure all file operations include path validation and workspace scoping'
        ],
        requirement: '6.1, 6.2'
      })
      return findings
    }
    
    // Check each endpoint for security issues
    for (const endpoint of this.endpoints) {
      // Path traversal prevention
      if (!endpoint.hasPathValidation) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.CRITICAL,
          title: `Missing Path Traversal Prevention: ${endpoint.path}`,
          description: `Endpoint ${endpoint.method} ${endpoint.path} does not implement path traversal prevention`,
          filePath: endpoint.filePath,
          evidence: 'No path validation patterns detected',
          remediation: [
            'Implement path.normalize() or path.resolve() to sanitize paths',
            'Check for ".." sequences in paths and reject them',
            'Use allowlist of permitted directories',
            'Validate all file paths before operations'
          ],
          constitutionalArticle: 'Article VII, Section 7.1',
          requirement: '6.1'
        })
      }
      
      // Authentication check
      if (!endpoint.hasAuthCheck) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.CRITICAL,
          title: `Missing Authentication: ${endpoint.path}`,
          description: `Endpoint ${endpoint.method} ${endpoint.path} does not require authentication`,
          filePath: endpoint.filePath,
          evidence: 'No authentication check detected',
          remediation: [
            'Add getServerSession(authOptions) check',
            'Return 401 Unauthorized for unauthenticated requests',
            'Verify user has permission to access requested files'
          ],
          constitutionalArticle: 'Article VII, Section 7.1',
          requirement: '6.2'
        })
      }
      
      // Workspace scoping
      if (!endpoint.hasWorkspaceScoping) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.HIGH,
          title: `Missing Workspace Scoping: ${endpoint.path}`,
          description: `Endpoint ${endpoint.method} ${endpoint.path} does not scope operations to user's workspace`,
          filePath: endpoint.filePath,
          evidence: 'No workspace scoping patterns detected',
          remediation: [
            'Scope all file operations to user\'s workspace directory',
            'Verify user owns the workspace before allowing operations',
            'Use workspace ID or container ID to isolate operations',
            'Prevent access to files outside user\'s workspace'
          ],
          constitutionalArticle: 'Article II, Section 2.1',
          requirement: '6.3'
        })
      }
      
      // Report vulnerabilities
      for (const vulnerability of endpoint.vulnerabilities) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.HIGH,
          title: `Security Vulnerability: ${endpoint.path}`,
          description: vulnerability,
          filePath: endpoint.filePath,
          remediation: [
            'Review and fix the identified vulnerability',
            'Add appropriate security checks',
            'Test with security scanning tools'
          ],
          requirement: '6.1, 6.2, 6.3'
        })
      }
    }
    
    return findings
  }
  
  /**
   * Analyze upload security and generate findings
   */
  private analyzeUploadSecurity(): Finding[] {
    const findings: Finding[] = []
    
    const uploadChecks = this.securityChecks.filter(c => 
      c.name.startsWith('Upload Security:')
    )
    
    for (const check of uploadChecks) {
      if (!check.passed) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: check.severity,
          title: `File Upload Security Issue: ${check.name}`,
          description: check.details,
          remediation: [
            'Implement file type validation using MIME type checking',
            'Enforce file size limits to prevent DoS attacks',
            'Require authentication for all file uploads',
            'Scan uploaded files for malware',
            'Store uploaded files outside web root'
          ],
          constitutionalArticle: 'Article VII, Section 7.1',
          requirement: '6.3, 6.4'
        })
      }
    }
    
    return findings
  }
  
  /**
   * Analyze service security and generate findings
   */
  private analyzeServiceSecurity(): Finding[] {
    const findings: Finding[] = []
    
    for (const check of this.securityChecks) {
      if (!check.passed && check.severity !== Severity.INFO) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: check.severity,
          title: check.name,
          description: check.details,
          filePath: path.join(this.buildspacesRoot, 'lib', 'services', 'file-system.ts'),
          remediation: this.getRemediationForCheck(check.name),
          constitutionalArticle: this.getConstitutionalArticleForCheck(check.name),
          requirement: this.getRequirementForCheck(check.name)
        })
      }
    }
    
    return findings
  }
  
  /**
   * Get remediation steps for a specific check
   */
  private getRemediationForCheck(checkName: string): string[] {
    if (checkName.includes('No Mock Protocol')) {
      return [
        'Remove all mock implementations from file system service',
        'Implement real file system operations using container APIs',
        'Connect to actual storage backend',
        'Ensure all data is real and verifiable'
      ]
    }
    
    if (checkName.includes('Backup Mechanisms')) {
      return [
        'Implement backup mechanism for file deletion operations',
        'Create snapshots before destructive operations',
        'Provide file recovery functionality',
        'Comply with Article VII Section 7.1 requirements'
      ]
    }
    
    if (checkName.includes('Path Validation')) {
      return [
        'Add path validation to all service methods',
        'Use path.normalize() and path.resolve()',
        'Check for path traversal attempts',
        'Validate paths against allowed directories'
      ]
    }
    
    return ['Review and fix the identified issue']
  }
  
  /**
   * Get constitutional article for a specific check
   */
  private getConstitutionalArticleForCheck(checkName: string): string {
    if (checkName.includes('No Mock Protocol')) {
      return 'Article VIII, Section 8.3'
    }
    
    if (checkName.includes('Backup Mechanisms')) {
      return 'Article VII, Section 7.1'
    }
    
    return 'Article VII, Section 7.1'
  }
  
  /**
   * Get requirement for a specific check
   */
  private getRequirementForCheck(checkName: string): string {
    if (checkName.includes('No Mock Protocol')) {
      return '6.1, 6.2, 6.3'
    }
    
    if (checkName.includes('Backup Mechanisms')) {
      return '6.5'
    }
    
    if (checkName.includes('Path Validation')) {
      return '6.1, 6.2'
    }
    
    return '6.1, 6.2, 6.3, 6.4, 6.5'
  }
  
  /**
   * Calculate overall score based on findings
   */
  private calculateScore(findings: Finding[]): number {
    if (findings.length === 0) {
      return 100
    }
    
    // Weight findings by severity
    const weights = {
      [Severity.CRITICAL]: 20,
      [Severity.HIGH]: 10,
      [Severity.MEDIUM]: 5,
      [Severity.LOW]: 2,
      [Severity.INFO]: 0
    }
    
    const totalDeductions = findings.reduce((sum, finding) => {
      return sum + weights[finding.severity]
    }, 0)
    
    const score = Math.max(0, 100 - totalDeductions)
    return score
  }
}
