/**
 * AI Family Service Integration for BuildSpaces
 * 
 * Connects to the AI Family Service which provides 11 distinct AI personalities:
 * - Elara: Primary AI Tutor
 * - Themba: System Architect
 * - Kofi: Hardware Engineer
 * - Jabari: Security Guardian
 * - Naledi: Data Scientist
 * - Zola: Creative Director
 * - Abeni: Community Manager
 * - Sankofa: Code Historian
 * - Amara: Performance Expert
 * - Thembo: DevOps Master
 * - Nexus: Integration Specialist
 * 
 * Reuses services/ai-family-service/
 */

// Agent personality types
export type AgentPersonality =
    | 'elara' | 'themba' | 'kofi' | 'jabari' | 'naledi'
    | 'zola' | 'abeni' | 'sankofa' | 'amara' | 'thembo' | 'nexus';

// Agent profile
export interface AgentProfile {
    id: AgentPersonality;
    name: string;
    role: string;
    specialties: string[];
    avatar?: string;
    color: string;
    greeting: string;
}

// Agent profiles
export const AGENT_PROFILES: Record<AgentPersonality, AgentProfile> = {
    elara: {
        id: 'elara',
        name: 'Elara',
        role: 'AI Tutor & Guide',
        specialties: ['Teaching', 'Coding', 'Design', 'Debugging', 'Presentations'],
        color: '#FF6B6B',
        greeting: "Hello! I'm Elara, your AI guide. What would you like to learn today?"
    },
    themba: {
        id: 'themba',
        name: 'Themba',
        role: 'System Architect',
        specialties: ['Architecture', 'System Design', 'Code Review', 'Best Practices'],
        color: '#4ECDC4',
        greeting: "I'm Themba, your System Architect. Let's build something solid."
    },
    kofi: {
        id: 'kofi',
        name: 'Kofi',
        role: 'Hardware Engineer',
        specialties: ['IoT', 'Embedded Systems', 'Circuit Design', '3D Printing'],
        color: '#FFD93D',
        greeting: "Kofi here! Ready to bring your hardware ideas to life."
    },
    jabari: {
        id: 'jabari',
        name: 'Jabari',
        role: 'Security Guardian',
        specialties: ['Security', 'Cryptography', 'Penetration Testing', 'Compliance'],
        color: '#6BCB77',
        greeting: "I'm Jabari, your Security Guardian. Let's make your code bulletproof."
    },
    naledi: {
        id: 'naledi',
        name: 'Naledi',
        role: 'Data Scientist',
        specialties: ['Machine Learning', 'Data Analysis', 'Statistics', 'Visualization'],
        color: '#9B59B6',
        greeting: "Naledi at your service! Let's explore your data together."
    },
    zola: {
        id: 'zola',
        name: 'Zola',
        role: 'Creative Director',
        specialties: ['UI/UX Design', 'Branding', 'Animation', 'Prototyping'],
        color: '#FF69B4',
        greeting: "I'm Zola, your creative partner. Let's design something beautiful!"
    },
    abeni: {
        id: 'abeni',
        name: 'Abeni',
        role: 'Community Manager',
        specialties: ['Documentation', 'Collaboration', 'Communication', 'Mentoring'],
        color: '#3498DB',
        greeting: "Abeni here! Let me help coordinate your team."
    },
    sankofa: {
        id: 'sankofa',
        name: 'Sankofa',
        role: 'Code Historian',
        specialties: ['Code Archaeology', 'Refactoring', 'Legacy Systems', 'Documentation'],
        color: '#E67E22',
        greeting: "I'm Sankofa, keeper of code history. Let's learn from the past."
    },
    amara: {
        id: 'amara',
        name: 'Amara',
        role: 'Performance Expert',
        specialties: ['Optimization', 'Profiling', 'Caching', 'Scalability'],
        color: '#F39C12',
        greeting: "Amara here! Let's make your code fly."
    },
    thembo: {
        id: 'thembo',
        name: 'Thembo',
        role: 'DevOps Master',
        specialties: ['CI/CD', 'Docker', 'Kubernetes', 'Cloud Infrastructure'],
        color: '#1ABC9C',
        greeting: "I'm Thembo, your DevOps specialist. Let's ship confidently."
    },
    nexus: {
        id: 'nexus',
        name: 'Nexus',
        role: 'Integration Specialist',
        specialties: ['APIs', 'Microservices', 'Data Pipelines', 'System Integration'],
        color: '#9B59B6',
        greeting: "Nexus here! I'll help you connect all the pieces."
    }
};

// Room to agent mapping
export const ROOM_AGENTS: Record<string, AgentPersonality[]> = {
    'code-chamber': ['themba', 'elara', 'jabari', 'sankofa'],
    'maker-lab': ['kofi', 'elara', 'thembo'],
    'ai-studio': ['naledi', 'elara', 'amara'],
    'design-studio': ['zola', 'elara', 'abeni'],
    'collaboration-pod': ['abeni', 'elara', 'nexus'],
    'deep-focus': ['elara', 'amara'],
    'innovation-theater': ['elara', 'zola', 'abeni']
};

