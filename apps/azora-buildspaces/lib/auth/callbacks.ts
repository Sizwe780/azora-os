/**
 * NextAuth Callback Functions
 * 
 * Implements secure JWT and session callbacks for NextAuth.
 * Handles user ID persistence and session management.
 * 
 * Requirements: 2.2, 7.3, 7.5
 */

import { CallbacksOptions } from "next-auth"

/**
 * NextAuth callbacks configuration
 * Implements JWT and session callbacks for secure authentication flow
 */
export const authCallbacks: Partial<CallbacksOptions> = {
  /**
   * JWT callback - called when JWT is created or updated
   * Requirement 2.2: Persist user ID to token for session access
   * Requirement 7.5: Log authentication events for security auditing
   */
  async jwt({ token, user, account, profile, trigger }: any) {
    // On sign in, persist user id to token
    if (user?.id) {
      token.id = user.id
      console.log('[AUTH] JWT token created for user:', user.id)
    }
    
    // Log authentication events for security auditing
    if (trigger === 'signIn') {
      console.log('[AUTH] Sign in event:', {
        userId: user?.id,
        email: user?.email,
        provider: account?.provider,
        timestamp: new Date().toISOString()
      })
    }
    
    if (trigger === 'signUp') {
      console.log('[AUTH] Sign up event:', {
        userId: user?.id,
        email: user?.email,
        timestamp: new Date().toISOString()
      })
    }
    
    return token
  },
  
  /**
   * Session callback - called when session is checked
   * Requirement 2.2: Add user ID from token to session
   */
  async session({ session, token, user }: any) {
    // Add user id from token to session
    if (session?.user && token?.id) {
      session.user.id = token.id
    }
    
    // Add user id from database user (when using database sessions)
    if (session?.user && user?.id) {
      session.user.id = user.id
    }
    
    return session
  },
  
  /**
   * Sign in callback - called when user signs in
   * Can be used to control who can sign in
   * Requirement 7.5: Log authentication events
   */
  async signIn({ user, account, profile, email, credentials }: any) {
    console.log('[AUTH] Sign in attempt:', {
      userId: user?.id,
      email: user?.email,
      provider: account?.provider,
      timestamp: new Date().toISOString()
    })
    
    // Allow sign in by default
    // Add custom logic here if needed (e.g., email verification check)
    return true
  }
}
