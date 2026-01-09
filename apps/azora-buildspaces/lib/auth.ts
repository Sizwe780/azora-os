import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma, PRISMA_AVAILABLE } from "@/lib/db"
import bcrypt from "bcryptjs"

// Minimal NextAuth options for local development
export const authOptions: NextAuthOptions = {
    // adapter: PrismaAdapter(prisma), // Temporarily disabled to fix build error
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                try {
                    // If database is available, use real authentication
                    if (PRISMA_AVAILABLE) {
                        const user = await prisma.user.findUnique({
                            where: { email: credentials.email }
                        })

                        if (!user || !user.password) {
                            console.log('[AUTH] User not found or no password set:', credentials.email)
                            return null
                        }

                        // Verify password with bcrypt
                        const isValid = await bcrypt.compare(credentials.password, user.password)
                        
                        if (!isValid) {
                            console.log('[AUTH] Invalid password for user:', credentials.email)
                            return null
                        }

                        // Successful authentication
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        }
                    }

                    // Fallback: Development-only demo user support when DB not available
                    if (process.env.NODE_ENV === 'development') {
                        const demoEmails = ['demo@azora.world', 'admin@azora.world']
                        const isDemo = demoEmails.includes(credentials.email)
                        
                        if (isDemo) {
                            console.warn('[AUTH] Using demo user (DB not available):', credentials.email)
                            return {
                                id: `local_${credentials.email}`,
                                name: credentials.email.split('@')[0],
                                email: credentials.email
                            }
                        }
                    }

                    return null
                } catch (error) {
                    console.error('[AUTH] Authentication error:', error)
                    return null
                }
            }
        }),
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                    GoogleProvider({
                        clientId: process.env.GOOGLE_CLIENT_ID!,
                        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
                    })
                ]
            : []),
    ],
    session: { strategy: 'jwt' },
    pages: { signIn: '/auth/login' },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as any).id
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                ;(session.user as any).id = token.id as string
            }
            return session
        }
    }
}
