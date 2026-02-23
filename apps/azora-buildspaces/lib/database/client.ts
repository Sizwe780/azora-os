/**
 * Centralized Database Client Module
 * 
 * Single source of truth for Prisma client configuration and database connectivity.
 * Implements singleton pattern with proper error handling and graceful degradation.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Type definitions for database status
export interface DatabaseStatus {
  configured: boolean
  connected: boolean
  clientGenerated: boolean
  error?: string
  message: string
}

// Attempt to load the generated Prisma client
let PrismaClient: any
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PrismaClient = require('@prisma/client').PrismaClient
} catch (e) {
  PrismaClient = undefined
}

// Global singleton reference
const globalForPrisma = globalThis as unknown as { prisma: any }

/**
 * Creates an error-throwing proxy for when database is not configured
 * This ensures explicit errors rather than silent failures (Constitutional AI: Truth Economics)
 */
function createDatabaseProxy(): any {
  return new Proxy({} as any, {
    get: (_target, prop) => {
      // Allow connection methods to throw explicit errors
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => {
          throw new Error(
            'System Integrity Error: Database not configured. ' +
            'Set DATABASE_URL environment variable and run: pnpm prisma:generate'
          )
        }
      }

      // For model access, return an object with methods that throw errors
      if (typeof prop === 'string' && !prop.startsWith('_')) {
        const modelName = String(prop)
        return {
          findMany: async () => {
            throw new Error(
              `System Integrity Error: Cannot read ${modelName} - Database not configured. ` +
              'Set DATABASE_URL and run: pnpm prisma:generate'
            )
          },
          findUnique: async () => {
            throw new Error(
              `System Integrity Error: Cannot read ${modelName} - Database not configured. ` +
              'Set DATABASE_URL and run: pnpm prisma:generate'
            )
          },
          findFirst: async () => {
            throw new Error(
              `System Integrity Error: Cannot read ${modelName} - Database not configured. ` +
              'Set DATABASE_URL and run: pnpm prisma:generate'
            )
          },
          create: async () => {
            throw new Error(
              `System Integrity Error: Cannot create ${modelName} - Database not configured. ` +
              'Set DATABASE_URL and run: pnpm prisma:generate'
            )
          },
          update: async () => {
            throw new Error(
              `System Integrity Error: Cannot update ${modelName} - Database not configured. ` +
              'Set DATABASE_URL and run: pnpm prisma:generate'
            )
          },
          delete: async () => {
            throw new Error(
              `System Integrity Error: Cannot delete ${modelName} - Database not configured. ` +
              'Set DATABASE_URL and run: pnpm prisma:generate'
            )
          },
          count: async () => {
            throw new Error(
              `System Integrity Error: Cannot count ${modelName} - Database not configured. ` +
              'Set DATABASE_URL and run: pnpm prisma:generate'
            )
          },
          aggregate: async () => {
            throw new Error(
              `System Integrity Error: Cannot aggregate ${modelName} - Database not configured. ` +
              'Set DATABASE_URL and run: pnpm prisma:generate'
            )
          },
        }
      }

      return undefined
    },
  })
}

/**
 * Creates and configures the Prisma client with proper adapter setup
 * Implements Prisma v7 PostgreSQL adapter pattern with connection pooling
 */
function createPrismaClient() {
  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('[DATABASE] DATABASE_URL not configured')
    console.error('[DATABASE] Database features WILL NOT WORK')
    console.error('[DATABASE] To configure:')
    console.error('[DATABASE]   1. Copy .env.example to .env.local')
    console.error('[DATABASE]   2. Set DATABASE_URL to your PostgreSQL connection string')
    console.error('[DATABASE]   3. Run: pnpm prisma:generate')
    console.error('[DATABASE]   4. Run: pnpm prisma:migrate')
    return createDatabaseProxy()
  }

  // Check if Prisma client is generated
  if (!PrismaClient) {
    console.error('[DATABASE] @prisma/client not generated')
    console.error('[DATABASE] Database features WILL NOT WORK')
    console.error('[DATABASE] To generate client:')
    console.error('[DATABASE]   Run: pnpm prisma:generate')
    return createDatabaseProxy()
  }

  const connectionString = process.env.DATABASE_URL

  try {
    // Prisma v7 with PostgreSQL adapter for optimal performance
    // Uses connection pooling with pg driver
    const pool = new Pool({
      connectionString,
      max: 20, // Maximum number of connections in pool
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Timeout after 10s if connection cannot be established
    })

    // Add error handler to pool to prevent crashes
    pool.on('error', (err) => {
      console.error('[DATABASE] Pool error:', err.message)
    })

    const adapter = new PrismaPg(pool)

    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' 
        ? ['error'] // Reduced logging to prevent spam
        : ['error'],
    })

    console.log('[DATABASE] Prisma client initialized with PostgreSQL adapter')
    return client

  } catch (adapterError) {
    console.warn('[DATABASE] Adapter initialization failed, falling back to standard client')
    console.warn('[DATABASE] This is normal if database is not yet available')

    try {
      const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['error'] 
          : ['error'],
      })

      console.log('[DATABASE] Prisma client initialized without adapter')
      return client

    } catch (clientError) {
      console.error('[DATABASE] Failed to initialize PrismaClient')
      console.error('[DATABASE] This will prevent database features from working')
      return createDatabaseProxy()
    }
  }
}

/**
 * Singleton Prisma client instance
 * Reuses existing instance in development to prevent connection exhaustion
 */
export const prisma = globalForPrisma.prisma || createPrismaClient()

/**
 * Flag indicating whether Prisma is properly configured and available
 * Use this to conditionally enable database-dependent features
 */
export const PRISMA_AVAILABLE = Boolean(
  process.env.DATABASE_URL && 
  PrismaClient && 
  typeof prisma.$connect === 'function'
)

// Store singleton in global scope for development hot-reloading
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Utility function to check if Prisma is configured
 * @returns true if DATABASE_URL is set and client is generated
 */
export function isPrismaConfigured(): boolean {
  return PRISMA_AVAILABLE
}

/**
 * Gets the current database connection status with detailed diagnostics
 * @returns DatabaseStatus object with configuration and connection details
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    configured: Boolean(process.env.DATABASE_URL),
    connected: false,
    clientGenerated: Boolean(PrismaClient),
    message: '',
  }

  // Check if DATABASE_URL is set
  if (!status.configured) {
    status.error = 'DATABASE_URL not set'
    status.message = 'Database not configured. Set DATABASE_URL environment variable.'
    return status
  }

  // Check if client is generated
  if (!status.clientGenerated) {
    status.error = 'Prisma client not generated'
    status.message = 'Prisma client not generated. Run: pnpm prisma:generate'
    return status
  }

  // Check if we can connect to the database
  try {
    await prisma.$connect()
    status.connected = true
    status.message = 'Database connected successfully'
    await prisma.$disconnect()
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown connection error'
    status.message = 'Cannot connect to database. Check DATABASE_URL and ensure PostgreSQL is running.'
  }

  return status
}

/**
 * Safely disconnects from the database
 * Use this in cleanup operations or when shutting down the application
 */
export async function disconnectDatabase(): Promise<void> {
  if (PRISMA_AVAILABLE) {
    try {
      await prisma.$disconnect()
      console.log('[DATABASE] Disconnected successfully')
    } catch (error) {
      console.error('[DATABASE] Error during disconnect:', error)
    }
  }
}

// Log initial database status
if (PRISMA_AVAILABLE) {
  console.log('[DATABASE] ✓ Prisma client available and configured')
} else {
  console.warn('[DATABASE] ✗ Prisma client not available - database features disabled')
}
