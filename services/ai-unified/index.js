// services/ai-unified/index.js
// Unified AI Service for Azora OS
// Integrates multiple AI models: Local Quantum Deep Mind, OpenAI, Anthropic, and open-source alternatives

import express from 'express';
import cors from 'cors';
import { AIModelRegistry } from './AIModelRegistry.js';
import { AITaskRouter } from './AITaskRouter.js';
import { AIExecutor } from './AIExecutor.js';

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// ============================================================================
// AI MODEL REGISTRY
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

export { registry, router, executor, app };