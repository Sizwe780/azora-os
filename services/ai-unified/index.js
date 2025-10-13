// services/ai-unified/index.js
// Unified AI Service for Azora OS
// Integrates multiple AI models: Local Quantum Deep Mind, OpenAI, Anthropic, and open-source alternatives

// @ts-check
/**
 * @fileoverview Set sourceType: module for ES imports
 */
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// ============================================================================
// AI MODEL REGISTRY
// ============================================================================

class AIModelRegistry {
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

// ============================================================================
// AI TASK ROUTER
// ============================================================================

class AITaskRouter {
  constructor(registry) {
    this.registry = registry;
    this.taskMappings = {
      'text-generation': ['quantum-deep-mind', 'gpt-4', 'claude-3-opus', 'llama-2-70b'],
      'analysis': ['quantum-deep-mind', 'gpt-4', 'claude-3-sonnet', 'mistral-7b'],
      'code': ['gpt-4', 'claude-3-opus', 'mistral-7b'],
      'creative': ['claude-3-opus', 'gpt-4', 'quantum-deep-mind'],
      'prediction': ['quantum-deep-mind', 'gpt-3.5-turbo'],
      'chat': ['gpt-3.5-turbo', 'claude-3-sonnet', 'quantum-deep-mind'],
      'compliance': ['quantum-deep-mind', 'gpt-4', 'claude-3-sonnet'],
      'translation': ['claude-3-opus', 'gpt-4', 'mistral-7b'],
      'summarization': ['quantum-deep-mind', 'gpt-3.5-turbo', 'claude-3-sonnet']
    };
  }

  routeTask(task, content, options = {}) {
    const { model, maxCost, preferredLatency } = options;

    let selectedModel;

    if (model && this.registry.getModel(model)) {
      selectedModel = this.registry.getModel(model);
    } else {
      selectedModel = this.registry.getBestModelForTask(task, { maxCost, preferredLatency });
    }

    if (!selectedModel) {
      throw new Error(`No suitable model found for task: ${task}`);
    }

    return {
      modelId: selectedModel.id || model,
      model: selectedModel,
      task,
      content,
      options
    };
  }
}

// ============================================================================
// AI EXECUTOR
// ============================================================================

class AIExecutor {
  constructor(registry) {
    this.registry = registry;
  }

  async execute(taskConfig) {
    const { modelId, model, task, content, options } = taskConfig;

    console.log(`🤖 Executing ${task} with model ${modelId}`);

    switch (model.type) {
      case 'local':
        return await this.executeLocal(model, content, options);

      case 'api':
        return await this.executeAPI(model, content, options);

      case 'local-simulated':
        return await this.executeSimulated(model, content, options);

      default:
        throw new Error(`Unsupported model type: ${model.type}`);
    }
  }

  async executeLocal(model, content, options) {
    try {
      const response = await fetch(`${model.endpoint}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
          maxLength: options.maxLength || 100,
          temperature: options.temperature || 0.7,
          creativity: options.creativity || 0.5
        })
      });

      const result = await response.json();
      return {
        success: true,
        model: model.id,
        response: result.response,
        confidence: result.confidence,
        metadata: {
          tokens: result.tokens_generated,
          quantum_state: result.quantum_state
        }
      };
    } catch (error) {
      console.error('Local AI execution error:', error);
      throw error;
    }
  }

  async executeAPI(model, content, options) {
    try {
      let response;

      if (model.provider === 'openai') {
        response = await this.callOpenAI(model, content, options);
      } else if (model.provider === 'anthropic') {
        response = await this.callAnthropic(model, content, options);
      } else {
        throw new Error(`Unsupported API provider: ${model.provider}`);
      }

      return {
        success: true,
        model: model.id,
        response: response.content,
        metadata: response.metadata
      };
    } catch (error) {
      console.error('API AI execution error:', error);
      throw error;
    }
  }

  async callOpenAI(model, content, options) {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: model.apiKey });

    const completion = await client.chat.completions.create({
      model: model.id,
      messages: [{ role: 'user', content }],
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7
    });

    return {
      content: completion.choices[0].message.content,
      metadata: {
        tokens: completion.usage.total_tokens,
        model: completion.model
      }
    };
  }

  async callAnthropic(model, content, options) {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: model.apiKey });

    const message = await client.messages.create({
      model: model.id,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      messages: [{ role: 'user', content }]
    });

    return {
      content: message.content[0].text,
      metadata: {
        tokens: message.usage.input_tokens + message.usage.output_tokens,
        model: message.model
      }
    };
  }

  async executeSimulated(model, content, _options) {
    // Simulate open-source model responses
    const responses = {
      'llama-2-70b': `Based on advanced analysis of "${content.substring(0, 50)}...", I recommend optimizing the system's neural pathways for better efficiency.`,
      'mistral-7b': `Processing query: ${content.substring(0, 30)}... The optimal solution involves quantum-enhanced algorithms with 94.7% confidence.`
    };

    return {
      success: true,
      model: model.id,
      response: responses[model.id] || `AI analysis complete for: ${content.substring(0, 50)}...`,
      confidence: 0.85,
      metadata: {
        simulated: true,
        tokens: Math.floor(content.length / 4)
      }
    };
  }
}

// ============================================================================
// UNIFIED AI SERVICE
// ============================================================================

const registry = new AIModelRegistry();
const router = new AITaskRouter(registry);
const executor = new AIExecutor(registry);

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'ai-unified',
    status: 'healthy',
    models: registry.models.size,
    timestamp: new Date().toISOString()
  });
});

// List available models
app.get('/models', (req, res) => {
  const models = Array.from(registry.models.entries()).map(([id, model]) => ({
    id,
    ...model
  }));
  res.json({ models });
});

// Get models by capability
app.get('/models/capability/:capability', (req, res) => {
  const { capability } = req.params;
  const models = registry.getModelsByCapability(capability);
  res.json({ models });
});

// Execute AI task
app.post('/execute', async (req, res) => {
  try {
    const { task, content, model, options = {} } = req.body;

    if (!task || !content) {
      return res.status(400).json({ error: 'Task and content are required' });
    }

    const taskConfig = router.routeTask(task, content, { model, ...options });
    const result = await executor.execute(taskConfig);

    res.json({
      success: true,
      task,
      ...result,
      routing: {
        selectedModel: taskConfig.modelId,
        reason: model ? 'user-specified' : 'auto-selected'
      }
    });
  } catch (error) {
    console.error('AI execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch execution
app.post('/batch', async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks must be an array' });
    }

    const results = await Promise.all(
      tasks.map(async (taskConfig) => {
        try {
          const routed = router.routeTask(taskConfig.task, taskConfig.content, taskConfig.options || {});
          const result = await executor.execute(routed);
          return { success: true, ...result };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })
    );

    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Batch execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI analytics endpoint
app.post('/analytics', async (req, res) => {
  try {
    const { data, type } = req.body;

    const analysis = await executor.execute(
      router.routeTask('analysis', `Analyze this ${type} data: ${JSON.stringify(data)}`)
    );

    res.json({
      success: true,
      analysis: analysis.response,
      model: analysis.model,
      confidence: analysis.confidence
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`🤖 Unified AI Service online on port ${PORT}`);
  console.log(`📚 Models registered: ${registry.models.size}`);
  console.log(`🎯 Capabilities: text-generation, analysis, code, creative, prediction, chat`);
  console.log(`⚡ Ready to power Azora OS intelligence`);
});

module.exports = { registry, router, executor, app };