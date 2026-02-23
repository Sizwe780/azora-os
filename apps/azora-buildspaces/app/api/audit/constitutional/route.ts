import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

/**
 * GET /api/audit/constitutional
 * Retrieve constitutional validation logs
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
        const violationsOnly = searchParams.get('violationsOnly') === 'true';

        // Filter for constitutional logs
        const where: any = {};

        // Only show user's own logs unless admin
        if ((session.user as any).role !== 'ADMIN') {
            where.userId = session.user.id;
        }

        // If violationsOnly, filter for logs with concerns
        if (violationsOnly) {
            where.constitutionalConcern = true;
        }

        const logs = await prisma.constitutionalAuditLog.findMany({
            where,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        // Calculate statistics
        const totalLogs = await prisma.constitutionalAuditLog.count({ where });
        const violations = logs.filter((l: any) => l.constitutionalConcern);

        return NextResponse.json({
            logs,
            statistics: {
                total: totalLogs,
                violations: violations.length,
                complianceRate: totalLogs > 0 
                    ? ((totalLogs - violations.length) / totalLogs * 100).toFixed(2) 
                    : '100.00',
            },
        });
    } catch (error) {
        console.error("[Constitutional Audit] Error retrieving logs:", error);
        return NextResponse.json(
            { error: "Failed to retrieve constitutional audit logs" },
            { status: 500 }
        );
    }
}

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

        return NextResponse.json({ success: true, id: log.id, constitutionalConcern });
    } catch (error) {
        console.error("Failed to create audit log:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}