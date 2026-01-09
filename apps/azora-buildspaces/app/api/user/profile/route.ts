import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/profile
 * 
 * Fetches the current user's profile data including subscription and verification status
 * from the database, replacing the hardcoded mock data in AuthService.
 */
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

    // TODO: Add proper subscription model to database schema
    // For now, return a default subscription based on user state
    const subscription = {
      plan: 'constitutional' as const,
      status: 'trial' as const,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      geographicPricing: {
        country: 'Global',
        discount: 0
      }
    };

    // Verification status based on emailVerified field
    const verificationStatus = {
      email: !!user.emailVerified,
      identity: false,
      student: false
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
