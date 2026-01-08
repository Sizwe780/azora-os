// Supervisor Agent: The "Traffic Controller" of the Command Desk

export type AgentRole = 'ARCHITECT' | 'SCRIBE' | 'ARTISAN' | 'SUPERVISOR';
export type RoomContext = 'CODE_CHAMBER' | 'SPEC_CHAMBER' | 'DESIGN_STUDIO' | 'COMMAND_DESK';

interface TaskRequest {
    intent: string;
    room: RoomContext;
    payload: any;
}

interface AgentResponse {
    agent: string;
    role: AgentRole;
    action: string;
    data: any;
}

export class SupervisorAgent {

    async routeTask(request: TaskRequest): Promise<AgentResponse> {
        console.log(`[Supervisor] Analyzing request for ${request.room}: ${request.intent}`);

        try {
            const response = await fetch('http://localhost:3010', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    did: request.payload?.did || "did:key:z6MkpTHR8V369", // Fallback to default if not provided
                    signature: request.payload?.signature || "UNSIGNED", // Require real signature in production
                    payload: {
                        type: "AGENT_TASK",
                        room: request.room,
                        intent: request.intent,
                        payload: request.payload
                    }
                })
            });

            if (!response.ok) throw new Error(`Bridge error: ${response.statusText}`);

            const data = await response.json();

            return {
                agent: data.agent,
                role: data.model.includes('architect') ? 'ARCHITECT' : (data.model.includes('artisan') ? 'ARTISAN' : 'SCRIBE'),
                action: data.status === 'processed' ? 'EXECUTE' : 'PENDING',
                data: {
                    message: data.response,
                    hardware: data.hardware,
                    model: data.model
                }
            };
        } catch (error) {
            console.error("[Supervisor] Bridge connection failed, falling back to local heuristic:", error);
            // Fallback logic for offline mode
            return {
                agent: 'System',
                role: 'SUPERVISOR',
                action: 'OFFLINE_MODE',
                data: { message: "Bridge offline. Please ensure azora-bridge.py is running." }
            };
        }
    }
}
