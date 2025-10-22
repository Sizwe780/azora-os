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

// Import new agent components
import { azoraNexusAgent } from '@genome/agent-tools';

const app = express();
const PORT = process.env.PORT || 3006;

// Connect to MongoDB
connectDB();

// Initialize agent tools and systems
// initializeTools();

// Initialize the Azora Nexus Agent
azoraNexusAgent.initialize().catch(error => {
  logger.error('Failed to initialize Azora Nexus Agent', { error: error.message });
});

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
  const status = azoraNexusAgent.getStatus();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'azora-nexus',
    version: '1.0.0',
    agent: {
      status: status.agentState.status,
      tasksCompleted: status.metrics.tasksCompleted,
      activeUsers: status.activeUsers,
      totalProfiles: status.totalProfiles,
    }
  });
});

// Agent-specific endpoints
app.post('/api/agent/interact', authMiddleware, async (req, res) => {
  try {
    const { message, userId, context } = req.body;

    // Process user input through the agent
    const result = await azoraNexusAgent.processUserInput(
      message,
      userId || (req as any).user?.id,
      undefined,
      context
    );

    res.json(result);

  } catch (error: any) {
    logger.error('Agent interaction error', { error: error.message });
    res.status(500).json({ error: 'Agent interaction failed' });
  }
});

app.get('/api/agent/status', authMiddleware, (req, res) => {
  const status = azoraNexusAgent.getStatus();
  res.json(status);
});

app.post('/api/agent/task', authMiddleware, async (req, res) => {
  try {
    const { capability, parameters, userId, sessionId } = req.body;

    // Execute capability directly
    const result = await azoraNexusAgent.executeCapability(
      capability,
      parameters,
      userId || (req as any).user?.id,
      sessionId || `session-${Date.now()}`
    );

    res.json({
      status: 'executed',
      result,
    });

  } catch (error: any) {
    logger.error('Capability execution error', { error: error.message });
    res.status(500).json({ error: 'Capability execution failed' });
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
azoraNexusAgent.start().catch(error => {
  logger.error('Failed to start Azora Nexus Agent', { error: error.message });
});

app.listen(PORT, () => {
  logger.info(`Azora Nexus Autonomous Agent running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  logger.info(`Agent interaction available at http://localhost:${PORT}/api/agent/interact`);
  logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;