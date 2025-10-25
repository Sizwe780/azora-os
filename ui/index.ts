/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createClient as createRedisClient } from 'redis';
import mongoose from 'mongoose';
import winston from 'winston';
import promClient from 'prom-client';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import routes
import creditRoutes from './routes/credit.js';
import stakingRoutes from './routes/staking.js';
import defiRoutes from './routes/defi.js';
import liquidityRoutes from './routes/liquidity.js';
import paymentRoutes from './routes/payment.js';

// Import services
import { CreditService } from './services/CreditService.js';
import { StakingService } from './services/StakingService.js';
import { DefiService } from './services/DefiService.js';
import { LiquidityService } from './services/LiquidityService';

// Import middleware
import { authenticateToken } from './middleware/auth.js';

// Configuration
const PORT = process.env.PORT || 3005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/azora_mint';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-mint' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware to measure request duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  next();
});

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Azora Mint API',
      version: '1.0.0',
      description: 'AI-Driven Credit Protocol & Economic Engine'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/routes/*.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/credit', authenticateToken, creditRoutes);
app.use('/api/v1/staking', authenticateToken, stakingRoutes);
app.use('/api/v1/defi', authenticateToken, defiRoutes);
app.use('/api/v1/liquidity', authenticateToken, liquidityRoutes);
app.use('/api/v1/payment', authenticateToken, paymentRoutes);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    const mongoHealth = mongoose.connection.readyState === 1;

    res.json({
      service: 'Azora Mint',
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      dependencies: {
        mongodb: mongoHealth ? 'healthy' : 'unhealthy',
        redis: 'checking...' // Would need redis client check
      },
      features: [
        'AI-driven credit scoring',
        'Autonomous collection (20% metabolic tax)',
        'Staking rewards',
        'DeFi yield farming',
        'Liquidity provision',
        'Payment processing'
      ]
    });
  } catch (error) {
    logger.error('Health check failed', { error: (error as Error).message });
    res.status(500).json({
      service: 'Azora Mint',
      status: 'error',
      error: (error as Error).message
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Connect to Redis
    const redisClient = createRedisClient({ url: REDIS_URL });
    await redisClient.connect();
    logger.info('Connected to Redis');

    // Initialize services
    const creditService = new CreditService();
    const stakingService = new StakingService();
    const defiService = new DefiService();
    const liquidityService = new LiquidityService();

    // Start autonomous collection cron job
    creditService.startAutonomousCollection();

    // Start staking reward distribution
    stakingService.startRewardDistribution();

    // Start DeFi yield distribution
    defiService.startYieldDistribution();

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Azora Mint is online on port ${PORT}`);
      console.log(`
� Azora Mint - AI-Driven Credit Protocol
==========================================
Port: ${PORT}
Status: Online
MongoDB: Connected
Redis: Connected

Features:
  ✅ AI-driven credit scoring (5 factors)
  ✅ Autonomous collection (20% metabolic tax)
  ✅ Staking rewards & yield farming
  ✅ DeFi protocols & liquidity provision
  ✅ Payment processing & escrow
  ✅ Trust score calculation & monitoring

🇿🇦 Built for Azora Constitution Article VIII.6
      `);
    });

  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
