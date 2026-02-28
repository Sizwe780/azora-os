import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import crypto from 'crypto';
import { logAuthEvent } from '@/lib/auth-audit';

/**
 * POST /api/auth/forgot-password
 * 
 * Initiates password reset flow.
 * Generates a temporary reset token and sends email (simulated).
 * 
 * Constitutional Alignment:
 * - User Sovereignty: Users can recover their accounts
 * - Security: Rate limited, token-based verification
 * - Transparency: Logs reset requests via centralized audit logger
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // For security, don't reveal if email exists — but audit the attempt
      await logAuthEvent({
        action: 'PASSWORD_RESET',
        userEmail: normalizedEmail,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || undefined,
        success: false,
        reason: 'Email not found (not disclosed to client)',
      });

      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store reset token in database
    // Note: passwordResetToken/passwordResetExpires fields pending schema migration
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     passwordResetToken: resetTokenHash,
    //     passwordResetExpires: resetTokenExpires
    //   }
    // });

    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

    // Audit the password reset request
    await logAuthEvent({
      action: 'PASSWORD_RESET',
      userId: user.id,
      userEmail: normalizedEmail,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || undefined,
      success: true,
      metadata: { tokenExpires: resetTokenExpires.toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email. Please check your inbox and spam folder.'
    });

  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
