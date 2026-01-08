let PrismaClient: any
try {
  // Try to load generated client; if it doesn't exist, we'll fallback to proxy implementation
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClient = require('@prisma/client').PrismaClient
} catch (e) {
  PrismaClient = undefined
}

const globalForPrisma = global as unknown as { prisma: any }

/**
 * Prisma Client - Real Implementation
 * 
 * Requires DATABASE_URL environment variable to be set and a generated client.
 * If not set or client not generated, logs warning and returns null-safe proxy for development.
 *
 * To configure (production):
 * 1. Set DATABASE_URL in .env
 * 2. Run: npx prisma generate --schema=../../prisma/schema.prisma
 * 3. Run migrations or `prisma db push` against your database
 */

function createPrismaClient() {
    if (!process.env.DATABASE_URL || !PrismaClient) {
        console.warn('[Prisma] DATABASE_URL not set or @prisma/client not generated. Database features will not work.');
        console.warn('[Prisma] To configure: Set DATABASE_URL and run prisma generate');

        // Return a proxy that throws helpful errors instead of crashing
        return new Proxy({} as any, {
            get: (target, prop) => {
                if (prop === '$connect' || prop === '$disconnect') {
                    return async () => {
                        console.warn('[Prisma] No database connection configured');
                    };
                }
                if (typeof prop === 'string' && !prop.startsWith('_')) {
                    return {
                        findMany: async () => {
                            console.warn(`[Prisma] ${String(prop)}.findMany() - No database configured`);
                            return [];
                        },
                        findUnique: async () => null,
                        findFirst: async () => null,
                        create: async () => {
                            throw new Error('DATABASE_URL not configured');
                        },
                        update: async () => {
                            throw new Error('DATABASE_URL not configured');
                        },
                        delete: async () => {
                            throw new Error('DATABASE_URL not configured');
                        },
                    };
                }
                return undefined;
            }
        });
    }

    // For Prisma 5, use direct connection
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();
export const PRISMA_AVAILABLE = Boolean(process.env.DATABASE_URL && PrismaClient)

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
