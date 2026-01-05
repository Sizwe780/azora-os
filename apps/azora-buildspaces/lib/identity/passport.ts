import { Ed25519KeyPair } from '@transmute/did-key-ed25519';

export interface AgentPassport {
    id: string;
    name: string;
    role: string;
    created_at: string;
    hardware_affinity: string;
    verification_method: any;
}

export async function generateAgentPassport(agentName: string): Promise<AgentPassport> {
    // 1. Generate a cryptographic keypair for the agent
    const keyPair = await Ed25519KeyPair.generate({
        secureRandom: () => {
            // Polyfill for secure random if needed in certain envs, 
            // but standard node/browser crypto usually suffices.
            return new Uint8Array(32).map(() => Math.floor(Math.random() * 256));
        }
    });

    // 2. Derive a W3C compliant DID (Decentralized Identifier)
    // The library handles the did:key method specifics
    const did = keyPair.controller;

    // 3. Construct the Passport (Metadata + Proof)
    const passport: AgentPassport = {
        id: did,
        name: agentName,
        role: agentName === "Elara" ? "Architect" : (agentName === "Zuri" ? "Artisan" : "Scribe"),
        created_at: new Date().toISOString(),
        hardware_affinity: "Snapdragon-X-Elite-NPU", // Future-proofing for Vivobook
        verification_method: await keyPair.export({ type: 'JsonWebKey2020', privateKey: false })
    };

    return passport;
}
