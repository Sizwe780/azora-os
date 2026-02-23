/**
 * Database Auditor
 * 
 * Verifies Prisma schema compliance and database connectivity
 * 
 * Constitutional Compliance:
 * - Article VIII: Truth as Currency - Real database verification only
 * - Article VIII Section 8.3: No Mock Protocol - No mock database connections
 * - Article V: Data Protection - Secure database access verification
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import {
  IAuditor,
  AuditCategory,
  AuditResult,
  Finding,
  Severity
} from '../types'

export class DatabaseAuditor implements IAuditor {
  name = 'Database Auditor'
  category = AuditCategory.DATABASE
  description = 'Verifies Prisma schema has all required BuildSpaces models and tests database connectivity'

  private prisma: PrismaClient | null = null
  private schemaPath: string

  constructor() {
    // Path to Prisma schema from workspace root
    this.schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')
  }

  async audit(): Promise<AuditResult> {
    const startTime = Date.now()
    const findings: Finding[] = []

    try {
      // Subtask 5.1: Verify Prisma schema models
      const schemaFindings = await this.verifySchemaModels()
      findings.push(...schemaFindings)

      // Subtask 5.2: Test database connectivity
      const connectivityFindings = await this.testDatabaseConnectivity()
      findings.push(...connectivityFindings)

    } catch (error) {
      findings.push({
        id: `db-audit-error-${Date.now()}`,
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'Database Audit Failed',
        description: `Unexpected error during database audit: ${error instanceof Error ? error.message : String(error)}`,
        remediation: [
          'Check that Prisma schema exists at prisma/schema.prisma',
          'Verify database connection configuration',
          'Review audit logs for detailed error information'
        ]
      })
    } finally {
      // Clean up Prisma client connection
      if (this.prisma) {
        await this.prisma.$disconnect()
      }
    }

    // Calculate score and counts
    const criticalCount = findings.filter(f => f.severity === Severity.CRITICAL).length
    const highCount = findings.filter(f => f.severity === Severity.HIGH).length
    const mediumCount = findings.filter(f => f.severity === Severity.MEDIUM).length
    const lowCount = findings.filter(f => f.severity === Severity.LOW).length
    const infoCount = findings.filter(f => f.severity === Severity.INFO).length

    // Score calculation: 100 - (critical * 25 + high * 10 + medium * 5 + low * 2)
    const score = Math.max(0, 100 - (criticalCount * 25 + highCount * 10 + mediumCount * 5 + lowCount * 2))
    const passed = criticalCount === 0 && highCount === 0

    return {
      category: this.category,
      score,
      passed,
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
   * Subtask 5.1: Verify Prisma schema models
   * Requirements: 4.1, 4.2, 4.3, 4.4
   */
  private async verifySchemaModels(): Promise<Finding[]> {
    const findings: Finding[] = []

    try {
      // Read Prisma schema file
      const schemaContent = await readFile(this.schemaPath, 'utf-8')

      // Check BuildSpaceProject model (Requirement 4.1)
      const buildSpaceProjectFindings = this.checkBuildSpaceProjectModel(schemaContent)
      findings.push(...buildSpaceProjectFindings)

      // Check BuildSpaceSpec model (Requirement 4.2)
      const buildSpaceSpecFindings = this.checkBuildSpaceSpecModel(schemaContent)
      findings.push(...buildSpaceSpecFindings)

      // Check BuildSpaceExecution model (Requirement 4.3)
      const buildSpaceExecutionFindings = this.checkBuildSpaceExecutionModel(schemaContent)
      findings.push(...buildSpaceExecutionFindings)

      // Check User model has buildspacesProjects relation (Requirement 4.4)
      const userRelationFindings = this.checkUserBuildspacesRelation(schemaContent)
      findings.push(...userRelationFindings)

      // Info finding if all models are present
      if (findings.length === 0) {
        findings.push({
          id: `db-schema-complete-${Date.now()}`,
          category: this.category,
          severity: Severity.INFO,
          title: 'Prisma Schema Complete',
          description: 'All required BuildSpaces models are present in the Prisma schema',
          remediation: [],
          requirement: '4.1, 4.2, 4.3, 4.4'
        })
      }

    } catch (error) {
      findings.push({
        id: `db-schema-read-error-${Date.now()}`,
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'Cannot Read Prisma Schema',
        description: `Failed to read Prisma schema at ${this.schemaPath}: ${error instanceof Error ? error.message : String(error)}`,
        filePath: this.schemaPath,
        remediation: [
          'Verify prisma/schema.prisma file exists',
          'Check file permissions',
          'Ensure Prisma is properly configured'
        ],
        requirement: '4.1, 4.2, 4.3, 4.4'
      })
    }

    return findings
  }

  /**
   * Check BuildSpaceProject model exists with required fields
   * Requirement 4.1
   */
  private checkBuildSpaceProjectModel(schemaContent: string): Finding[] {
    const findings: Finding[] = []
    const modelRegex = new RegExp('model\\s+BuildSpaceProject\\s*\\{([^}]+)\\}', 's')
    const match = schemaContent.match(modelRegex)

    if (!match) {
      findings.push({
        id: `db-missing-buildspaceproject-${Date.now()}`,
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'BuildSpaceProject Model Missing',
        description: 'BuildSpaceProject model not found in Prisma schema',
        filePath: this.schemaPath,
        remediation: [
          'Add BuildSpaceProject model to prisma/schema.prisma',
          'Include required fields: id, name, slug, ownerId, description, createdAt, updatedAt',
          'Add relation to User model',
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.1'
      })
      return findings
    }

    const modelBody = match[1]
    const requiredFields = ['id', 'name', 'slug', 'ownerId', 'description', 'createdAt', 'updatedAt']
    const missingFields: string[] = []

    for (const field of requiredFields) {
      const fieldRegex = new RegExp(`\\b${field}\\s+`, 'i')
      if (!fieldRegex.test(modelBody)) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      findings.push({
        id: `db-buildspaceproject-missing-fields-${Date.now()}`,
        category: this.category,
        severity: Severity.HIGH,
        title: 'BuildSpaceProject Missing Required Fields',
        description: `BuildSpaceProject model is missing required fields: ${missingFields.join(', ')}`,
        filePath: this.schemaPath,
        evidence: `Missing fields: ${missingFields.join(', ')}`,
        remediation: [
          `Add missing fields to BuildSpaceProject model: ${missingFields.join(', ')}`,
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.1'
      })
    }

    // Check for owner relation
    if (!modelBody.includes('owner') || !modelBody.includes('User')) {
      findings.push({
        id: `db-buildspaceproject-missing-owner-${Date.now()}`,
        category: this.category,
        severity: Severity.HIGH,
        title: 'BuildSpaceProject Missing Owner Relation',
        description: 'BuildSpaceProject model does not have owner relation to User',
        filePath: this.schemaPath,
        remediation: [
          'Add owner relation: owner User @relation(fields: [ownerId], references: [id], onDelete: Cascade)',
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.1'
      })
    }

    return findings
  }

  /**
   * Check BuildSpaceSpec model exists with required fields
   * Requirement 4.2
   */
  private checkBuildSpaceSpecModel(schemaContent: string): Finding[] {
    const findings: Finding[] = []
    const modelRegex = new RegExp('model\\s+BuildSpaceSpec\\s*\\{([^}]+)\\}', 's')
    const match = schemaContent.match(modelRegex)

    if (!match) {
      findings.push({
        id: `db-missing-buildspacespec-${Date.now()}`,
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'BuildSpaceSpec Model Missing',
        description: 'BuildSpaceSpec model not found in Prisma schema',
        filePath: this.schemaPath,
        remediation: [
          'Add BuildSpaceSpec model to prisma/schema.prisma',
          'Include required fields: id, projectId, title, content, format, createdAt, updatedAt',
          'Add relation to BuildSpaceProject model',
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.2'
      })
      return findings
    }

    const modelBody = match[1]
    const requiredFields = ['id', 'projectId', 'title', 'content', 'format', 'createdAt', 'updatedAt']
    const missingFields: string[] = []

    for (const field of requiredFields) {
      const fieldRegex = new RegExp(`\\b${field}\\s+`, 'i')
      if (!fieldRegex.test(modelBody)) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      findings.push({
        id: `db-buildspacespec-missing-fields-${Date.now()}`,
        category: this.category,
        severity: Severity.HIGH,
        title: 'BuildSpaceSpec Missing Required Fields',
        description: `BuildSpaceSpec model is missing required fields: ${missingFields.join(', ')}`,
        filePath: this.schemaPath,
        evidence: `Missing fields: ${missingFields.join(', ')}`,
        remediation: [
          `Add missing fields to BuildSpaceSpec model: ${missingFields.join(', ')}`,
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.2'
      })
    }

    // Check for project relation
    if (!modelBody.includes('project') || !modelBody.includes('BuildSpaceProject')) {
      findings.push({
        id: `db-buildspacespec-missing-project-${Date.now()}`,
        category: this.category,
        severity: Severity.HIGH,
        title: 'BuildSpaceSpec Missing Project Relation',
        description: 'BuildSpaceSpec model does not have project relation to BuildSpaceProject',
        filePath: this.schemaPath,
        remediation: [
          'Add project relation: project BuildSpaceProject @relation(fields: [projectId], references: [id], onDelete: Cascade)',
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.2'
      })
    }

    return findings
  }

  /**
   * Check BuildSpaceExecution model exists with required fields
   * Requirement 4.3
   */
  private checkBuildSpaceExecutionModel(schemaContent: string): Finding[] {
    const findings: Finding[] = []
    const modelRegex = new RegExp('model\\s+BuildSpaceExecution\\s*\\{([^}]+)\\}', 's')
    const match = schemaContent.match(modelRegex)

    if (!match) {
      findings.push({
        id: `db-missing-buildspaceexecution-${Date.now()}`,
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'BuildSpaceExecution Model Missing',
        description: 'BuildSpaceExecution model not found in Prisma schema',
        filePath: this.schemaPath,
        remediation: [
          'Add BuildSpaceExecution model to prisma/schema.prisma',
          'Include required fields: id, projectId, specId, agentName, status, input, output, tokensUsed, startedAt, finishedAt, createdAt',
          'Add relations to BuildSpaceProject and BuildSpaceSpec models',
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.3'
      })
      return findings
    }

    const modelBody = match[1]
    const requiredFields = ['id', 'projectId', 'specId', 'agentName', 'status', 'input', 'output', 'createdAt']
    const missingFields: string[] = []

    for (const field of requiredFields) {
      const fieldRegex = new RegExp(`\\b${field}\\s+`, 'i')
      if (!fieldRegex.test(modelBody)) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      findings.push({
        id: `db-buildspaceexecution-missing-fields-${Date.now()}`,
        category: this.category,
        severity: Severity.HIGH,
        title: 'BuildSpaceExecution Missing Required Fields',
        description: `BuildSpaceExecution model is missing required fields: ${missingFields.join(', ')}`,
        filePath: this.schemaPath,
        evidence: `Missing fields: ${missingFields.join(', ')}`,
        remediation: [
          `Add missing fields to BuildSpaceExecution model: ${missingFields.join(', ')}`,
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.3'
      })
    }

    return findings
  }

  /**
   * Check User model has buildspacesProjects relation
   * Requirement 4.4
   */
  private checkUserBuildspacesRelation(schemaContent: string): Finding[] {
    const findings: Finding[] = []
    const modelRegex = new RegExp('model\\s+User\\s*\\{([^}]+)\\}', 's')
    const match = schemaContent.match(modelRegex)

    if (!match) {
      findings.push({
        id: `db-missing-user-model-${Date.now()}`,
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'User Model Missing',
        description: 'User model not found in Prisma schema',
        filePath: this.schemaPath,
        remediation: [
          'Add User model to prisma/schema.prisma',
          'This is a critical system model required for authentication',
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.4'
      })
      return findings
    }

    const modelBody = match[1]

    // Check for buildspacesProjects relation
    if (!modelBody.includes('buildspacesProjects') || !modelBody.includes('BuildSpaceProject')) {
      findings.push({
        id: `db-user-missing-buildspaces-relation-${Date.now()}`,
        category: this.category,
        severity: Severity.HIGH,
        title: 'User Missing BuildSpaces Relation',
        description: 'User model does not have buildspacesProjects relation to BuildSpaceProject',
        filePath: this.schemaPath,
        remediation: [
          'Add buildspacesProjects relation to User model: buildspacesProjects BuildSpaceProject[]',
          'Run prisma generate and prisma migrate'
        ],
        requirement: '4.4'
      })
    }

    return findings
  }

  /**
   * Subtask 5.2: Test database connectivity
   * Requirement 4.5
   */
  private async testDatabaseConnectivity(): Promise<Finding[]> {
    const findings: Finding[] = []

    try {
      // Check environment variables
      const databaseUrl = process.env.DATABASE_URL
      const directUrl = process.env.DIRECT_URL

      if (!databaseUrl) {
        findings.push({
          id: `db-missing-database-url-${Date.now()}`,
          category: this.category,
          severity: Severity.CRITICAL,
          title: 'DATABASE_URL Not Configured',
          description: 'DATABASE_URL environment variable is not set',
          remediation: [
            'Set DATABASE_URL in .env file',
            'Format: postgresql://user:password@host:port/database',
            'Ensure database credentials are correct',
            'Verify database server is running'
          ],
          requirement: '4.5'
        })
      }

      if (!directUrl) {
        findings.push({
          id: `db-missing-direct-url-${Date.now()}`,
          category: this.category,
          severity: Severity.MEDIUM,
          title: 'DIRECT_URL Not Configured',
          description: 'DIRECT_URL environment variable is not set (recommended for connection pooling)',
          remediation: [
            'Set DIRECT_URL in .env file for direct database connections',
            'This is recommended for migrations and connection pooling',
            'Format: postgresql://user:password@host:port/database'
          ],
          requirement: '4.5'
        })
      }

      // Only attempt connection if DATABASE_URL is set
      if (databaseUrl) {
        try {
          // Initialize Prisma client
          this.prisma = new PrismaClient()

          // Test basic connectivity with a simple query
          await this.prisma.$queryRaw`SELECT 1 as test`

          findings.push({
            id: `db-connection-success-${Date.now()}`,
            category: this.category,
            severity: Severity.INFO,
            title: 'Database Connection Successful',
            description: 'Successfully connected to PostgreSQL database and executed test query',
            remediation: [],
            requirement: '4.5'
          })

          // Check for schema drift
          const schemaDriftFindings = await this.checkSchemaDrift()
          findings.push(...schemaDriftFindings)

        } catch (connectionError) {
          findings.push({
            id: `db-connection-failed-${Date.now()}`,
            category: this.category,
            severity: Severity.CRITICAL,
            title: 'Database Connection Failed',
            description: `Failed to connect to PostgreSQL database: ${connectionError instanceof Error ? connectionError.message : String(connectionError)}`,
            remediation: [
              'Verify DATABASE_URL is correct',
              'Check database server is running',
              'Verify network connectivity to database',
              'Check database credentials and permissions',
              'Review database logs for connection errors'
            ],
            requirement: '4.5'
          })
        }
      }

    } catch (error) {
      findings.push({
        id: `db-connectivity-test-error-${Date.now()}`,
        category: this.category,
        severity: Severity.HIGH,
        title: 'Database Connectivity Test Error',
        description: `Error during database connectivity test: ${error instanceof Error ? error.message : String(error)}`,
        remediation: [
          'Check Prisma configuration',
          'Verify environment variables are loaded',
          'Review audit logs for detailed error information'
        ],
        requirement: '4.5'
      })
    }

    return findings
  }

  /**
   * Check for schema drift between Prisma schema and database
   */
  private async checkSchemaDrift(): Promise<Finding[]> {
    const findings: Finding[] = []

    if (!this.prisma) {
      return findings
    }

    try {
      // Try to query BuildSpaceProject table to verify it exists
      await this.prisma.$queryRaw`SELECT COUNT(*) FROM "buildspaces_projects" LIMIT 1`

      findings.push({
        id: `db-buildspaceproject-table-exists-${Date.now()}`,
        category: this.category,
        severity: Severity.INFO,
        title: 'BuildSpaceProject Table Exists',
        description: 'BuildSpaceProject table exists in database',
        remediation: [],
        requirement: '4.5'
      })

    } catch (error) {
      findings.push({
        id: `db-buildspaceproject-table-missing-${Date.now()}`,
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'BuildSpaceProject Table Missing',
        description: 'BuildSpaceProject table does not exist in database - schema drift detected',
        evidence: error instanceof Error ? error.message : String(error),
        remediation: [
          'Run prisma migrate dev to apply pending migrations',
          'Or run prisma db push to sync schema to database',
          'Verify migrations are up to date',
          'Check migration history in _prisma_migrations table'
        ],
        requirement: '4.5'
      })
    }

    try {
      // Try to query BuildSpaceSpec table
      await this.prisma.$queryRaw`SELECT COUNT(*) FROM "buildspaces_specs" LIMIT 1`

      findings.push({
        id: `db-buildspacespec-table-exists-${Date.now()}`,
        category: this.category,
        severity: Severity.INFO,
        title: 'BuildSpaceSpec Table Exists',
        description: 'BuildSpaceSpec table exists in database',
        remediation: [],
        requirement: '4.5'
      })

    } catch (error) {
      findings.push({
        id: `db-buildspacespec-table-missing-${Date.now()}`,
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'BuildSpaceSpec Table Missing',
        description: 'BuildSpaceSpec table does not exist in database - schema drift detected',
        evidence: error instanceof Error ? error.message : String(error),
        remediation: [
          'Run prisma migrate dev to apply pending migrations',
          'Or run prisma db push to sync schema to database'
        ],
        requirement: '4.5'
      })
    }

    try {
      // Try to query BuildSpaceExecution table
      await this.prisma.$queryRaw`SELECT COUNT(*) FROM "buildspaces_executions" LIMIT 1`

      findings.push({
        id: `db-buildspaceexecution-table-exists-${Date.now()}`,
        category: this.category,
        severity: Severity.INFO,
        title: 'BuildSpaceExecution Table Exists',
        description: 'BuildSpaceExecution table exists in database',
        remediation: [],
        requirement: '4.5'
      })

    } catch (error) {
      findings.push({
        id: `db-buildspaceexecution-table-missing-${Date.now()}`,
        category: this.category,
        severity: Severity.CRITICAL,
        title: 'BuildSpaceExecution Table Missing',
        description: 'BuildSpaceExecution table does not exist in database - schema drift detected',
        evidence: error instanceof Error ? error.message : String(error),
        remediation: [
          'Run prisma migrate dev to apply pending migrations',
          'Or run prisma db push to sync schema to database'
        ],
        requirement: '4.5'
      })
    }

    return findings
  }
}