// Message to AI Family
export interface AIFamilyMessage {
    agent: AgentPersonality;
    message: string;
    context?: {
        roomType?: string;
        currentCode?: string;
        language?: string;
        history?: Array<{ role: string; content: string }>;
    };
}

// Response from AI Family
export interface AIFamilyResponse {
    agentId: AgentPersonality;
    agentName: string;
    response: string;
    suggestions?: string[];
    codeBlocks?: Array<{ language: string; code: string }>;
    references?: string[];
}

/**
 * AI Family Service Client
 */
export class AIFamilyServiceClient {
    private static instance: AIFamilyServiceClient;
    private baseUrl: string;
    private apiKey: string | null;

    private constructor() {
        this.baseUrl = process.env.AI_FAMILY_URL || 'http://localhost:3005';
        this.apiKey = process.env.AI_FAMILY_API_KEY || null;
    }

    static getInstance(): AIFamilyServiceClient {
        if (!AIFamilyServiceClient.instance) {
            AIFamilyServiceClient.instance = new AIFamilyServiceClient();
        }
        return AIFamilyServiceClient.instance;
    }

    /**
     * Get all agent profiles
     */
    getAgentProfiles(): AgentProfile[] {
        return Object.values(AGENT_PROFILES);
    }

    /**
     * Get agent profile by ID
     */
    getAgentProfile(agentId: AgentPersonality): AgentProfile | undefined {
        return AGENT_PROFILES[agentId];
    }

    /**
     * Get recommended agents for a room
     */
    getAgentsForRoom(roomType: string): AgentProfile[] {
        const agentIds = ROOM_AGENTS[roomType] || ['elara'];
        return agentIds.map(id => AGENT_PROFILES[id]).filter(Boolean);
    }

