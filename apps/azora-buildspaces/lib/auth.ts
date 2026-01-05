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
                if (!credentials?.email) return null

                // Temporary local dev behavior: accept any password for known demo users
                const demoEmails = ['demo@azora.world', 'admin@azora.world']
                const isDemo = demoEmails.includes(credentials.email)

                if (!isDemo && process.env.NODE_ENV === 'production') {
                    // In production, this should validate against the database
                    return null
                }

                return {
                    id: `local_${credentials.email}`,
                    name: credentials.email.split('@')[0],
                    email: credentials.email
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
