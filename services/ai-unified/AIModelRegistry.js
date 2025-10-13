export class AIModelRegistry {
  constructor() {
    this.models = new Map();
    this.registerModels();
  }

  registerModels() {
    // Local Quantum Deep Mind
    this.models.set('quantum-deep-mind', {
      type: 'local',
      endpoint: 'http://localhost:4050',
      capabilities: ['text-generation', 'analysis', 'prediction'],
      cost: 0,
      latency: 'low'
    });

    // OpenAI Models
    this.models.set('gpt-4', {
      type: 'api',
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      capabilities: ['text-generation', 'analysis', 'code', 'creative'],
      cost: 'high',
      latency: 'medium'
    });

    this.models.set('gpt-3.5-turbo', {
      type: 'api',
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      capabilities: ['text-generation', 'analysis', 'chat'],
      cost: 'medium',
      latency: 'low'
    });

    // Anthropic Models
    this.models.set('claude-3-opus', {
      type: 'api',
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      capabilities: ['text-generation', 'analysis', 'creative', 'long-context'],
      cost: 'high',
      latency: 'medium'
    });

    this.models.set('claude-3-sonnet', {
      type: 'api',
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      capabilities: ['text-generation', 'analysis', 'balanced'],
      cost: 'medium',
      latency: 'low'
    });

    // Open-source alternatives (simulated for now)
    this.models.set('llama-2-70b', {
      type: 'local-simulated',
      capabilities: ['text-generation', 'analysis'],
      cost: 0,
      latency: 'medium'
    });

    this.models.set('mistral-7b', {
      type: 'local-simulated',
      capabilities: ['text-generation', 'code', 'analysis'],
      cost: 0,
      latency: 'low'
    });
  }

  getModel(modelId) {
    return this.models.get(modelId);
  }

  getModelsByCapability(capability) {
    return Array.from(this.models.entries())
      .filter(([ , model]) => model.capabilities.includes(capability))
      .map(([id, model]) => ({ id, ...model }));
  }

  getBestModelForTask(task, preferences = {}) {
    const { maxCost = 'high', preferredLatency = 'any' } = preferences;

    const candidates = this.getModelsByCapability(task);

    // Filter by cost
    const costPriority = { low: 0, medium: 1, high: 2 };
    const filtered = candidates.filter(model => costPriority[model.cost] <= costPriority[maxCost]);

    // Sort by latency preference
    const latencyPriority = { low: 0, medium: 1, high: 2 };
    filtered.sort((a, b) => {
      if (preferredLatency !== 'any') {
        return latencyPriority[a.latency] - latencyPriority[b.latency];
      }
      // Default: prefer local models first, then by cost
      if (a.type === 'local' && b.type !== 'local') return -1;
      if (b.type === 'local' && a.type !== 'local') return 1;
      return costPriority[a.cost] - costPriority[b.cost];
    });

    return filtered[0];
  }
}