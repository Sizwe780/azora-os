import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/database/client";

/**
 * GET /api/user/profile
 * 
 * Fetches the current user's profile data including subscription and verification status
 * from the database, replacing the hardcoded mock data in AuthService.
 */

// Default subscription configuration
// TODO: Move to database schema and configuration table
const DEFAULT_SUBSCRIPTION = {
  plan: 'constitutional' as const,
  status: 'trial' as const,
  trialDurationDays: 30,
  geographicPricing: {
    country: 'Global',
    discount: 0
  }
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    console.log('[API] Profile request for userId:', userId);

    // DEV AUTH MODE: Handle master user without DB access
    if (userId === 'master-user') {
      return NextResponse.json({
        id: 'master-user',
        name: 'Master Administrator',
        email: 'admin@azora.world',
        createdAt: new Date(),
        subscription: {
          plan: 'constitutional',
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          geographicPricing: { country: 'Global', discount: 0 }
        },
        verificationStatus: {
          email: true,
          identity: true,
          student: false
        }
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        image: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // TODO: Add proper subscription model to database schema [Target: Q1 2026]
    // Priority: HIGH - This affects billing accuracy and user experience
    // For now, return a default subscription based on configuration
    const subscription = {
      plan: DEFAULT_SUBSCRIPTION.plan,
      status: DEFAULT_SUBSCRIPTION.status,
      expiresAt: new Date(Date.now() + DEFAULT_SUBSCRIPTION.trialDurationDays * 24 * 60 * 60 * 1000),
      geographicPricing: DEFAULT_SUBSCRIPTION.geographicPricing
    };

    // Verification status based on emailVerified field
    // TODO: Add identity and student verification fields to User model [Target: Q1 2026]
    // For now, these are hardcoded as false since the schema doesn't support them yet
    const verificationStatus = {
      email: !!user.emailVerified,
      identity: false, // Will be populated from User.identityVerified once schema is updated
      student: false   // Will be populated from User.studentVerified once schema is updated
    };

    return NextResponse.json({
      id: user.id,
      name: user.name || 'User',
      email: user.email || '',
      createdAt: user.createdAt,
      subscription,
      verificationStatus
    });

  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
