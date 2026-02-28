import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/client";
import { hashPassword } from "@/lib/auth/utils";
import { logAuthEvent } from "@/lib/auth-audit";

export async function POST(req: Request) {
    try {
        const { name, email, password, country } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            await logAuthEvent({
                action: 'SIGNUP',
                userEmail: email,
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || undefined,
                success: false,
                reason: 'User already exists',
            });

            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password using the proper utility function
        const hashedPassword = hashPassword(password);

        // Create user with hashed password
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        await logAuthEvent({
            action: 'SIGNUP',
            userId: user.id,
            userEmail: email,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || undefined,
            success: true,
            metadata: { country },
        });

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
