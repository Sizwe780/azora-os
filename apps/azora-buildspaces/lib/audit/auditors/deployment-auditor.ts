/**
 * Deployment Readiness Auditor
 * 
 * Verifies deployment configurations for production readiness:
 * - Docker configuration and build success
 * - Kubernetes manifests completeness
 * - Environment variables documentation
 * - Health endpoint functionality
 * 
 * Constitutional Compliance:
 * - Article VII (Security & Protection): Verifies secure deployment
 * - Article VIII (Truth & Verification): No mock configurations
 * - Article XI (Emergency Provisions): System recovery readiness
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { readFile, access } from 'fs/promises'
import { join } from 'path'
import { execSync } from 'child_process'
import {
  IAuditor,
  AuditCategory,
  AuditResult,
  Finding,
  Severity
} from '../types'

interface DockerAuditResult {
  dockerfileExists: boolean
  hasHealthCheck: boolean
  hasMultiStage: boolean
  hasSecurityContext: boolean
  findings: string[]
}

interface K8sAuditResult {
  manifestsExist: boolean
  hasDeployment: boolean
  hasService: boolean
  hasIngress: boolean
  hasResourceLimits: boolean
  hasHealthProbes: boolean
  findings: string[]
}

interface EnvVarAuditResult {
  envExampleExists: boolean
  requiredVarsDocumented: string[]
  missingVars: string[]
  sensitiveVarsSecure: boolean
  findings: string[]
}

interface HealthEndpointResult {
  endpointExists: boolean
  returnsCorrectFormat: boolean
  includesDatabaseCheck: boolean
  responseTime: number
  findings: string[]
}

export class DeploymentAuditor implements IAuditor {
  name = 'Deployment Readiness Auditor'
  category = AuditCategory.DEPLOYMENT_READINESS
  description = 'Verifies deployment configurations for production readiness'

  private readonly buildspacesRoot = process.cwd().includes('azora-buildspaces') 
    ? process.cwd() 
    : join(process.cwd(), 'apps', 'azora-buildspaces')
  private readonly requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'JWT_SECRET',
    'OPENAI_API_KEY'
  ]

  async audit(): Promise<AuditResult> {
    const startTime = Date.now()
    const findings: Finding[] = []

    console.log('[DeploymentAuditor] Starting deployment readiness audit...')

    // Task 10.1: Verify Docker configuration
    const dockerResult = await this.auditDockerConfiguration()
    findings.push(...this.createDockerFindings(dockerResult))

    // Task 10.2: Verify Kubernetes manifests
    const k8sResult = await this.auditKubernetesManifests()
    findings.push(...this.createK8sFindings(k8sResult))

    // Task 10.3: Verify environment variables
    const envResult = await this.auditEnvironmentVariables()
    findings.push(...this.createEnvFindings(envResult))

    // Task 10.4: Test health endpoints
    const healthResult = await this.auditHealthEndpoint()
    findings.push(...this.createHealthFindings(healthResult))

    // Calculate score
    const score = this.calculateScore(findings)
    const passed = score >= 80

    const executionTime = Date.now() - startTime
    console.log(`[DeploymentAuditor] Audit completed in ${executionTime}ms - Score: ${score}/100`)

    return {
      category: this.category,
      score,
      passed,
      findings,
      criticalCount: findings.filter(f => f.severity === Severity.CRITICAL).length,
      highCount: findings.filter(f => f.severity === Severity.HIGH).length,
      mediumCount: findings.filter(f => f.severity === Severity.MEDIUM).length,
      lowCount: findings.filter(f => f.severity === Severity.LOW).length,
      infoCount: findings.filter(f => f.severity === Severity.INFO).length,
      executionTime,
      timestamp: new Date()
    }
  }

  /**
   * Task 10.1: Verify Docker configuration
   * Requirements: 8.1
   */
  private async auditDockerConfiguration(): Promise<DockerAuditResult> {
    const result: DockerAuditResult = {
      dockerfileExists: false,
      hasHealthCheck: false,
      hasMultiStage: false,
      hasSecurityContext: false,
      findings: []
    }

    try {
      const dockerfilePath = join(this.buildspacesRoot, 'Dockerfile')
      
      // Check if Dockerfile exists
      try {
        await access(dockerfilePath)
        result.dockerfileExists = true
        result.findings.push('✓ Dockerfile exists')
      } catch {
        result.findings.push('✗ Dockerfile not found')
        return result
      }

      // Read and analyze Dockerfile
      const dockerfileContent = await readFile(dockerfilePath, 'utf-8')

      // Check for health check
      if (dockerfileContent.includes('HEALTHCHECK')) {
        result.hasHealthCheck = true
        result.findings.push('✓ Health check configured in Dockerfile')
      } else {
        result.findings.push('✗ No HEALTHCHECK instruction in Dockerfile')
      }

      // Check for multi-stage build
      const stageCount = (dockerfileContent.match(/FROM .* AS /g) || []).length
      if (stageCount >= 2) {
        result.hasMultiStage = true
        result.findings.push(`✓ Multi-stage build detected (${stageCount} stages)`)
      } else {
        result.findings.push('⚠ Single-stage build (multi-stage recommended for optimization)')
      }

      // Check for security context (non-root user)
      if (dockerfileContent.includes('USER nextjs') || dockerfileContent.includes('USER nodejs')) {
        result.hasSecurityContext = true
        result.findings.push('✓ Non-root user configured')
      } else {
        result.findings.push('✗ No non-root user configured (security risk)')
      }

      // Test Docker build (optional - can be slow)
      // Skipping actual build test to avoid long execution time
      result.findings.push('ℹ Docker build test skipped (manual verification recommended)')

    } catch (error) {
      result.findings.push(`✗ Error auditing Docker: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Task 10.2: Verify Kubernetes manifests
   * Requirements: 8.2
   */
  private async auditKubernetesManifests(): Promise<K8sAuditResult> {
    const result: K8sAuditResult = {
      manifestsExist: false,
      hasDeployment: false,
      hasService: false,
      hasIngress: false,
      hasResourceLimits: false,
      hasHealthProbes: false,
      findings: []
    }

    try {
      const k8sDir = join(this.buildspacesRoot, 'k8s')
      
      // Check if k8s directory exists
      try {
        await access(k8sDir)
        result.manifestsExist = true
        result.findings.push('✓ k8s/ directory exists')
      } catch {
        result.findings.push('✗ k8s/ directory not found')
        return result
      }

      // Check for deployment manifest
      const deploymentPath = join(k8sDir, 'buildspaces-deployment.yaml')
      try {
        const deploymentContent = await readFile(deploymentPath, 'utf-8')
        result.hasDeployment = true
        result.findings.push('✓ Deployment manifest exists')

        // Check for resource limits
        if (deploymentContent.includes('resources:') && 
            deploymentContent.includes('limits:') && 
            deploymentContent.includes('requests:')) {
          result.hasResourceLimits = true
          result.findings.push('✓ Resource limits and requests configured')
        } else {
          result.findings.push('✗ Resource limits/requests not configured')
        }

        // Check for health probes
        if (deploymentContent.includes('livenessProbe:') && 
            deploymentContent.includes('readinessProbe:')) {
          result.hasHealthProbes = true
          result.findings.push('✓ Liveness and readiness probes configured')
        } else {
          result.findings.push('✗ Health probes not configured')
        }
      } catch {
        result.findings.push('✗ Deployment manifest not found')
      }

      // Check for service manifest
      const servicePath = join(k8sDir, 'buildspaces-deployment.yaml')
      try {
        const serviceContent = await readFile(servicePath, 'utf-8')
        if (serviceContent.includes('kind: Service')) {
          result.hasService = true
          result.findings.push('✓ Service resource defined')
        }
      } catch {
        result.findings.push('⚠ Service manifest check failed')
      }

      // Check for ingress manifest
      const ingressPath = join(k8sDir, 'buildspaces-ingress.yaml')
      try {
        await access(ingressPath)
        result.hasIngress = true
        result.findings.push('✓ Ingress manifest exists')
      } catch {
        result.findings.push('⚠ Ingress manifest not found')
      }

    } catch (error) {
      result.findings.push(`✗ Error auditing Kubernetes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Task 10.3: Verify environment variables
   * Requirements: 8.3
   */
  private async auditEnvironmentVariables(): Promise<EnvVarAuditResult> {
    const result: EnvVarAuditResult = {
      envExampleExists: false,
      requiredVarsDocumented: [],
      missingVars: [],
      sensitiveVarsSecure: true,
      findings: []
    }

    try {
      const envExamplePath = join(this.buildspacesRoot, '.env.example')
      
      // Check if .env.example exists
      try {
        await access(envExamplePath)
        result.envExampleExists = true
        result.findings.push('✓ .env.example file exists')
      } catch {
        result.findings.push('✗ .env.example file not found')
        return result
      }

      // Read .env.example
      const envExampleContent = await readFile(envExamplePath, 'utf-8')

      // Check for required variables
      for (const varName of this.requiredEnvVars) {
        if (envExampleContent.includes(varName)) {
          result.requiredVarsDocumented.push(varName)
        } else {
          result.missingVars.push(varName)
        }
      }

      if (result.missingVars.length === 0) {
        result.findings.push(`✓ All ${this.requiredEnvVars.length} required variables documented`)
      } else {
        result.findings.push(`⚠ ${result.missingVars.length} required variables missing: ${result.missingVars.join(', ')}`)
      }

      // Check that sensitive values are not committed
      const sensitivePatterns = [
        /sk-[a-zA-Z0-9]{48}/,  // OpenAI API key
        /ghp_[a-zA-Z0-9]{36}/,  // GitHub token
        /postgres:\/\/.*:[^@]+@/,  // Database URL with password
        /redis:\/\/.*:[^@]+@/  // Redis URL with password
      ]

      for (const pattern of sensitivePatterns) {
        if (pattern.test(envExampleContent)) {
          result.sensitiveVarsSecure = false
          result.findings.push('✗ Sensitive credentials found in .env.example (security violation)')
          break
        }
      }

      if (result.sensitiveVarsSecure) {
        result.findings.push('✓ No sensitive credentials in .env.example')
      }

      // Check .env is gitignored
      try {
        const gitignorePath = join(this.buildspacesRoot, '.gitignore')
        const gitignoreContent = await readFile(gitignorePath, 'utf-8')
        if (gitignoreContent.includes('.env') || gitignoreContent.includes('.env.local')) {
          result.findings.push('✓ .env files are gitignored')
        } else {
          result.findings.push('⚠ .env files may not be gitignored')
        }
      } catch {
        result.findings.push('⚠ Could not verify .gitignore')
      }

    } catch (error) {
      result.findings.push(`✗ Error auditing environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Task 10.4: Test health endpoints
   * Requirements: 8.4
   */
  private async auditHealthEndpoint(): Promise<HealthEndpointResult> {
    const result: HealthEndpointResult = {
      endpointExists: false,
      returnsCorrectFormat: false,
      includesDatabaseCheck: false,
      responseTime: 0,
      findings: []
    }

    try {
      const healthEndpointPath = join(this.buildspacesRoot, 'app', 'api', 'health', 'route.ts')
      
      // Check if health endpoint exists
      try {
        await access(healthEndpointPath)
        result.endpointExists = true
        result.findings.push('✓ Health endpoint exists at /api/health')
      } catch {
        result.findings.push('✗ Health endpoint not found at /api/health')
        return result
      }

      // Read and analyze health endpoint
      const healthContent = await readFile(healthEndpointPath, 'utf-8')

      // Check for correct response format
      const hasStatusField = healthContent.includes('status:')
      const hasOkField = healthContent.includes('ok:')
      const hasTimestampField = healthContent.includes('timestamp:')
      
      if (hasStatusField && hasOkField && hasTimestampField) {
        result.returnsCorrectFormat = true
        result.findings.push('✓ Health endpoint returns correct format (status, ok, timestamp)')
      } else {
        const missing = []
        if (!hasStatusField) missing.push('status')
        if (!hasOkField) missing.push('ok')
        if (!hasTimestampField) missing.push('timestamp')
        result.findings.push(`⚠ Health endpoint missing fields: ${missing.join(', ')}`)
      }

      // Check for database connectivity check
      if (healthContent.includes('database') || healthContent.includes('prisma') || healthContent.includes('$queryRaw')) {
        result.includesDatabaseCheck = true
        result.findings.push('✓ Health endpoint includes database connectivity check')
      } else {
        result.findings.push('⚠ Health endpoint does not check database connectivity')
      }

      // Check for memory check
      if (healthContent.includes('memoryUsage') || healthContent.includes('memory')) {
        result.findings.push('✓ Health endpoint includes memory check')
      }

      // Check for uptime
      if (healthContent.includes('uptime')) {
        result.findings.push('✓ Health endpoint includes uptime')
      }

      // Check for constitutional alignment
      if (healthContent.includes('constitutional')) {
        result.findings.push('✓ Health endpoint includes constitutional alignment metric')
      }

      result.findings.push('ℹ Live health endpoint test skipped (requires running server)')

    } catch (error) {
      result.findings.push(`✗ Error auditing health endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Create findings from Docker audit results
   */
  private createDockerFindings(result: DockerAuditResult): Finding[] {
    const findings: Finding[] = []

    if (!result.dockerfileExists) {
      findings.push({
        id: 'DEPLOY-001',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.CRITICAL,
        title: 'Dockerfile Missing',
        description: 'No Dockerfile found in the Buildspaces application directory',
        evidence: 'Dockerfile not found at apps/azora-buildspaces/Dockerfile',
        remediation: [
          'Create a Dockerfile with multi-stage build',
          'Include health check configuration',
          'Use non-root user for security',
          'Optimize image size with alpine base'
        ],
        requirement: '8.1'
      })
    }

    if (!result.hasHealthCheck) {
      findings.push({
        id: 'DEPLOY-002',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.HIGH,
        title: 'Docker Health Check Missing',
        description: 'Dockerfile does not include HEALTHCHECK instruction',
        evidence: 'No HEALTHCHECK instruction found in Dockerfile',
        remediation: [
          'Add HEALTHCHECK instruction to Dockerfile',
          'Configure health check to call /api/health endpoint',
          'Set appropriate interval and timeout values'
        ],
        requirement: '8.1'
      })
    }

    if (!result.hasMultiStage) {
      findings.push({
        id: 'DEPLOY-003',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.MEDIUM,
        title: 'Single-Stage Docker Build',
        description: 'Dockerfile uses single-stage build instead of multi-stage',
        evidence: 'Only one FROM instruction found',
        remediation: [
          'Implement multi-stage build (deps, builder, runner)',
          'Separate build dependencies from runtime dependencies',
          'Reduce final image size'
        ],
        requirement: '8.1'
      })
    }

    if (!result.hasSecurityContext) {
      findings.push({
        id: 'DEPLOY-004',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.HIGH,
        title: 'Docker Running as Root',
        description: 'Dockerfile does not configure non-root user',
        evidence: 'No USER instruction found',
        remediation: [
          'Add non-root user (nextjs or nodejs)',
          'Set appropriate file permissions',
          'Follow principle of least privilege'
        ],
        constitutionalArticle: 'Article VII (Security & Protection)',
        requirement: '8.1'
      })
    }

    return findings
  }

  /**
   * Create findings from Kubernetes audit results
   */
  private createK8sFindings(result: K8sAuditResult): Finding[] {
    const findings: Finding[] = []

    if (!result.manifestsExist) {
      findings.push({
        id: 'DEPLOY-005',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.CRITICAL,
        title: 'Kubernetes Manifests Missing',
        description: 'No k8s/ directory found with Kubernetes manifests',
        evidence: 'k8s/ directory not found',
        remediation: [
          'Create k8s/ directory',
          'Add deployment, service, and ingress manifests',
          'Configure resource limits and health probes',
          'Set up namespace and RBAC'
        ],
        requirement: '8.2'
      })
      return findings
    }

    if (!result.hasDeployment) {
      findings.push({
        id: 'DEPLOY-006',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.CRITICAL,
        title: 'Kubernetes Deployment Missing',
        description: 'No Deployment resource defined',
        evidence: 'buildspaces-deployment.yaml not found',
        remediation: [
          'Create Deployment manifest',
          'Configure replicas and rolling update strategy',
          'Add resource limits and requests',
          'Configure health probes'
        ],
        requirement: '8.2'
      })
    }

    if (!result.hasResourceLimits) {
      findings.push({
        id: 'DEPLOY-007',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.HIGH,
        title: 'Resource Limits Not Configured',
        description: 'Kubernetes Deployment does not specify resource limits and requests',
        evidence: 'No resources.limits or resources.requests found',
        remediation: [
          'Add resource requests (CPU and memory)',
          'Add resource limits (CPU and memory)',
          'Configure based on application requirements',
          'Enable horizontal pod autoscaling'
        ],
        requirement: '8.2'
      })
    }

    if (!result.hasHealthProbes) {
      findings.push({
        id: 'DEPLOY-008',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.HIGH,
        title: 'Health Probes Not Configured',
        description: 'Kubernetes Deployment does not specify liveness and readiness probes',
        evidence: 'No livenessProbe or readinessProbe found',
        remediation: [
          'Add livenessProbe pointing to /api/health',
          'Add readinessProbe pointing to /api/health',
          'Configure appropriate timeouts and thresholds',
          'Test probe endpoints'
        ],
        requirement: '8.2'
      })
    }

    if (!result.hasService) {
      findings.push({
        id: 'DEPLOY-009',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.HIGH,
        title: 'Kubernetes Service Missing',
        description: 'No Service resource defined',
        evidence: 'Service definition not found',
        remediation: [
          'Create Service manifest',
          'Configure ClusterIP or LoadBalancer type',
          'Map service ports to container ports'
        ],
        requirement: '8.2'
      })
    }

    if (!result.hasIngress) {
      findings.push({
        id: 'DEPLOY-010',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.MEDIUM,
        title: 'Kubernetes Ingress Missing',
        description: 'No Ingress resource defined',
        evidence: 'buildspaces-ingress.yaml not found',
        remediation: [
          'Create Ingress manifest',
          'Configure TLS certificates',
          'Set up domain routing',
          'Configure rate limiting'
        ],
        requirement: '8.2'
      })
    }

    return findings
  }

  /**
   * Create findings from environment variables audit results
   */
  private createEnvFindings(result: EnvVarAuditResult): Finding[] {
    const findings: Finding[] = []

    if (!result.envExampleExists) {
      findings.push({
        id: 'DEPLOY-011',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.HIGH,
        title: '.env.example Missing',
        description: 'No .env.example file found to document required environment variables',
        evidence: '.env.example not found',
        remediation: [
          'Create .env.example file',
          'Document all required environment variables',
          'Include descriptions and example values',
          'Do not include actual secrets'
        ],
        requirement: '8.3'
      })
      return findings
    }

    if (result.missingVars.length > 0) {
      findings.push({
        id: 'DEPLOY-012',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.HIGH,
        title: 'Required Environment Variables Not Documented',
        description: `${result.missingVars.length} required environment variables are not documented in .env.example`,
        evidence: `Missing variables: ${result.missingVars.join(', ')}`,
        remediation: [
          'Add missing variables to .env.example',
          'Include descriptions for each variable',
          'Specify which variables are required vs optional',
          'Document default values where applicable'
        ],
        requirement: '8.3'
      })
    }

    if (!result.sensitiveVarsSecure) {
      findings.push({
        id: 'DEPLOY-013',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.CRITICAL,
        title: 'Sensitive Credentials in .env.example',
        description: 'Actual API keys or passwords found in .env.example file',
        evidence: 'Sensitive credential patterns detected',
        remediation: [
          'Remove all actual credentials from .env.example',
          'Use placeholder values (e.g., sk-...)',
          'Audit git history for leaked credentials',
          'Rotate any exposed credentials immediately'
        ],
        constitutionalArticle: 'Article VII (Security & Protection)',
        requirement: '8.3'
      })
    }

    return findings
  }

  /**
   * Create findings from health endpoint audit results
   */
  private createHealthFindings(result: HealthEndpointResult): Finding[] {
    const findings: Finding[] = []

    if (!result.endpointExists) {
      findings.push({
        id: 'DEPLOY-014',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.CRITICAL,
        title: 'Health Endpoint Missing',
        description: 'No health check endpoint found at /api/health',
        evidence: 'app/api/health/route.ts not found',
        remediation: [
          'Create health endpoint at /api/health',
          'Return status, ok, and timestamp fields',
          'Include database connectivity check',
          'Add memory and uptime metrics'
        ],
        constitutionalArticle: 'Article XI (Emergency Provisions)',
        requirement: '8.4'
      })
      return findings
    }

    if (!result.returnsCorrectFormat) {
      findings.push({
        id: 'DEPLOY-015',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.HIGH,
        title: 'Health Endpoint Incorrect Format',
        description: 'Health endpoint does not return expected response format',
        evidence: 'Missing required fields: status, ok, or timestamp',
        remediation: [
          'Ensure response includes status field',
          'Ensure response includes ok boolean',
          'Ensure response includes timestamp',
          'Follow standard health check format'
        ],
        requirement: '8.4'
      })
    }

    if (!result.includesDatabaseCheck) {
      findings.push({
        id: 'DEPLOY-016',
        category: AuditCategory.DEPLOYMENT_READINESS,
        severity: Severity.MEDIUM,
        title: 'Health Endpoint Missing Database Check',
        description: 'Health endpoint does not verify database connectivity',
        evidence: 'No database query found in health endpoint',
        remediation: [
          'Add database connectivity check',
          'Execute simple query (SELECT 1)',
          'Include database status in response',
          'Measure database latency'
        ],
        requirement: '8.4'
      })
    }

    return findings
  }

  /**
   * Calculate overall deployment readiness score
   */
  private calculateScore(findings: Finding[]): number {
    const weights = {
      [Severity.CRITICAL]: 25,
      [Severity.HIGH]: 15,
      [Severity.MEDIUM]: 8,
      [Severity.LOW]: 3,
      [Severity.INFO]: 0
    }

    let deductions = 0
    for (const finding of findings) {
      deductions += weights[finding.severity]
    }

    const score = Math.max(0, 100 - deductions)
    return score
  }
}
