import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma, PRISMA_AVAILABLE } from "@/lib/db"
import crypto from "crypto"

console.log('[AUTH] Initializing authOptions...');
// DEV AUTH MODE: Simplified for reliable master login
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                // Master Login Check
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
                return null
            }
        })
    ],
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey123", // Fallback for dev
    debug: true,
}

/* ORIGINAL CONFIG - Restore when DB/Prisma is fully stable
export const authOptions: NextAuthOptions = {
    adapter: PRISMA_AVAILABLE ? PrismaAdapter(prisma) : undefined,
    ...
*/
