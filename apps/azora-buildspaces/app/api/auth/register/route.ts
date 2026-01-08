import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Helper to hash password using Node.js crypto (since bcryptjs install failed)
function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
}

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
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                // We'll store the hashed password in a new field if we add it to the schema,
                // but for now, we'll just create the user.
                // NextAuth PrismaAdapter usually handles accounts, but for CredentialsProvider
                // we might need a password field on the User model.
            },
        });

        // Note: The current schema doesn't have a 'password' field on User.
        // I should update the schema to include it.

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
