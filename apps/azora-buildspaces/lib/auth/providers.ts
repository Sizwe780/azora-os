/**
 * Authentication Provider Configurations
 * 
 * Manages dynamic loading of authentication providers based on environment configuration.
 * Supports credentials, GitHub OAuth, and Google OAuth providers.
 * 
 * Requirements: 2.1, 2.2, 2.3, 7.2
 */

import type { Provider } from "next-auth/providers/index"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma, PRISMA_AVAILABLE } from "@/lib/database/client"
import { verifyPassword } from "./utils"

/**
 * Builds the list of authentication providers dynamically based on environment configuration
 * Always includes credentials provider, adds OAuth providers when configured
 * 
 * @returns Array of NextAuth providers
 */
export function buildProviders(): Provider[] {
  const providers: Provider[] = []

  // Credentials provider - always included
  providers.push(
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Requirement 2.5: Development fallback when database is unavailable
        if (!PRISMA_AVAILABLE) {
          // Only allow development fallback in non-production environments
          if (process.env.NODE_ENV !== 'production') {
            const devEmail = process.env.DEV_AUTH_EMAIL || 'admin@azora.world'
            const devPassword = process.env.DEV_AUTH_PASSWORD || 'Azora2026!'
            
            if (credentials?.email === devEmail && credentials?.password === devPassword) {
              console.warn('[AUTH] Using development fallback credentials - DATABASE not configured')
              console.warn('[AUTH] This should NEVER happen in production')
              return { 
                id: 'dev-admin', 
                name: 'Dev Admin', 
                email: devEmail 
              } as any
            }
            
            console.error('[AUTH] Database not configured and credentials did not match dev fallback')
            return null
          }

          // Requirement 2.3: Clear error in production when database unavailable
          console.error('[AUTH] Database is required for authentication in production')
          return null
        }

        // Requirement 2.1: Verify credentials against database
        try {
          // If we have a mocked prisma client in tests, use it
          // @ts-ignore
          if (global.prisma?.user?.findUnique) {
            // @ts-ignore
            const user = await global.prisma.user.findUnique({ 
              where: { email: credentials?.email } 
            })
            
            if (!user) {
              console.log('[AUTH] User not found (global mock):', credentials?.email)
              return null
            }

            // Verify password
            if (user.password && verifyPassword(credentials!.password, user.password)) {
                 return { 
                id: user.id || 'mock-id', 
                name: user.name, 
                email: user.email 
              } as any
            }
          }

          if (!prisma) {
             console.error('[AUTH] CRITICAL: prisma client is undefined')
             return null
          }
          if (!prisma.user) {
             console.error('[AUTH] CRITICAL: prisma.user is undefined. Available keys:', Object.keys(prisma))
             return null
          }

          const user = await prisma.user.findUnique({ 
            where: { email: credentials?.email } 
          })
          
          if (!user) {
            console.log('[AUTH] User not found:', credentials?.email)
            return null
          }

          // Requirement 2.1: Verify password using secure hashing
          if (user.password && verifyPassword(credentials!.password, user.password)) {
            console.log('[AUTH] User authenticated successfully:', user.email)
            return { 
              id: user.id, 
              name: user.name, 
              email: user.email 
            } as any
          }
          
          console.log('[AUTH] Invalid password for user:', credentials?.email)
          return null
          
        } catch (e) {
          console.error('[AUTH] Error checking user credentials:', e)
          return null
        }
      }
    })
  )

  // GitHub OAuth provider - add when configured
  if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    console.log('[AUTH] GitHub OAuth provider enabled')
    providers.push(
      GitHubProvider({ 
        clientId: process.env.GITHUB_ID, 
        clientSecret: process.env.GITHUB_SECRET 
      })
    )
  }

  // Google OAuth provider - add when configured
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('[AUTH] Google OAuth provider enabled')
    providers.push(
      GoogleProvider({ 
        clientId: process.env.GOOGLE_CLIENT_ID, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET 
      })
    )
  }

  console.log(`[AUTH] Configured ${providers.length} authentication provider(s)`)
  return providers
}

/**
 * Gets the list of enabled authentication providers
 * @returns Array of provider IDs
 */
export function getEnabledProviders(): string[] {
  const providers = buildProviders()
  return providers.map((provider: any) => provider.id || provider.name)
}
