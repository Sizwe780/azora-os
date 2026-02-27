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
  async jwt(params: any) {
    const { token, user, account, profile, trigger } = params;
    // On sign in, persist user id to token
    if (user) {
      token.id = user.id
      token.sub = user.id // Ensure sub is set
      token.email = user.email
      token.name = user.name
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
  // @ts-ignore
  async session({ session, token, user }) {
    // Add user id from token to session (JWT strategy)
    if (session?.user && token?.sub) {
      session.user.id = token.sub
    }
    // Also check for id directly on token if set manually
    else if (session?.user && token?.id) {
       session.user.id = token.id
    }

    // Persist email and name if available in token
    if (session?.user && token?.email) {
      session.user.email = token.email
    }
    if (session?.user && token?.name) {
      session.user.name = token.name
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
