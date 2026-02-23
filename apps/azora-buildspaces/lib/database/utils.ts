/**
 * Database Utility Functions
 * 
 * Helper functions for database operations, health checks, and error handling.
 * Provides consistent patterns for database interactions across the application.
 * 
 * Requirements: 3.2, 4.1
 */

import { prisma, PRISMA_AVAILABLE } from './client'
import type { DatabaseHealth, DatabaseResult } from './types'

/**
 * Performs a health check on the database connection
 * Measures connection latency and verifies database availability
 * 
 * @returns DatabaseHealth object with status and diagnostics
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  if (!PRISMA_AVAILABLE) {
    return {
      status: 'unavailable',
      error: 'Database not configured or client not generated',
      timestamp: new Date(),
    }
  }

  const startTime = Date.now()

  try {
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - startTime

    return {
      status: latency < 100 ? 'healthy' : 'degraded',
      latency,
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      status: 'unavailable',
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date(),
    }
  }
}

/**
 * Wraps a database operation with error handling
 * Provides consistent error handling and result formatting
 * 
 * @param operation - Async function that performs database operation
 * @returns DatabaseResult with success status and data or error
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>
): Promise<DatabaseResult<T>> {
  if (!PRISMA_AVAILABLE) {
    return {
      success: false,
      error: 'Database not available',
    }
  }

  try {
    const data = await operation()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('[DATABASE] Operation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}

/**
 * Checks if the database is ready for operations
 * Verifies configuration, client generation, and connectivity
 * 
 * @returns true if database is ready, false otherwise
 */
export async function isDatabaseReady(): Promise<boolean> {
  if (!PRISMA_AVAILABLE) {
    return false
  }

  try {
    await prisma.$connect()
    await prisma.$disconnect()
    return true
  } catch {
    return false
  }
}

/**
 * Formats database errors for user-friendly display
 * Removes sensitive information and provides actionable messages
 * 
 * @param error - Error object from database operation
 * @returns User-friendly error message
 */
export function formatDatabaseError(error: unknown): string {
  if (error instanceof Error) {
    // Remove sensitive connection details
    const message = error.message
      .replace(/postgresql:\/\/[^@]+@/, 'postgresql://***@')
      .replace(/password=[^&\s]+/, 'password=***')

    // Provide actionable error messages
    if (message.includes('connect ECONNREFUSED')) {
      return 'Cannot connect to database. Please ensure PostgreSQL is running.'
    }
    if (message.includes('authentication failed')) {
      return 'Database authentication failed. Please check your credentials.'
    }
    if (message.includes('does not exist')) {
      return 'Database does not exist. Please run migrations.'
    }

    return message
  }

  return 'An unknown database error occurred'
}

/**
 * Retries a database operation with exponential backoff
 * Useful for handling transient connection issues
 * 
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @returns Result of the operation
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.warn(
          `[DATABASE] Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), ` +
          `retrying in ${delay}ms...`
        )
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Operation failed after retries')
}

/**
 * Validates database connection string format
 * Checks for required components without exposing sensitive data
 * 
 * @param connectionString - Database URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidDatabaseUrl(connectionString: string): boolean {
  try {
    const url = new URL(connectionString)
    return (
      url.protocol === 'postgresql:' &&
      url.hostname.length > 0 &&
      url.pathname.length > 1
    )
  } catch {
    return false
  }
}
