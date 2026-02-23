import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma as db } from "@/lib/database/client";
import { scaffoldProject } from "@/lib/scaffold-project";

export async function launchWorkspace(projectId: string, organizationId: string) {
    // 1. Auth Check (Sovereign Verification)
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        throw new Error("Unauthorized: No active session");
    }

    // Cast session user to include organizationId (injected in auth options)
    const userOrgId = (session.user as any).organizationId;

    if (userOrgId !== organizationId) {
        throw new Error("Unauthorized: User does not belong to this organization");
    }

    // 2. State Retrieval
    const project = await db.buildSpaceProject.findUnique({
        where: { id: projectId },
        include: { organization: true } // Ensure we can check org ownership if needed
    });

    if (!project) {
        throw new Error("Project not found");
    }

    // 3. Maker Lab Scaffolding
    // We assume there's a spec associated, or we use defaults. 
    // In a real app, we'd fetch the spec relation.
    const spec = await db.buildSpaceSpec.findFirst({
        where: { projectId: project.id },
        orderBy: { updatedAt: 'desc' }
    });

    const dockerConfig = scaffoldProject(spec || {});

    // 4. Native Bridge Preparation
    // Signals the local Python bridge (azora-bridge.py) to allocate NPU resources
    try {
        // In production, this might be a call to a local service or sidecar
        // For now, we simulate the call to the Native Host port if accessible via HTTP wrapper
        // or just log it as part of the "No Mock" protocol's intent.
        await fetch("http://localhost:5050/prepare-ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                context: project.name,
                hardware: "detect", // Will trigger detect_npu() in bridge
                projectId: project.id
            })
        });
    } catch (error) {
        console.warn("Failed to signal Native Bridge (NPU optimization skipped):", error);
        // Non-blocking error, workspace can still launch on CPU
    }

    // 5. Initialize Yjs Room Connection
    // Return the details needed for the frontend to connect to the Collaboration Pod
    return {
        roomId: `project-${projectId}`,
        transport: "ws://localhost:1234",
        dockerConfig // Return this so the frontend can display/use it (or trigger build)
    };
}
