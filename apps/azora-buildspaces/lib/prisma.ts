let PrismaClient: any
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PrismaClient = require('@prisma/client').PrismaClient
} catch (e) {
  PrismaClient = undefined
}

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: any
}

const connectionString = process.env.DATABASE_URL!

function createProxy() {
  return new Proxy({} as any, {
    get: (target, prop) => {
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => {
          throw new Error('System Integrity Error: Database not configured. Set DATABASE_URL environment variable and generate @prisma/client.');
        }
      }
      if (typeof prop === 'string' && !prop.startsWith('_')) {
        return {
          findMany: async () => {
            throw new Error(`System Integrity Error: Cannot read ${String(prop)} - Database not configured`)
          },
          findUnique: async () => {
            throw new Error(`System Integrity Error: Cannot read ${String(prop)} - Database not configured`)
          },
          findFirst: async () => {
            throw new Error(`System Integrity Error: Cannot read ${String(prop)} - Database not configured`)
          },
          create: async () => {
            throw new Error(`System Integrity Error: Cannot create ${String(prop)} - Database not configured`)
          },
          update: async () => {
            throw new Error(`System Integrity Error: Cannot update ${String(prop)} - Database not configured`)
          },
          delete: async () => {
            throw new Error(`System Integrity Error: Cannot delete ${String(prop)} - Database not configured`)
          },
        }
      }
      return undefined
    }
  })
}

let prismaClient: any

try {
  if (!PrismaClient) throw new Error('@prisma/client not generated')

  prismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaPg(new Pool({ connectionString })),
    })
} catch (e) {
  // If adapter initialization fails (version mismatch or runtime error),
  // fall back to a standard PrismaClient using DATABASE_URL if available, otherwise return a proxy
  // Log and continue.
  // eslint-disable-next-line no-console
  console.error('Prisma adapter init failed, falling back to default PrismaClient/proxy:', e)
  if (PrismaClient) {
    prismaClient = globalForPrisma.prisma ?? new PrismaClient()
  } else {
    prismaClient = createProxy()
  }
}

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma