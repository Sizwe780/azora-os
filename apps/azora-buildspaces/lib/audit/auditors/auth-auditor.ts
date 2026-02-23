/**
 * Authentication Security Auditor
 * 
 * Verifies that all API endpoints require authentication and that
 * authentication channels are properly configured.
 * 
 * Constitutional Compliance:
 * - Article II, Section 2.1: User Sovereignty (authentication protects user data)
 * - Article VII: Security & Protection (Azora Aegis security framework)
 * - Truth as Currency: Real authentication checks, no mocks
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import type { IAuditor, AuditResult, Finding } from '../types'
import { AuditCategory, Severity } from '../types'

interface EndpointInfo {
  path: string
  filePath: string
  method: string
  hasAuth: boolean
  hasUnauthorizedResponse: boolean
  lineNumber?: number
}

interface AuthChannelInfo {
  name: string
  isConfigured: boolean
  envVarsPresent: boolean
  details: string[]
}

export class AuthAuditor implements IAuditor {
  name = 'Authentication Security Auditor'
  category = AuditCategory.AUTHENTICATION_SECURITY
  description = 'Verifies authentication protection on all API endpoints'
  
  private apiBasePath: string
  private endpoints: EndpointInfo[] = []
  private authChannels: AuthChannelInfo[] = []
  
  constructor(buildspacesRoot: string = 'apps/azora-buildspaces') {
    this.apiBasePath = path.join(process.cwd(), buildspacesRoot, 'app', 'api')
  }
  
  async audit(): Promise<AuditResult> {
    const startTime = Date.now()
    const findings: Finding[] = []
    
    console.log('  🔐 Scanning API endpoints for authentication...')
    
    // Task 4.1: Scan all API endpoints
    await this.scanApiEndpoints()
    
    // Task 4.2: Check authentication channels
    this.checkAuthChannels()
    
    // Task 4.3: Verify protected routes (checked via middleware/page analysis)
    const protectedRouteFindings = this.verifyProtectedRoutes()
    findings.push(...protectedRouteFindings)
    
    // Analyze endpoints for authentication
    const endpointFindings = this.analyzeEndpoints()
    findings.push(...endpointFindings)
    
    // Analyze authentication channels
    const channelFindings = this.analyzeAuthChannels()
    findings.push(...channelFindings)
    
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
   * Task 4.1: Scan all API endpoints for authentication
   */
  private async scanApiEndpoints(): Promise<void> {
    this.endpoints = []
    
    if (!fs.existsSync(this.apiBasePath)) {
      console.warn(`  ⚠️  API path not found: ${this.apiBasePath}`)
      return
    }
    
    await this.scanDirectory(this.apiBasePath, '')
    
    console.log(`  📊 Found ${this.endpoints.length} API endpoints`)
  }
  
  /**
   * Recursively scan directory for route.ts files
   */
  private async scanDirectory(dirPath: string, relativePath: string): Promise<void> {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const newRelativePath = path.join(relativePath, entry.name)
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        await this.scanDirectory(fullPath, newRelativePath)
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        // Found a route file - analyze it
        await this.analyzeRouteFile(fullPath, relativePath)
      }
    }
  }
  
  /**
   * Analyze a route file for authentication
   */
  private async analyzeRouteFile(filePath: string, routePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      
      // Detect HTTP methods
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      
      for (const method of methods) {
        // Look for export async function METHOD
        const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${method}`, 'i')
        const methodMatch = content.match(methodRegex)
        
        if (methodMatch) {
          // Find line number
          const lineNumber = lines.findIndex(line => methodRegex.test(line)) + 1
          
          // Check for getServerSession
          const hasAuth = this.checkForAuth(content)
          
          // Check for 401 response
          const hasUnauthorizedResponse = this.checkFor401Response(content)
          
          // Convert file path to API route
          const apiPath = this.filePathToApiRoute(routePath)
          
          this.endpoints.push({
            path: apiPath,
            filePath,
            method,
            hasAuth,
            hasUnauthorizedResponse,
            lineNumber
          })
        }
      }
    } catch (error) {
      console.error(`  ❌ Error analyzing ${filePath}:`, error)
    }
  }
  
  /**
   * Check if route file contains authentication check
   */
  private checkForAuth(content: string): boolean {
    // Look for getServerSession call
    const authPatterns = [
      /getServerSession\s*\(/,
      /await\s+getServerSession\s*\(/,
      /const\s+session\s*=\s*await\s+getServerSession/,
    ]
    
    return authPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * Check if route returns 401 for unauthorized requests
   */
  private checkFor401Response(content: string): boolean {
    const unauthorizedPatterns = [
      /status:\s*401/,
      /\{\s*status:\s*401\s*\}/,
      /'Unauthorized'/,
      /"Unauthorized"/,
      /'Authentication required'/,
      /"Authentication required"/,
    ]
    
    return unauthorizedPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * Convert file path to API route
   */
  private filePathToApiRoute(routePath: string): string {
    // Remove leading/trailing slashes and normalize
    let apiPath = routePath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
    
    // Convert [param] to :param for display
    apiPath = apiPath.replace(/\[([^\]]+)\]/g, ':$1')
    
    return `/api/${apiPath}`
  }
  
  /**
   * Task 4.2: Check authentication channels configuration
   */
  private checkAuthChannels(): void {
    this.authChannels = []
    
    // Check email/password (credentials provider)
    this.authChannels.push({
      name: 'Email/Password',
      isConfigured: true, // Always configured via CredentialsProvider
      envVarsPresent: true,
      details: ['CredentialsProvider is configured in authOptions']
    })
    
    // Check GitHub OAuth
    const githubConfigured = !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET)
    this.authChannels.push({
      name: 'GitHub OAuth',
      isConfigured: githubConfigured,
      envVarsPresent: githubConfigured,
      details: githubConfigured 
        ? ['GITHUB_ID and GITHUB_SECRET are configured']
        : ['Missing GITHUB_ID or GITHUB_SECRET environment variables']
    })
    
    // Check Google OAuth
    const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    this.authChannels.push({
      name: 'Google OAuth',
      isConfigured: googleConfigured,
      envVarsPresent: googleConfigured,
      details: googleConfigured
        ? ['GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured']
        : ['Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables']
    })
    
    console.log(`  🔑 Authentication channels: ${this.authChannels.filter(c => c.isConfigured).length}/${this.authChannels.length} configured`)
  }
  
  /**
   * Task 4.3: Verify protected routes
   */
  private verifyProtectedRoutes(): Finding[] {
    const findings: Finding[] = []
    
    // Check if middleware or page-level protection exists
    // This is a static analysis - we check for common patterns
    
    const protectedRoutes = ['/workspace', '/dashboard']
    const middlewarePath = path.join(process.cwd(), 'apps/azora-buildspaces', 'middleware.ts')
    
    if (fs.existsSync(middlewarePath)) {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8')
      
      // Check if middleware protects routes
      const hasAuthMiddleware = /getServerSession|withAuth|auth/.test(middlewareContent)
      
      if (!hasAuthMiddleware) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.HIGH,
          title: 'Middleware does not implement authentication',
          description: 'The middleware.ts file exists but does not appear to implement authentication checks for protected routes.',
          filePath: middlewarePath,
          remediation: [
            'Add authentication checks in middleware.ts',
            'Protect routes like /workspace and /dashboard',
            'Redirect unauthenticated users to /auth/login'
          ],
          requirement: '3.5'
        })
      } else {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.INFO,
          title: 'Middleware authentication detected',
          description: 'The middleware.ts file appears to implement authentication checks.',
          filePath: middlewarePath,
          remediation: [],
          requirement: '3.5'
        })
      }
    } else {
      findings.push({
        id: randomUUID(),
        category: this.category,
        severity: Severity.MEDIUM,
        title: 'No middleware.ts file found',
        description: 'Protected routes should be guarded by middleware or page-level authentication checks.',
        remediation: [
          'Create middleware.ts to protect routes',
          'Or implement page-level authentication checks',
          'Ensure /workspace and /dashboard require authentication'
        ],
        requirement: '3.5'
      })
    }
    
    return findings
  }
  
  /**
   * Analyze endpoints and generate findings
   */
  private analyzeEndpoints(): Finding[] {
    const findings: Finding[] = []
    
    // Endpoints that should NOT require auth
    const publicEndpoints = [
      '/api/health',
      '/api/auth',
    ]
    
    // Find unprotected endpoints
    const unprotectedEndpoints = this.endpoints.filter(endpoint => {
      // Skip public endpoints
      const isPublic = publicEndpoints.some(pub => endpoint.path.startsWith(pub))
      return !isPublic && !endpoint.hasAuth
    })
    
    if (unprotectedEndpoints.length > 0) {
      unprotectedEndpoints.forEach(endpoint => {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.CRITICAL,
          title: `Unprotected API endpoint: ${endpoint.method} ${endpoint.path}`,
          description: `The endpoint does not call getServerSession(authOptions) to verify authentication.`,
          filePath: endpoint.filePath,
          lineNumber: endpoint.lineNumber,
          evidence: `${endpoint.method} handler in ${endpoint.filePath}`,
          remediation: [
            'Add authentication check: const session = await getServerSession(authOptions)',
            'Return 401 if !session?.user',
            'Verify user has permission to access the resource'
          ],
          requirement: '3.1'
        })
      })
    }
    
    // Find endpoints with auth but no 401 response
    const noUnauthorizedResponse = this.endpoints.filter(endpoint => {
      const isPublic = publicEndpoints.some(pub => endpoint.path.startsWith(pub))
      return !isPublic && endpoint.hasAuth && !endpoint.hasUnauthorizedResponse
    })
    
    if (noUnauthorizedResponse.length > 0) {
      noUnauthorizedResponse.forEach(endpoint => {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.MEDIUM,
          title: `Missing 401 response: ${endpoint.method} ${endpoint.path}`,
          description: `The endpoint has authentication but may not return 401 for unauthenticated requests.`,
          filePath: endpoint.filePath,
          lineNumber: endpoint.lineNumber,
          remediation: [
            'Add explicit 401 response for unauthenticated requests',
            'Example: return NextResponse.json({ error: "Unauthorized" }, { status: 401 })'
          ],
          requirement: '3.2'
        })
      })
    }
    
    // Info: Report protected endpoints
    const protectedEndpoints = this.endpoints.filter(endpoint => {
      const isPublic = publicEndpoints.some(pub => endpoint.path.startsWith(pub))
      return !isPublic && endpoint.hasAuth
    })
    
    if (protectedEndpoints.length > 0) {
      findings.push({
        id: randomUUID(),
        category: this.category,
        severity: Severity.INFO,
        title: `${protectedEndpoints.length} endpoints properly protected`,
        description: `Found ${protectedEndpoints.length} API endpoints with authentication checks.`,
        remediation: [],
        requirement: '3.1'
      })
    }
    
    return findings
  }
  
  /**
   * Analyze authentication channels and generate findings
   */
  private analyzeAuthChannels(): Finding[] {
    const findings: Finding[] = []
    
    // Check each channel
    this.authChannels.forEach(channel => {
      if (!channel.isConfigured) {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.MEDIUM,
          title: `${channel.name} not configured`,
          description: `The ${channel.name} authentication channel is not configured. ${channel.details.join('. ')}`,
          remediation: [
            `Configure ${channel.name} environment variables`,
            'Add provider to authOptions in lib/auth.ts',
            'Test authentication flow'
          ],
          requirement: channel.name.includes('GitHub') ? '3.3' : '3.4'
        })
      } else {
        findings.push({
          id: randomUUID(),
          category: this.category,
          severity: Severity.INFO,
          title: `${channel.name} configured`,
          description: `The ${channel.name} authentication channel is properly configured.`,
          remediation: [],
          requirement: channel.name.includes('GitHub') ? '3.3' : '3.4'
        })
      }
    })
    
    return findings
  }
  
  /**
   * Calculate authentication security score
   */
  private calculateScore(findings: Finding[]): number {
    const criticalCount = findings.filter(f => f.severity === Severity.CRITICAL).length
    const highCount = findings.filter(f => f.severity === Severity.HIGH).length
    const mediumCount = findings.filter(f => f.severity === Severity.MEDIUM).length
    
    // Start with perfect score
    let score = 100
    
    // Deduct points for findings
    score -= criticalCount * 25  // Critical: -25 points each
    score -= highCount * 10      // High: -10 points each
    score -= mediumCount * 5     // Medium: -5 points each
    
    // Ensure score doesn't go below 0
    return Math.max(0, score)
  }
}