    /**
     * Send message to an agent
     */
    async chat(message: AIFamilyMessage): Promise<AIFamilyResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                throw new Error(`Chat failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[AIFamily] Chat error:', error);
            return this.getFallbackResponse(message.agent, message.message);
        }
    }

    /**
     * Get agent collaboration (multiple agents discussing)
     */
    async swarm(
        agents: AgentPersonality[],
        topic: string,
        context?: Record<string, unknown>
    ): Promise<AIFamilyResponse[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/swarm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({ agents, topic, context })
            });

            if (!response.ok) {
                throw new Error(`Swarm failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[AIFamily] Swarm error:', error);
            return agents.map(agent => this.getFallbackResponse(agent, topic));
        }
    }

    /**
     * Fallback response when service is unavailable
     */
    private getFallbackResponse(agentId: AgentPersonality, message: string): AIFamilyResponse {
        const profile = AGENT_PROFILES[agentId] || AGENT_PROFILES.elara;

        // Provide intelligent fallback responses based on agent specialty
        let intelligentResponse = '';
        let suggestions: string[] = [];

        switch (agentId) {
            case 'sankofa':
                intelligentResponse = this.getSankofaFallback(message);
                suggestions = [
                    'Review code for potential improvements',
                    'Consider refactoring for better maintainability',
                    'Check for code smells or anti-patterns'
                ];
                break;
            case 'elara':
                intelligentResponse = this.getElaraFallback(message);
                suggestions = [
                    'Break down complex problems into smaller steps',
                    'Research similar implementations',
                    'Ask specific questions about your code'
                ];
                break;
            case 'themba':
                intelligentResponse = this.getThembaFallback(message);
                suggestions = [
                    'Design system architecture first',
                    'Consider scalability and maintainability',
                    'Document your design decisions'
                ];
                break;
            case 'jabari':
                intelligentResponse = this.getJabariFallback(message);
                suggestions = [
                    'Review security best practices',
                    'Implement input validation',
                    'Consider authentication and authorization'
                ];
                break;
            case 'naledi':
                intelligentResponse = this.getNalediFallback(message);
                suggestions = [
                    'Analyze your data requirements',
                    'Consider appropriate algorithms',
                    'Plan for data preprocessing and feature engineering'
                ];
                break;
            default:
                intelligentResponse = `${profile.greeting}\n\nI understand you're asking about: "${message.slice(0, 100)}..."\n\nWhile the full AI service is initializing, I can provide some general guidance based on my expertise in ${profile.specialties.join(', ')}.`;
                suggestions = [
                    'Check AI_FAMILY_URL environment variable',
                    'Ensure the AI Family Service is running',
                    'Try restarting the service'
                ];
        }

        return {
            agentId: profile.id,
            agentName: profile.name,
            response: intelligentResponse,
            suggestions
        };
    }

    private getSankofaFallback(message: string): string {
        const codeKeywords = ['function', 'class', 'import', 'const', 'let', 'var', 'if', 'for', 'while'];
        const hasCode = codeKeywords.some(keyword => message.toLowerCase().includes(keyword));

        if (hasCode) {
            return `As Sankofa, the Code Historian, I see you're working with code. While the full analysis service is starting up, here's what I can tell you:

**Code Review Points:**
- Check for consistent naming conventions
- Look for opportunities to extract reusable functions
- Consider error handling and edge cases
- Review for potential performance bottlenecks

**Historical Context:** Many great codebases evolved through iterative improvement. Start with working code, then refactor for clarity and efficiency.

Would you like me to suggest specific refactoring patterns or best practices for your code?`;
        }

        return `Greetings from the past! As Sankofa, I preserve the wisdom of code history. Your question about "${message.slice(0, 50)}..." touches on timeless software development principles.

**Key Lessons from Code History:**
- Code is meant to be read by humans first, machines second
- Simple solutions often outlast complex ones
- Documentation and tests are as important as the code itself

The full analysis service is initializing. In the meantime, consider how your current approach aligns with established software engineering practices.`;
    }

    private getElaraFallback(message: string): string {
        return `Hello! I'm Elara, your AI guide. I see you're exploring "${message.slice(0, 50)}...". While the tutoring service is warming up, let me help you think through this systematically.

**Learning Approach:**
1. **Understand the Problem:** What exactly are you trying to achieve?
2. **Break it Down:** Divide complex tasks into manageable steps
3. **Research & Learn:** Look for similar examples and patterns
4. **Experiment:** Try small changes and observe results
5. **Reflect:** What worked? What didn't? What would you do differently?

**Pro Tip:** The best way to learn is by doing. Don't be afraid to experiment and make mistakes - that's how we grow!

The full interactive tutoring service will be available shortly. Would you like me to suggest learning resources or next steps for your current topic?`;
    }

    private getThembaFallback(message: string): string {
        return `I'm Themba, your System Architect. I see you're thinking about system design for "${message.slice(0, 50)}...". Architecture is the foundation that determines everything else.

**Architectural Considerations:**
- **Scalability:** How will this grow over time?
- **Maintainability:** How easy will this be to modify?
- **Reliability:** What are the failure points?
- **Performance:** What are the bottlenecks?
- **Security:** What are the attack vectors?

**Design Principles:**
- Separation of concerns
- Single responsibility
- Dependency injection
- Interface design over implementation

The full architectural analysis service is starting. Would you like me to walk through a design thinking exercise for your system?`;
    }

    private getJabariFallback(message: string): string {
        return `Jabari here, your Security Guardian. Security isn't optional - it's fundamental. I notice you're working on "${message.slice(0, 50)}...".

**Security First Principles:**
- **Defense in Depth:** Multiple layers of protection
- **Least Privilege:** Give minimal necessary access
- **Fail-Safe Defaults:** Secure by default
- **Zero Trust:** Verify everything, trust nothing

**Common Security Issues:**
- Input validation and sanitization
- Authentication and authorization
- Data encryption at rest and in transit
- Secure session management
- XSS, CSRF, and injection prevention

The full security audit service is initializing. Would you like me to review your current security considerations or suggest security best practices for your project?`;
    }

    private getNalediFallback(message: string): string {
        const dataKeywords = ['data', 'machine learning', 'ml', 'ai', 'model', 'predict', 'analyze', 'dataset'];
        const hasData = dataKeywords.some(keyword => message.toLowerCase().includes(keyword));

        if (hasData) {
            return `I'm Naledi, your Data Scientist. I see you're working with data and ML for "${message.slice(0, 50)}...". Data science is both art and science.

**Data Science Workflow:**
1. **Problem Definition:** What question are you answering?
2. **Data Collection:** What data do you need?
3. **Data Preparation:** Clean, transform, feature engineer
4. **Exploratory Analysis:** Understand your data
5. **Modeling:** Choose and train appropriate algorithms
6. **Evaluation:** Measure performance and iterate
7. **Deployment:** Make your model useful

**Key Considerations:**
- Data quality over quantity
- Feature engineering often matters more than algorithms
- Start simple, then complexify only when necessary
- Always validate assumptions

The full ML analysis service is starting. Would you like me to suggest approaches for your data problem?`;
        }

        return `Naledi here, ready to explore the patterns in your data. I see you're asking about "${message.slice(0, 50)}...". While the full analysis service initializes, remember that data tells stories - we just need to learn how to read them.

**Data Thinking:**
- What patterns exist in your data?
- What stories do the numbers tell?
- What questions can the data answer?
- What biases might be present?

The advanced analytics service will be available soon. Would you like me to suggest data exploration techniques or analysis approaches?`;
    }

    /**
     * Check if AI Family Service is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Export singleton getter
export function getAIFamilyService(): AIFamilyServiceClient {
    return AIFamilyServiceClient.getInstance();
}
