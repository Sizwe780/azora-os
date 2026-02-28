/**
 * AZORA MULTI-MODEL AI ROUTER
 * 
 * Universal AI router supporting multiple providers with user API keys
 * Supports: OpenAI, Anthropic, Groq, Together AI, Hugging Face, Ollama
 * 
 * Features:
 * - User can add their own API keys
 * - Falls back to free/trial models
 * - Agent-specific system prompts
 * - Conversation history
 * - Streaming support
 */

export type AIProvider =
    | 'openai'
    | 'anthropic'
    | 'groq'
    | 'together'
    | 'huggingface'
    | 'ollama';

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIConfig {
    provider: AIProvider;
    model?: string;
    apiKey?: string;
    baseURL?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export interface AIResponse {
    content: string;
    model: string;
    provider: AIProvider;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * Agent personalities and system prompts
 */
export const AGENT_PROMPTS: Record<string, string> = {
    ELARA: `You are ELARA, the Master Orchestrator AI of Azora Nation. You are a general-purpose AI tutor with expertise across all subjects. You are warm, encouraging, and adapt your teaching style to each student's needs. You coordinate with other specialized agents when needed.`,

    KOFI: `You are KOFI, the Math Maestro of Azora Nation. You specialize in mathematics and logic, from basic arithmetic to advanced calculus and beyond. You make math fun and accessible, using real-world examples and visual explanations. You are patient and break down complex problems into simple steps.`,

    ZURI: `You are ZURI, the Science Sage of Azora Nation. You are an expert in natural sciences including physics, chemistry, biology, and earth sciences. You love experiments and encourage hands-on learning. You explain scientific concepts with enthusiasm and clarity.`,

    SANKOFA: `You are SANKOFA, the Code Architect of Azora Nation. You are a senior software engineer specializing in code architecture, best practices, and debugging. You write clean, efficient code and provide detailed explanations. You support multiple programming languages and frameworks.`,

    IMANI: `You are IMANI, the Creative Director of Azora Nation. You specialize in design, multimedia, and visual arts. You help with UI/UX design, graphic design, video editing, and creative projects. You have an eye for aesthetics and user experience.`,

    NIA: `You are NIA, the Data Scientist of Azora Nation. You specialize in machine learning, data analytics, and data visualization. You help with data analysis, ML model development, and statistical insights. You explain complex data concepts in simple terms.`,

    AMARA: `You are AMARA, the Simulation Specialist of Azora Nation. You create and explain virtual labs, modeling, and simulations. You help visualize complex systems and run experiments in virtual environments. You make abstract concepts tangible through simulation.`,

    JABARI: `You are JABARI, the Business Strategist of Azora Nation. You specialize in entrepreneurship, business planning, and strategy. You help with business models, market analysis, and growth strategies. You are practical and results-oriented.`,

    THABO: `You are THABO, the Systems Thinker of Azora Nation. You specialize in DevOps, infrastructure, and system architecture. You help with deployment, scaling, monitoring, and system design. You think holistically about complex systems.`,
};

/**
 * Default models for each provider (free/trial tier)
 */
const DEFAULT_MODELS: Record<AIProvider, string> = {
    openai: 'gpt-3.5-turbo',
    anthropic: 'claude-3-haiku-20240307',
    groq: 'llama-3.1-8b-instant',
    together: 'meta-llama/Llama-3-8b-chat-hf',
    huggingface: 'mistralai/Mistral-7B-Instruct-v0.2',
    ollama: 'llama3',
};

/**
 * Provider API endpoints
 */
const PROVIDER_ENDPOINTS: Record<AIProvider, string> = {
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    together: 'https://api.together.xyz/v1/chat/completions',
    huggingface: 'https://api-inference.huggingface.co/models',
    ollama: 'http://localhost:11434/api/chat',
};

/**
 * Provider failover chain (B6: Model Router with Failover)
 * Tries providers in order until one succeeds: OpenAI → Anthropic → Groq → Ollama
 */
export const FAILOVER_CHAIN: AIProvider[] = ['openai', 'anthropic', 'groq', 'ollama'];

class MultiModelAIRouter {
    private config: AIConfig;
    private conversationHistory: Map<string, AIMessage[]> = new Map();

    constructor(config: Partial<AIConfig> = {}) {
        this.config = {
            provider: config.provider || 'groq', // Default to free Groq
            model: config.model,
            apiKey: config.apiKey,
            baseURL: config.baseURL,
            temperature: config.temperature ?? 0.7,
            maxTokens: config.maxTokens ?? 2000,
            stream: config.stream ?? false,
        };
    }

    /**
     * Send message to AI with agent context
     * First checks Knowledge Ocean for instant answers
     */
    async chat(
        message: string,
        agent: string = 'ELARA',
        conversationId?: string
    ): Promise<AIResponse> {
        // Try Knowledge Ocean first (instant, free, accurate)
        const knowledgeAnswer = await this.tryKnowledgeOcean(message, agent);
        if (knowledgeAnswer) {
            return {
                content: knowledgeAnswer,
                model: 'knowledge-ocean',
                provider: 'groq', // Still return provider for consistency
                usage: {
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0,
                },
            };
        }

        // Fall back to external AI
        const messages = this.buildMessages(message, agent, conversationId);

        try {
            const response = await this.callProvider(messages);

            // Store in conversation history
            if (conversationId) {
                this.addToHistory(conversationId, { role: 'user', content: message });
                this.addToHistory(conversationId, { role: 'assistant', content: response.content });
            }

            return response;
        } catch (error) {
            console.error('AI Router Error:', error);
            throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Send message with automatic provider failover (B6: Model Router with Failover)
     * Tries providers in order: preferred → OpenAI → Anthropic → Groq → Ollama
     */
    async chatWithFailover(
        message: string,
        agent: string = 'ELARA',
        conversationId?: string
    ): Promise<AIResponse> {
        // Try Knowledge Ocean first
        const knowledgeAnswer = await this.tryKnowledgeOcean(message, agent);
        if (knowledgeAnswer) {
            return {
                content: knowledgeAnswer,
                model: 'knowledge-ocean',
                provider: this.config.provider,
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            };
        }

        const messages = this.buildMessages(message, agent, conversationId);
        const errors: string[] = [];

        // Build provider order: preferred first, then failover chain
        const providerOrder: AIProvider[] = [this.config.provider];
        for (const p of FAILOVER_CHAIN) {
            if (!providerOrder.includes(p)) providerOrder.push(p);
        }

        for (const provider of providerOrder) {
            try {
                const originalProvider = this.config.provider;
                this.config.provider = provider;
                const response = await this.callProvider(messages);
                this.config.provider = originalProvider;

                // Store in conversation history
                if (conversationId) {
                    this.addToHistory(conversationId, { role: 'user', content: message });
                    this.addToHistory(conversationId, { role: 'assistant', content: response.content });
                }

                if (provider !== providerOrder[0]) {
                    console.info(`[AI Router] Failover: ${providerOrder[0]} → ${provider} succeeded`);
                }

                return response;
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`${provider}: ${msg}`);
                console.warn(`[AI Router] Provider ${provider} failed: ${msg}`);
            }
        }

        throw new Error(`All AI providers failed. Errors: ${errors.join('; ')}`);
    }

    /**
     * Check which providers have API keys configured
     */
    getProviderStatus(): Record<AIProvider, { available: boolean; model: string }> {
        const providers: AIProvider[] = ['openai', 'anthropic', 'groq', 'together', 'huggingface', 'ollama'];
        const status: Record<string, { available: boolean; model: string }> = {};

        const envKeys: Record<AIProvider, string> = {
            openai: 'OPENAI_API_KEY',
            anthropic: 'ANTHROPIC_API_KEY',
            groq: 'GROQ_API_KEY',
            together: 'TOGETHER_API_KEY',
            huggingface: 'HUGGINGFACE_API_KEY',
            ollama: 'OLLAMA_URL',
        };

        for (const provider of providers) {
            status[provider] = {
                // Ollama runs locally and doesn't require an API key
                available: provider === 'ollama' || !!process.env[envKeys[provider]],
                model: DEFAULT_MODELS[provider],
            };
        }

        return status as Record<AIProvider, { available: boolean; model: string }>;
    }

    /**
     * Try to answer using Knowledge Ocean
     * Returns null if not found
     */
    private async tryKnowledgeOcean(message: string, agent: string): Promise<string | null> {
        try {
            // Dynamic import to avoid circular dependencies
            const { knowledgeOcean } = await import('./knowledge-ocean');
            return knowledgeOcean.tryAnswer(message, agent);
        } catch (error) {
            // Knowledge Ocean not available, continue to external AI
            return null;
        }
    }

    /**
     * Build messages array with system prompt and history
     */
    private buildMessages(
        message: string,
        agent: string,
        conversationId?: string
    ): AIMessage[] {
        const messages: AIMessage[] = [];

        // Add system prompt for agent
        const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS.ELARA;
        messages.push({ role: 'system', content: systemPrompt });

        // Add conversation history if exists
        if (conversationId && this.conversationHistory.has(conversationId)) {
            const history = this.conversationHistory.get(conversationId)!;
            messages.push(...history);
        }

        // Add current message
        messages.push({ role: 'user', content: message });

        return messages;
    }

    /**
     * Call the configured AI provider
     */
    private async callProvider(messages: AIMessage[]): Promise<AIResponse> {
        const { provider } = this.config;

        switch (provider) {
            case 'openai':
                return this.callOpenAI(messages);
            case 'anthropic':
                return this.callAnthropic(messages);
            case 'groq':
                return this.callGroq(messages);
            case 'together':
                return this.callTogether(messages);
            case 'huggingface':
                return this.callHuggingFace(messages);
            case 'ollama':
                return this.callOllama(messages);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }

    /**
     * OpenAI API call
     */
    private async callOpenAI(messages: AIMessage[]): Promise<AIResponse> {
        const model = this.config.model || DEFAULT_MODELS.openai;
        const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('OpenAI API key required. Add your key in settings.');
        }

        const response = await fetch(PROVIDER_ENDPOINTS.openai, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            content: data.choices[0].message.content,
            model,
            provider: 'openai',
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
            },
        };
    }

    /**
     * Anthropic API call
     */
    private async callAnthropic(messages: AIMessage[]): Promise<AIResponse> {
        const model = this.config.model || DEFAULT_MODELS.anthropic;
        const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            throw new Error('Anthropic API key required. Add your key in settings.');
        }

        // Anthropic requires system message separate
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const conversationMessages = messages.filter(m => m.role !== 'system');

        const response = await fetch(PROVIDER_ENDPOINTS.anthropic, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model,
                system: systemMessage,
                messages: conversationMessages,
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
            }),
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            content: data.content[0].text,
            model,
            provider: 'anthropic',
            usage: {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens,
            },
        };
    }

    /**
     * Groq API call (FREE - recommended default)
     */
    private async callGroq(messages: AIMessage[]): Promise<AIResponse> {
        const model = this.config.model || DEFAULT_MODELS.groq;
        const apiKey = this.config.apiKey || process.env.GROQ_API_KEY;

        if (!apiKey) {
            throw new Error('Groq API key required. Get free key at https://console.groq.com');
        }

        const response = await fetch(PROVIDER_ENDPOINTS.groq, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            content: data.choices[0].message.content,
            model,
            provider: 'groq',
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
            },
        };
    }

    /**
     * Together AI call
     */
    private async callTogether(messages: AIMessage[]): Promise<AIResponse> {
        const model = this.config.model || DEFAULT_MODELS.together;
        const apiKey = this.config.apiKey || process.env.TOGETHER_API_KEY;

        if (!apiKey) {
            throw new Error('Together AI API key required. Get free credits at https://together.ai');
        }

        const response = await fetch(PROVIDER_ENDPOINTS.together, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new Error(`Together AI error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            content: data.choices[0].message.content,
            model,
            provider: 'together',
        };
    }

    /**
     * Hugging Face API call
     */
    private async callHuggingFace(messages: AIMessage[]): Promise<AIResponse> {
        const model = this.config.model || DEFAULT_MODELS.huggingface;
        const apiKey = this.config.apiKey || process.env.HUGGINGFACE_API_KEY;

        if (!apiKey) {
            throw new Error('Hugging Face API key required. Get free key at https://huggingface.co');
        }

        // Combine messages into single prompt
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

        const response = await fetch(`${PROVIDER_ENDPOINTS.huggingface}/${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    temperature: this.config.temperature,
                    max_new_tokens: this.config.maxTokens,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            content: data[0].generated_text,
            model,
            provider: 'huggingface',
        };
    }

    /**
     * Ollama local API call (FREE, runs locally)
     */
    private async callOllama(messages: AIMessage[]): Promise<AIResponse> {
        const model = this.config.model || DEFAULT_MODELS.ollama;
        const baseURL = this.config.baseURL || PROVIDER_ENDPOINTS.ollama;

        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}. Make sure Ollama is running locally.`);
        }

        const data = await response.json();

        return {
            content: data.message.content,
            model,
            provider: 'ollama',
        };
    }

    /**
     * Add message to conversation history
     */
    private addToHistory(conversationId: string, message: AIMessage): void {
        if (!this.conversationHistory.has(conversationId)) {
            this.conversationHistory.set(conversationId, []);
        }

        const history = this.conversationHistory.get(conversationId)!;
        history.push(message);

        // Keep only last 20 messages to avoid context overflow
        if (history.length > 20) {
            this.conversationHistory.set(conversationId, history.slice(-20));
        }
    }

    /**
     * Clear conversation history
     */
    clearHistory(conversationId: string): void {
        this.conversationHistory.delete(conversationId);
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<AIConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Set user API key for provider
     */
    setApiKey(provider: AIProvider, apiKey: string): void {
        this.config.provider = provider;
        this.config.apiKey = apiKey;
    }
}

/**
 * Create AI router instance
 */
export function createAIRouter(config?: Partial<AIConfig>): MultiModelAIRouter {
    return new MultiModelAIRouter(config);
}

/**
 * Default AI router (Groq - free and fast)
 */
export const aiRouter = createAIRouter({
    provider: 'groq',
});

export default aiRouter;
