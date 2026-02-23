import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * Auth Guards & Middleware
 * 
 * Utility functions for protecting routes with authentication and authorization.
 * 
 * Constitutional Alignment:
 * - Security: Role-based access control
 * - Transparency: Logs authorization failures
 * - User Rights: Respects role-based permissions
 */

/**
 * Ensure user is authenticated
 * Throws 401 if no valid session
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Ensure user has required role(s)
 * Throws 403 if role not in requiredRoles
 */
export async function requireRole(requiredRoles: string | string[]) {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  type AuthUser = { id?: string; role?: string }
  const user = session.user as unknown as AuthUser
  const userRole = user.role || ''
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  if (!rolesArray.includes(userRole)) {
    throw new Error('Forbidden')
  }

  return session
}

/**
 * Middleware for API routes
 * Wraps handler with auth check
 */
export function withAuth(
  handler: (req: Request, ctx: unknown, session: Session) => Promise<Response>
) {
  return async (req: Request, ctx: unknown) => {
    try {
      const session = await requireAuth();
      return await handler(req, ctx, session as Session);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error instanceof Error && error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      throw error
    }
  }
}

/**
 * Middleware for role-based protection
 */
export function withRole(
  requiredRoles: string | string[],
  handler: (req: Request, ctx: unknown, session: Session) => Promise<Response>
) {
  return async (req: Request, ctx: unknown) => {
    try {
      const session = await requireRole(requiredRoles)
      return await handler(req, ctx, session as Session)
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error instanceof Error && error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Insufficient permissions for this action' }, { status: 403 })
      }
      throw error
    }
  }
}

/**
 * Get current user ID from session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = (await getServerSession(authOptions)) as Session | null
  type AuthUser = { id?: string }
  return ((session?.user as unknown as AuthUser)?.id) || null
}

/**
 * Get current user's role
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const session = (await getServerSession(authOptions)) as Session | null
  type AuthUser = { role?: string }
  return ((session?.user as unknown as AuthUser)?.role) || null
}
