/**
 * Authentication Module - Main Export Point
 * 
 * Centralized exports for all authentication functionality.
 * Provides a clean API for authentication configuration, providers, callbacks, and utilities.
 * 
 * Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4, 7.5
 */

// Export main auth configuration
export { authOptions, isAuthConfigured } from './config'

// Export provider utilities
export { buildProviders, getEnabledProviders } from './providers'

// Export callbacks
export { authCallbacks } from './callbacks'

// Export utility functions
export {
  verifyPassword,
  hashPassword,
  validatePasswordStrength,
  validateEmail,
  generateSecureToken,
  generateTokenExpiry,
  isTokenExpired
} from './utils'

// Re-export types from next-auth for convenience
export type { NextAuthOptions } from 'next-auth'
export type { Session } from 'next-auth'
export type { JWT } from 'next-auth/jwt'
