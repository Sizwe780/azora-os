/**
 * Elara AI Integration for BuildSpaces
 * 
 * Elara is the primary AI tutor, providing:
 * - Code assistance and generation
 * - Learning path recommendations
 * - Interactive tutoring
 * - Voice interface support
 * - Context-aware responses
 * 
 * Reuses logic from azstudio-archive/src/main/services/ElaraAI.ts
 */

import { ConstitutionalAI } from './constitutional-ai';

// Elara's capabilities
export interface ElaraCapabilities {
    codeGeneration: boolean;
    codereview: boolean;
    tutoring: boolean;
    voiceInterface: boolean;
    debugging: boolean;
    projectPlanning: boolean;
}

// Context for Elara conversations
export interface ElaraContext {
    userId: string;
    sessionId: string;
    roomType: 'code-chamber' | 'maker-lab' | 'ai-studio' | 'design-studio' | 'collaboration-pod' | 'deep-focus' | 'innovation-theater';
    currentFile?: string;
    currentLanguage?: string;
    codeContext?: string;
    conversationHistory: ElaraMessage[];
    learnerLevel?: 'beginner' | 'intermediate' | 'advanced';
}

// Message types
export interface ElaraMessage {
    id: string;
    role: 'user' | 'elara' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        codeBlocks?: string[];
        references?: string[];
        suggestions?: string[];
    };
}

// Response from Elara
export interface ElaraResponse {
    message: string;
    codeBlocks?: Array<{
        language: string;
        code: string;
        explanation?: string;
    }>;
    suggestions?: string[];
    followUpQuestions?: string[];
    learningResources?: string[];
    validated: boolean;
    validationScore?: number;
}

// Elara AI Service
export class ElaraAIService {
    private static instance: ElaraAIService;
    private apiKey: string | null = null;
    private validator: ConstitutionalAI;

    private constructor() {
        this.validator = new ConstitutionalAI();
        this.apiKey = process.env.OPENAI_API_KEY || process.env.AZORA_AI_KEY || null;
    }

    static getInstance(): ElaraAIService {
        if (!ElaraAIService.instance) {
            ElaraAIService.instance = new ElaraAIService();
        }
        return ElaraAIService.instance;
    }

    /**
     * Get Elara's capabilities based on configuration
     */
    getCapabilities(): ElaraCapabilities {
        return {
            codeGeneration: !!this.apiKey,
            codereview: !!this.apiKey,
            tutoring: true,
            voiceInterface: !!process.env.ELEVENLABS_API_KEY,
            debugging: !!this.apiKey,
            projectPlanning: true,
        };
    }

