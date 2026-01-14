import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma, PRISMA_AVAILABLE } from "@/lib/db"
import crypto from "crypto"

export const authOptions: NextAuthOptions = {
    adapter: PRISMA_AVAILABLE ? PrismaAdapter(prisma) : undefined,
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials: Record<string, string> | undefined) {
                if (!credentials?.email || !credentials?.password) return null

                // Master Login Check
                const masterEmail = process.env.MASTER_EMAIL || "admin@azora.world";
                const masterPassword = process.env.MASTER_PASSWORD || "Azora2026!";

                if (credentials.email === masterEmail && credentials.password === masterPassword) {
                    return {
                        id: "master-user",
                        name: "Master Administrator",
                        email: masterEmail,
                        image: "https://azora.world/master-avatar.png"
                    };
                }

                try {
                    if (PRISMA_AVAILABLE) {
                        const user = await prisma.user.findUnique({
                            where: { email: credentials.email }
                        })

                        if (!user || !user.password) {
                            return null
                        }

                        // Verify password using crypto.pbkdf2Sync (matching the registration logic)
                        const passwordParts = user.password.split(':');
                        if (passwordParts.length !== 2) return null;

                        const [salt, storedHash] = passwordParts;
                        const hash = crypto.pbkdf2Sync(
                            credentials.password,
                            salt,
                            1000,
                            64,
                            'sha512'
                        ).toString('hex');

                        if (hash !== storedHash) return null;

                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.image
                        }
                    }

                    return null
                } catch (error) {
                    console.error('[AUTH] Authentication error:', error)
                    return null
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }),
    ],
    session: { strategy: 'jwt' },
    pages: { signIn: '/auth/login' },
    callbacks: {
        async jwt({ token, user }: { token: any, user?: any }) {
            if (user) {
                token.id = (user as any).id
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                ; (session.user as any).id = token.id as string
            }
            return session
        }
    }
}
