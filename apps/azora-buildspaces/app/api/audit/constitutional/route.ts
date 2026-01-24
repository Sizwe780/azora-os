import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            action,
            entityType,
            entityId,
            preChecksPassed,
            postChecksPassed,
            constitutionalConcern,
            evidence,
            auditDetails
        } = body;

        // Validate required fields
        if (!action || !entityType || !entityId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create audit log
        const log = await prisma.constitutionalAuditLog.create({
            data: {
                userId: session.user.id || (session.user as any).sub, // Handle different session structures
                action,
                entityType,
                entityId,
                preChecksPassed: preChecksPassed ?? true,
                postChecksPassed: postChecksPassed ?? true,
                constitutionalConcern: constitutionalConcern ?? false,
                evidence: evidence ?? {},
                auditDetails: auditDetails ?? {},
            },
        });

        return NextResponse.json({ success: true, id: log.id });
    } catch (error) {
        console.error("Failed to create audit log:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
