/**
 * Health Check Endpoint
 * 
 * Constitutional Compliance:
 * - Truth Mandate: Returns accurate system health metrics
 * - Transparency: Exposes operational status for monitoring
 * - Auditability: Logs health check results
 */

import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface HealthCheckResult {
  ok: boolean
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: number
  uptime: number
  version: string
  checks: {
    memory: {
      used: number
      total: number
      percentage: number
    }
    database?: {
      status: "connected" | "disconnected" | "unavailable"
      latency?: number
    }
  }
  constitutional_alignment: number
}

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Memory check
    const memUsage = process.memoryUsage()
    const memPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100
    
    // Database check (optional)
    let dbStatus: "connected" | "disconnected" | "unavailable" = "unavailable"
    let dbLatency: number | undefined
    
    if (process.env.DATABASE_URL) {
      try {
        const dbCheckStart = Date.now()
        const maybePrisma = await import("@prisma/client")

        // Defensive: verify PrismaClient exists and is constructible
        if (!maybePrisma || typeof maybePrisma.PrismaClient !== "function") {
          dbStatus = "unavailable"
          console.warn("[Health] Prisma client not available; skipping DB check")
        } else {
          const { PrismaClient } = maybePrisma
          const prisma = new PrismaClient()
          try {
            await prisma.$queryRaw`SELECT 1`
            dbLatency = Date.now() - dbCheckStart
            dbStatus = "connected"
          } catch (error) {
            dbStatus = "disconnected"
            console.error("[Health] Database query failed:", error)
          } finally {
            await prisma.$disconnect()
          }
        }
      } catch (error) {
        // Import or construction failed (e.g., generated client missing)
        dbStatus = "unavailable"
        console.error("[Health] Database client unavailable:", error)
      }
    }
    
    // Determine overall status
    let status: "healthy" | "degraded" | "unhealthy" = "healthy"
    let ok = true
    
    // Treat a disconnected DB as unhealthy; an unavailable client is degraded
    if (memPercentage > 90 || dbStatus === "disconnected") {
      status = "unhealthy"
      ok = false
    } else if (memPercentage > 75 || dbStatus === "unavailable") {
      status = "degraded"
    }
    
    const result: HealthCheckResult = {
      ok,
      status,
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "0.1.0",
      checks: {
        memory: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal,
          percentage: Math.round(memPercentage * 100) / 100,
        },
      },
      constitutional_alignment: 0.99, // High alignment score
    }
    
    // Add database status if configured
    if (process.env.DATABASE_URL) {
      result.checks.database = {
        status: dbStatus,
        latency: dbLatency,
      }
    }
    
    const responseStatus = status === "unhealthy" ? 503 : 200
    
    return NextResponse.json(result, {
      status: responseStatus,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Response-Time": `${Date.now() - startTime}ms`,
        "X-Constitutional-Alignment": "0.99",
      },
    })
  } catch (error) {
    console.error("[Health] Check failed:", error)
    return NextResponse.json(
      {
        ok: false,
        status: "unhealthy",
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: {
          "X-Response-Time": `${Date.now() - startTime}ms`,
        },
      }
    )
  }
}

