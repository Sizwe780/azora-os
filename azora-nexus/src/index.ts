import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDB } from '@/config/database';
import { setupSwagger } from '@/config/swagger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { metricsMiddleware } from '@/middleware/metrics';
import { authMiddleware } from '@/middleware/auth';
import recommendationRoutes from '@/routes/recommendations';
import neuralRoutes from '@/routes/neural';
import insightRoutes from '@/routes/insights';
import analysisRoutes from '@/routes/analysis';
import { logger } from '@/utils/logger';
import { startMetricsServer } from '@/utils/metrics';

// Import new agent components (temporarily disabled for initial setup)
// import { initializeTools } from '../../../../genome/agent-tools/services';
// import { autonomousCore } from '../../../../genome/agent-tools/autonomous-core';
// import { constitutionalGovernor } from '../../../../genome/agent-tools/constitutional-governor';
// import { memorySystem } from '../../../../genome/agent-tools/memory-system';

// Placeholder agent components for initial setup
const autonomousCore = {
  getState: () => ({ status: 'initializing', id: 'placeholder' }),
  getMetrics: () => ({ tasksCompleted: 0, tasksFailed: 0, averageResponseTime: 0, lastActivity: new Date() }),
  addPerception: (perception: any) => {},
  start: async () => {},
  forceExecuteTask: async (task: any) => {},
};

const constitutionalGovernor = {
  getConstitutionSummary: () => ({ total: 0, byCategory: {} }),
};

const memorySystem = {
  getMemoryStats: async () => ({ shortTerm: { keys: 0 }, longTerm: { episodic: 0, semantic: 0, procedural: 0 } }),
};

const app = express();
const PORT = process.env.PORT || 3006;

// Connect to MongoDB
connectDB();

// Initialize agent tools and systems (temporarily disabled)
// initializeTools();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging and metrics
app.use(requestLogger);
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'azora-nexus',
    version: '1.0.0',
    agent: {
      status: autonomousCore.getState().status,
      tasksCompleted: autonomousCore.getMetrics().tasksCompleted,
      constitution: constitutionalGovernor.getConstitutionSummary(),
    }
  });
});

// Agent-specific endpoints
app.post('/api/agent/interact', authMiddleware, async (req, res) => {
  try {
    const { message, userId, context } = req.body;

    // Add user input to agent's perception queue
    autonomousCore.addPerception({
      type: 'user_input',
      source: 'api',
      content: message,
      context: { userId, ...context },
      timestamp: new Date(),
      priority: 'medium',
    });

    res.json({
      status: 'received',
      message: 'Agent is processing your request',
      agentState: autonomousCore.getState().status,
    });

  } catch (error: any) {
    logger.error('Agent interaction error', { error: error.message });
    res.status(500).json({ error: 'Agent interaction failed' });
  }
});

app.get('/api/agent/status', authMiddleware, (req, res) => {
  res.json({
    agent: autonomousCore.getState(),
    metrics: autonomousCore.getMetrics(),
    constitution: constitutionalGovernor.getConstitutionSummary(),
    memory: memorySystem.getMemoryStats(),
  });
});

app.post('/api/agent/task', authMiddleware, async (req, res) => {
  try {
    const { type, description, parameters, priority = 'medium' } = req.body;

    const task = {
      id: `manual-task-${Date.now()}`,
      type,
      priority,
      description,
      parameters,
      userId: (req as any).user?.id || 'system',
      context: req.body.context,
      createdAt: new Date(),
      status: 'pending',
      progress: 0,
      steps: [],
    };

    await autonomousCore.forceExecuteTask(task);

    res.json({
      status: 'executed',
      taskId: task.id,
      finalStatus: task.status,
    });

  } catch (error: any) {
    logger.error('Manual task execution error', { error: error.message });
    res.status(500).json({ error: 'Task execution failed' });
  }
});

// API routes
app.use('/api/recommendations', authMiddleware, recommendationRoutes);
app.use('/api/neural', authMiddleware, neuralRoutes);
app.use('/api/insights', authMiddleware, insightRoutes);
app.use('/api/analysis', authMiddleware, analysisRoutes);

// Swagger documentation
setupSwagger(app);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start metrics server
startMetricsServer();

// Start autonomous agent
autonomousCore.start().catch(error => {
  logger.error('Failed to start autonomous core', { error: error.message });
});

app.listen(PORT, () => {
  logger.info(`Azora Nexus Autonomous Agent running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`Agent interaction available at http://localhost:${PORT}/api/agent/interact`);
  logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;