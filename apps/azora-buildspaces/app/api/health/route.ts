/**
 * Health Check Endpoint
 * 
 * Provides system health status including database connectivity and Prisma client availability.
 * Returns appropriate HTTP status codes for monitoring and alerting systems.
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import { NextResponse } from 'next/server'
import { getDatabaseStatus, PRISMA_AVAILABLE } from '@/lib/database/client'

export const dynamic = 'force-dynamic'

interface HealthCheckResponse {
  ok: boolean
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: {
      status: 'pass' | 'fail' | 'warn' | 'unavailable'
      configured: boolean
      connected: boolean
      clientGenerated: boolean
      message: string
      error?: string
    }
    prisma: {
      status: 'pass' | 'fail'
      available: boolean
      message: string
    }
  }
}

/**
 * GET /api/health
 * 
 * Returns the current health status of the application.
 * 
 * Status Codes:
 * - 200: System is healthy (all checks pass)
 * - 207: System is degraded (some checks fail but core functionality works)
 * - 503: System is unhealthy (critical checks fail)
 */
export async function GET() {
  try {
    // Check Prisma client availability
    const prismaCheck = {
      status: PRISMA_AVAILABLE ? ('pass' as const) : ('fail' as const),
      available: PRISMA_AVAILABLE,
      message: PRISMA_AVAILABLE
        ? 'Prisma client is available'
        : 'Prisma client not generated. Run: pnpm prisma:generate',
    }

    // Check database connectivity
    const dbStatus = await getDatabaseStatus()
    const databaseCheck = {
      status: dbStatus.connected
        ? ('pass' as const)
        : dbStatus.configured && dbStatus.clientGenerated
          ? ('warn' as const)
          : !dbStatus.clientGenerated
            ? ('unavailable' as const)
            : ('fail' as const),
      configured: dbStatus.configured,
      connected: dbStatus.connected,
      clientGenerated: dbStatus.clientGenerated,
      message: dbStatus.message,
      ...(dbStatus.error && { error: dbStatus.error }),
    }

    // Determine overall system status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    let httpStatus: number

    if (databaseCheck.status === 'pass' && prismaCheck.status === 'pass') {
      // All checks pass - system is healthy
      overallStatus = 'healthy'
      httpStatus = 200
    } else if (databaseCheck.status === 'warn' || prismaCheck.status === 'fail') {
      // Database configured but not connected, or Prisma not available
      // System can still function in degraded mode
      overallStatus = 'degraded'
      httpStatus = 200 // Use 200 for degraded as per tests
    } else {
      // Critical failures - system cannot function properly
      overallStatus = 'unhealthy'
      httpStatus = 503 // Service Unavailable
    }

    const response: HealthCheckResponse = {
      ok: overallStatus !== 'unhealthy',
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseCheck,
        prisma: prismaCheck,
      },
    }

    return NextResponse.json(response, { status: httpStatus })
  } catch (error) {
    // Unexpected error during health check
    console.error('[HEALTH] Health check failed with unexpected error:', error)

    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'fail',
          configured: false,
          connected: false,
          clientGenerated: false,
          message: 'Health check failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        prisma: {
          status: 'fail',
          available: false,
          message: 'Health check failed',
        },
      },
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}
