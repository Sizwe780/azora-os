import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/db"

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

                // PRODUCTION: Real credential validation required
                if (process.env.NODE_ENV === 'production') {
                    // TODO: Implement real database validation
                    // For now, reject all credentials in production until properly implemented
                    console.error('[AUTH] Production authentication not yet implemented')
                    return null
                }

                // DEVELOPMENT ONLY: Demo user support
                const demoEmails = ['demo@azora.world', 'admin@azora.world']
                const isDemo = demoEmails.includes(credentials.email)
                
                if (isDemo && process.env.NODE_ENV === 'development') {
                    return {
                        id: `local_${credentials.email}`,
                        name: credentials.email.split('@')[0],
                        email: credentials.email
                    }
                }

                return null
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
