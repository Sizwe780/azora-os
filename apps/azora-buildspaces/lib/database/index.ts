/**
 * Database Module - Main Export Point
 * 
 * Centralized exports for all database-related functionality.
 * Single import point for database client, types, and utilities.
 * 
 * Requirements: 3.2, 4.1
 * 
 * @example
 * ```typescript
 * // Import everything you need from one place
 * import { prisma, PRISMA_AVAILABLE, checkDatabaseHealth } from '@/lib/database'
 * 
 * // Check if database is available before using
 * if (PRISMA_AVAILABLE) {
 *   const users = await prisma.user.findMany()
 * }
 * 
 * // Check database health
 * const health = await checkDatabaseHealth()
 * console.log('Database status:', health.status)
 * ```
 */

// Export database client and configuration
export {
  prisma,
  PRISMA_AVAILABLE,
  isPrismaConfigured,
  getDatabaseStatus,
  disconnectDatabase,
} from './client'

// Export types
export type {
  DatabaseStatus,
  DatabaseConfig,
  DatabaseResult,
  DatabaseHealth,
  PrismaClient,
} from './types'

// Export utility functions
export {
  checkDatabaseHealth,
  withDatabaseErrorHandling,
  isDatabaseReady,
  formatDatabaseError,
  retryDatabaseOperation,
  isValidDatabaseUrl,
} from './utils'
