import fs from 'fs';
import path from 'path';
import { deployToWorkerNode } from "../deploy-node";

export interface TaskRequest {
    id: string;
    requirements: string[]; // ['inference', 'storage', 'build', 'gpu']
    payload: any;
}

export interface NodeInfo {
    id: string;
    status: 'Active' | 'Offline';
    type: 'NPU' | 'CPU' | 'GPU';
    ip: string;
    did: string;
}

export async function negotiateTask(task: TaskRequest) {
    let nodes: NodeInfo[] = [];
    try {
        const nodesPath = path.join(process.cwd(), 'data', 'nodes.json');
        if (fs.existsSync(nodesPath)) {
            const nodesData = fs.readFileSync(nodesPath, 'utf8');
            nodes = JSON.parse(nodesData);
        } else {
            // Fallback to default nodes if file doesn't exist
            nodes = [
                { id: "Citadel", status: "Active", type: "NPU", ip: "localhost", did: "did:key:z6MkpTHR8V369" },
                { id: "Forge-X515", status: "Active", type: "CPU", ip: "10.0.0.1", did: "did:key:z6Mkg9X515JAB" }
            ];
        }
    } catch (error) {
        console.error("[Governance] Failed to load nodes from data/nodes.json:", error);
        nodes = [{ id: "Citadel", status: "Active", type: "NPU", ip: "localhost", did: "did:key:z6MkpTHR8V369" }];
    }

    console.log(`[Governance] Negotiating task ${task.id}...`);

    // 1. Identify Task requirements
    if (task.requirements.includes("inference")) {
        const citadel = nodes.find(n => n.id === "Citadel" && n.status === "Active");
        if (citadel) return delegateTo(citadel, task);
    }

    // 2. Default to the Worker Node for heavy containerization or storage
    const forge = nodes.find(n => n.id === "Forge-X515" && n.status === "Active");
    if (forge) return delegateTo(forge, task);

    throw new Error("No suitable node available for task execution");
}

async function delegateTo(node: NodeInfo, task: TaskRequest) {
    console.log(`[Governance] Routing ${task.id} to ${node.id} (${node.ip}) via DID ${node.did}`);

    if (node.ip !== 'localhost') {
        // Real deployment to remote node
        const result = await deployToWorkerNode(
            node.ip,
            'azora',
            process.env.SSH_KEY_PATH,
            task.payload.dockerCompose || ''
        );

        if (!result.success) {
            throw new Error(`Deployment to ${node.id} failed: ${result.error}`);
        }

        return {
            nodeId: node.id,
            ip: node.ip,
            did: node.did,
            status: "DEPLOYED",
            logs: result.logs
        };
    }

    // Local execution (Citadel/NPU)
    return {
        nodeId: node.id,
        ip: node.ip,
        did: node.did,
        status: "LOCAL_EXECUTION"
    };
}
