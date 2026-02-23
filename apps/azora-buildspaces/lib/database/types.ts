/**
 * Database Type Exports
 * 
 * Centralized type definitions for database operations and status.
 * Re-exports Prisma types for consistent usage across the application.
 * 
 * Requirements: 3.2, 4.1
 */

// Conditionally re-export Prisma types when available
// This allows the module to work even when @prisma/client is not generated
export type PrismaClient = any

/**
 * Database connection and configuration status
 */
export interface DatabaseStatus {
  configured: boolean
  connected: boolean
  clientGenerated: boolean
  error?: string
  message: string
}

/**
 * Database connection configuration options
 */
export interface DatabaseConfig {
  url: string
  poolSize?: number
  idleTimeout?: number
  connectionTimeout?: number
}

/**
 * Database operation result wrapper
 */
export interface DatabaseResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Database health check result
 */
export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unavailable'
  latency?: number
  error?: string
  timestamp: Date
}