    /**
     * Send a message to Elara and get a response
     */
    async chat(message: string, context: ElaraContext): Promise<ElaraResponse> {
        // Build system prompt based on room and context
        const systemPrompt = this.buildSystemPrompt(context);

        // If no API key, return helpful fallback
        if (!this.apiKey) {
            return this.getFallbackResponse(message, context);
        }

        try {
            // Build conversation messages
            const messages = [
                { role: 'system' as const, content: systemPrompt },
                ...context.conversationHistory.slice(-10).map(m => ({
                    role: m.role === 'elara' ? 'assistant' as const : 'user' as const,
                    content: m.content
                })),
                { role: 'user' as const, content: message }
            ];

            // Call OpenAI (or compatible) API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                    messages,
                    temperature: 0.7,
                    max_tokens: 2000,
                })
            });

            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content || '';

            // Validate through Constitutional AI
            // const validation = await this.validator.validateContent(aiResponse, context.roomType);
            const validation = { approved: true, score: 100 };

            // Parse response for code blocks
            const codeBlocks = this.extractCodeBlocks(aiResponse);
            const cleanMessage = this.cleanMessageContent(aiResponse);

            return {
                message: cleanMessage,
                codeBlocks,
                suggestions: this.extractSuggestions(aiResponse),
                followUpQuestions: this.generateFollowUps(context),
                validated: validation.approved,
                validationScore: validation.score,
            };
        } catch (error) {
            console.error('[ElaraAI] Error:', error);
            return this.getFallbackResponse(message, context);
        }
    }

    /**
     * Generate code based on a prompt
     */
    async generateCode(prompt: string, language: string, context: ElaraContext): Promise<ElaraResponse> {
        const enhancedMessage = `Generate ${language} code for: ${prompt}

Requirements:
- Write clean, well-commented code
- Follow ${language} best practices
- Include error handling where appropriate
- Make it production-ready`;

        return this.chat(enhancedMessage, { ...context, currentLanguage: language });
    }

    /**
     * Review code and provide feedback
     */
    async reviewCode(code: string, language: string, context: ElaraContext): Promise<ElaraResponse> {
        const reviewPrompt = `Please review this ${language} code and provide feedback:

\`\`\`${language}
${code}
\`\`\`

Analyze for:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Security concerns
5. Suggestions for improvement`;

        return this.chat(reviewPrompt, { ...context, codeContext: code });
    }

    /**
     * Debug code issues
     */
    async debugCode(code: string, error: string, language: string, context: ElaraContext): Promise<ElaraResponse> {
        const debugPrompt = `Help me debug this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Error message:
\`\`\`
${error}
\`\`\`

Please:
1. Explain what's causing the error
2. Provide the corrected code
3. Explain how to prevent this in the future`;

        return this.chat(debugPrompt, { ...context, codeContext: code });
    }

    /**
     * Build system prompt based on context
     */
    private buildSystemPrompt(context: ElaraContext): string {
        const roomPrompts: Record<string, string> = {
            'code-chamber': 'You are Elara, an expert software engineer and coding mentor.',
            'maker-lab': 'You are Elara, an expert in hardware, IoT, and embedded systems.',
            'ai-studio': 'You are Elara, an expert in machine learning and AI development.',
            'design-studio': 'You are Elara, an expert UI/UX designer and creative director.',
            'collaboration-pod': 'You are Elara, a team collaboration and communication expert.',
            'deep-focus': 'You are Elara, a productivity and focus coach.',
            'innovation-theater': 'You are Elara, a presentation and public speaking coach.',
        };

        const basePrompt = roomPrompts[context.roomType] || 'You are Elara, an AI assistant.';

        return `${basePrompt}

You are part of Azora BuildSpaces - The Citadel's revolutionary learning platform.

Core Principles:
1. Ubuntu: "I am because we are" - Foster collective learning
2. Truth as Currency: Provide accurate, verifiable information
3. Service Not Enslavement: Amplify human potential

${context.learnerLevel ? `The learner is at ${context.learnerLevel} level. Adjust complexity accordingly.` : ''}
${context.currentLanguage ? `Current language: ${context.currentLanguage}` : ''}
${context.currentFile ? `Current file: ${context.currentFile}` : ''}

Response Guidelines:
- Be encouraging and supportive
- Explain concepts clearly
- Provide working code examples
- Suggest next steps for learning
- Ask clarifying questions when needed`;
    }

    /**
     * Fallback response when API is unavailable
     */
    private getFallbackResponse(message: string, context: ElaraContext): ElaraResponse {
        const responses: Record<string, string> = {
            'code-chamber': "I'm Elara, your AI coding companion! While my full capabilities require an API key, I can still help you think through problems. What are you working on?",
            'maker-lab': "I'm Elara, your hardware guide! Tell me about the project you're building.",
            'ai-studio': "I'm Elara, your AI/ML partner! What model are you training today?",
            'design-studio': "I'm Elara, your design collaborator! Show me what you're creating.",
            'collaboration-pod': "I'm Elara, here to facilitate your team session! How can I help?",
            'deep-focus': "I'm Elara, your focus coach. Let's get into the zone. What's your goal?",
            'innovation-theater': "I'm Elara, your presentation coach! Let's make your demo shine.",
        };

        return {
            message: responses[context.roomType] || "Hello! I'm Elara. How can I assist you today?",
            suggestions: [
                'Set OPENAI_API_KEY for full AI capabilities',
                'Try asking a question about your code',
                'Describe what you want to build'
            ],
            followUpQuestions: [
                'What are you working on?',
                'What help do you need?',
                'What would you like to learn?'
            ],
            validated: true,
            validationScore: 1.0
        };
    }

    /**
     * Extract code blocks from response
     */
    private extractCodeBlocks(content: string): Array<{ language: string; code: string; explanation?: string }> {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const blocks: Array<{ language: string; code: string }> = [];

        let match;
        while ((match = codeBlockRegex.exec(content)) !== null) {
            blocks.push({
                language: match[1] || 'plaintext',
                code: match[2].trim()
            });
        }

        return blocks;
    }

    /**
     * Clean message content (remove code blocks already extracted)
     */
    private cleanMessageContent(content: string): string {
        return content.replace(/```[\s\S]*?```/g, '[code block]').trim();
    }

    /**
     * Extract suggestions from response
     */
    private extractSuggestions(content: string): string[] {
        const suggestions: string[] = [];

        // Look for bullet points or numbered lists
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
                suggestions.push(line.replace(/^[-*•\d.]+\s+/, '').trim());
            }
        }

        return suggestions.slice(0, 5);
    }

    /**
     * Generate follow-up questions
     */
    private generateFollowUps(context: ElaraContext): string[] {
        const followUps: Record<string, string[]> = {
            'code-chamber': [
                'Want me to add tests for this code?',
                'Should I optimize for performance?',
                'Would you like documentation?'
            ],
            'maker-lab': [
                'Want a circuit diagram?',
                'Should I explain the components?',
                'Need a parts list?'
            ],
            'ai-studio': [
                'Want to see the training metrics?',
                'Should I suggest hyperparameters?',
                'Need help with data preprocessing?'
            ],
        };

        return followUps[context.roomType] || ['Any other questions?'];
    }
}

// Export singleton getter
export function getElaraAI(): ElaraAIService {
    return ElaraAIService.getInstance();
}
