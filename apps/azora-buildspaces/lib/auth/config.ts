/**
 * Centralized Authentication Configuration Module
 * 
 * Single source of truth for NextAuth configuration with proper Prisma adapter integration.
 * Implements conditional database usage, dynamic provider loading, and secure JWT callbacks.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1
 */

import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma, PRISMA_AVAILABLE } from "@/lib/database/client"
import { buildProviders, getEnabledProviders } from "./providers"
import { authCallbacks } from "./callbacks"

console.log('[AUTH] Initializing authentication configuration...')

/**
 * NextAuth configuration options
 * Requirement 2.4: Uses Prisma adapter for session management when database is available
 */
export const authOptions: NextAuthOptions = {
  // Requirement 2.4: Conditional Prisma adapter usage
  adapter: PrismaAdapter(prisma),
  
  // Dynamic provider loading based on environment
  providers: buildProviders(),
  
  // JWT strategy for session management
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Secure secret for JWT signing
  secret: process.env.NEXTAUTH_SECRET || "supersecretkey123",
  
  // Enable debug logging in development
  debug: process.env.NODE_ENV !== 'production',
  
  // Secure JWT and session callbacks
  callbacks: authCallbacks,
  
  // Custom pages (optional - can be configured later)
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  }
}

/**
 * Utility function to check if authentication is properly configured
 * @returns true if auth is configured with at least one provider
 */
export function isAuthConfigured(): boolean {
  const hasSecret = Boolean(process.env.NEXTAUTH_SECRET)
  const hasProviders = authOptions.providers.length > 0
  
  return hasSecret && hasProviders
}

// Log authentication configuration status
if (PRISMA_AVAILABLE) {
  console.log('[AUTH] ✓ Authentication configured with database adapter')
} else {
  console.warn('[AUTH] ⚠ Authentication configured WITHOUT database adapter')
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[AUTH] Development fallback authentication enabled')
  }
}

console.log('[AUTH] Enabled providers:', getEnabledProviders().join(', '))
