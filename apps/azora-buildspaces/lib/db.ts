let PrismaClient: any
try {
    // Try to load generated client; if it doesn't exist, we'll fallback to proxy implementation
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
        console.error('[SYSTEM INTEGRITY ERROR] DATABASE_URL not configured or @prisma/client not generated');
        console.error('[SYSTEM INTEGRITY ERROR] Database features WILL NOT WORK');
        console.error('[SYSTEM INTEGRITY ERROR] To configure: Set DATABASE_URL and run: npx prisma generate');

        // Constitutional AI: Truth Economics - NO SILENT FAILURES
        // Return a proxy that throws explicit errors for data operations
        return new Proxy({} as any, {
            get: (target, prop) => {
                if (prop === '$connect' || prop === '$disconnect') {
                    return async () => {
                        throw new Error('System Integrity Error: Database not configured. Set DATABASE_URL environment variable.');
                    };
                }
                if (typeof prop === 'string' && !prop.startsWith('_')) {
                    return {
                        findMany: async () => {
                            throw new Error(`System Integrity Error: Cannot read ${String(prop)} - Database not configured`);
                        },
                        findUnique: async () => {
                            throw new Error(`System Integrity Error: Cannot read ${String(prop)} - Database not configured`);
                        },
                        findFirst: async () => {
                            throw new Error(`System Integrity Error: Cannot read ${String(prop)} - Database not configured`);
                        },
                        create: async () => {
                            throw new Error(`System Integrity Error: Cannot create ${String(prop)} - Database not configured`);
                        },
                        update: async () => {
                            throw new Error(`System Integrity Error: Cannot update ${String(prop)} - Database not configured`);
                        },
                        delete: async () => {
                            throw new Error(`System Integrity Error: Cannot delete ${String(prop)} - Database not configured`);
                        },
                    };
                }
                return undefined;
            }
        });
    }

    // For Prisma 5, use direct connection
    try {
        return new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
        });
    } catch (e) {
        console.error('[SYSTEM INTEGRITY WARNING] Failed to initialize PrismaClient:', e);
        return new Proxy({} as any, {
            get: () => async () => { throw new Error('Database initialization failed'); }
        });
    }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();
export const PRISMA_AVAILABLE = Boolean(process.env.DATABASE_URL && PrismaClient)

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
