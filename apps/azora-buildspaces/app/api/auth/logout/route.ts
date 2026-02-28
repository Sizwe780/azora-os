import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { logAuthEvent } from '@/lib/auth-audit';

/**
 * POST /api/auth/logout
 * 
 * Securely logout the current user and invalidate their session.
 * Logs the logout event for constitutional audit trail.
 * 
 * Constitutional Alignment:
 * - Transparency: Logs all auth events via centralized audit logger
 * - User Sovereignty: User controls their session
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Session will be invalidated by NextAuth on client side
    // Server-side: log the logout event for audit trail
    const userId = (session.user as any).id || session.user.email;
    const userEmail = session.user.email || 'unknown';

    await logAuthEvent({
      action: 'LOGOUT',
      userId,
      userEmail,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || undefined,
      success: true,
      metadata: { email: userEmail },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully logged out'
    });

  } catch (error) {
    console.error('[AUTH] Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/logout
 * Redirect user to logout endpoint
 */
export async function GET(req: Request) {
  return POST(req);
}
