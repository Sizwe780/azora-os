import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL!

let prismaClient: PrismaClient

try {
  prismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaPg(new Pool({ connectionString })),
    })
} catch (e) {
  // If adapter initialization fails (version mismatch or runtime error),
  // fall back to a standard PrismaClient using DATABASE_URL so app remains functional.
  // Log and continue.
  // eslint-disable-next-line no-console
  console.error('Prisma adapter init failed, falling back to default PrismaClient:', e)
  prismaClient = globalForPrisma.prisma ?? new PrismaClient()
}

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma