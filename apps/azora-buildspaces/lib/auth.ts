import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma, PRISMA_AVAILABLE } from "@/lib/db"
import crypto from "crypto"

console.log('[AUTH] Initializing authOptions...');

// Helper to verify pbkdf2 hashed password stored as salt:hash
function verifyPassword(password: string, storedPassword: string): boolean {
    try {
        const [salt, storedHash] = storedPassword.split(':');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return hash === storedHash;
    } catch (e) {
        console.error('[AUTH] Password verification error', e);
        return false;
    }
}

// Build providers list dynamically based on env/config
const providers = [] as any[];

providers.push(CredentialsProvider({
    id: 'credentials',
    name: 'Credentials',
    credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
        // Master Login Check (dev/backdoor for operators)
        const masterEmail = process.env.MASTER_EMAIL || "admin@azora.world";
        const masterPassword = process.env.MASTER_PASSWORD || "Azora2026!";

        if (credentials?.email === masterEmail && credentials?.password === masterPassword) {
            return {
                id: "master-user",
                name: "Master Administrator",
                email: masterEmail,
                image: "https://azora.world/master-avatar.png"
            }
        }

        // If Prisma is available, attempt to verify against stored user
        if (PRISMA_AVAILABLE) {
            try {
                const user = await prisma.user.findUnique({ where: { email: credentials?.email } });
                if (!user) return null;

                // If password is stored as salt:hash, verify using pbkdf2
                if (user.password && verifyPassword(credentials!.password, user.password)) {
                    return { id: user.id, name: user.name, email: user.email } as any;
                }
            } catch (e) {
                console.error('[AUTH] Error checking user credentials', e);
                return null;
            }
        }

        return null;
    }
}));

// Add OAuth providers when configured
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    providers.push(GitHubProvider({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET }));
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
}

export const authOptions: NextAuthOptions = {
    adapter: PRISMA_AVAILABLE ? PrismaAdapter(prisma) : undefined,
    providers,
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey123",
    debug: process.env.NODE_ENV !== 'production',
    callbacks: {
        async jwt({ token, user }: any) {
            // Persist user id to token so session() can read it
            if (user?.id) token.id = user.id;
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user && token?.id) {
                session.user.id = token.id;
            }
            return session;
        }
    }
}

/* ORIGINAL CONFIG - Restore when DB/Prisma is fully stable
export const authOptions: NextAuthOptions = {
    adapter: PRISMA_AVAILABLE ? PrismaAdapter(prisma) : undefined,
    ...
*/
