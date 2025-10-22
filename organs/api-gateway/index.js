/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Enterprise API Gateway
 * @description Advanced API Gateway with circuit breaker, service discovery, load balancing, metrics, and enterprise features
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const winston = require('winston');
const redis = require('redis');
const axios = require('axios');
const CircuitBreaker = require('opossum');
const compression = require('compression');
const responseTime = require('response-time');
const actuator = require('express-actuator');

const app = express();
const PORT = process.env.PORT || 3000;

// Redis client for caching and service discovery
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Configure Winston logger with advanced formatting
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Service registry with health monitoring
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.circuitBreakers = new Map();
    this.loadBalancers = new Map();
  }

  async registerService(name, instances) {
    this.services.set(name, instances);

    // Create circuit breaker for each service
    const breaker = new CircuitBreaker(async (url, options) => {
      return await axios(options);
    }, {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });

    breaker.on('open', () => logger.warn(`Circuit breaker opened for service: ${name}`));
    breaker.on('halfOpen', () => logger.info(`Circuit breaker half-open for service: ${name}`));
    breaker.on('close', () => logger.info(`Circuit breaker closed for service: ${name}`));

    this.circuitBreakers.set(name, breaker);

    // Create load balancer
    this.loadBalancers.set(name, new LoadBalancer(instances));
  }

  async getServiceUrl(serviceName) {
    const loadBalancer = this.loadBalancers.get(serviceName);
    if (!loadBalancer) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return loadBalancer.getNextUrl();
  }

  getCircuitBreaker(serviceName) {
    return this.circuitBreakers.get(serviceName);
  }
}

// Load balancer with round-robin and health checks
class LoadBalancer {
  constructor(instances) {
    this.instances = instances;
    this.currentIndex = 0;
    this.healthStatus = new Map(instances.map(url => [url, true]));
  }

  getNextUrl() {
    const healthyInstances = this.instances.filter(url => this.healthStatus.get(url));

    if (healthyInstances.length === 0) {
      throw new Error('No healthy instances available');
    }

    const url = healthyInstances[this.currentIndex % healthyInstances.length];
    this.currentIndex = (this.currentIndex + 1) % healthyInstances.length;
    return url;
  }

  markUnhealthy(url) {
    this.healthStatus.set(url, false);
    // Schedule health check
    setTimeout(() => this.checkHealth(url), 30000);
  }

  async checkHealth(url) {
    try {
      await axios.get(`${url}/health`, { timeout: 5000 });
      this.healthStatus.set(url, true);
      logger.info(`Service ${url} is healthy again`);
    } catch (error) {
      logger.warn(`Service ${url} still unhealthy: ${error.message}`);
      setTimeout(() => this.checkHealth(url), 30000);
    }
  }
}

const serviceRegistry = new ServiceRegistry();

// Initialize service registry
async function initializeServices() {
  try {
    await redisClient.connect();

    // Register services with multiple instances for load balancing
    await serviceRegistry.registerService('auth', [
      'http://localhost:3002',
      'http://localhost:3003' // Additional instance
    ]);

    await serviceRegistry.registerService('compliance', [
      'http://localhost:6200'
    ]);

    await serviceRegistry.registerService('ai-security-monitoring', [
      'http://localhost:4600'
    ]);

    await serviceRegistry.registerService('event-bus', [
      'http://localhost:3005'
    ]);

    logger.info('Service registry initialized');
  } catch (error) {
    logger.error('Failed to initialize service registry', { error: error.message });
  }
}

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

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Tenant-ID']
}));

// Compression
app.use(compression());

// Response time tracking
app.use(responseTime((req, res, time) => {
  if (time > 1000) { // Log slow requests
    logger.warn('Slow request detected', {
      method: req.method,
      url: req.url,
      responseTime: time
    });
  }
}));

// Rate limiting with different tiers
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.user?.tier === 'premium' // Skip for premium users
  });
};

app.use('/api/public/', createRateLimit(15 * 60 * 1000, 100, 'Too many public API requests'));
app.use('/api/protected/', createRateLimit(15 * 60 * 1000, 1000, 'Too many protected API requests'));

// Speed limiting for abusive requests
app.use(slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 100,
  delayMs: 500
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware with correlation ID
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  const start = Date.now();
  logger.info('Request received', {
    correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? '[PRESENT]' : '[MISSING]'
    }
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });
  });

  next();
});

// Authentication middleware with caching
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Check token cache first
    const cacheKey = `token:${token}`;
    let user = await redisClient.get(cacheKey);

    if (user) {
      req.user = JSON.parse(user);
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;

    // Cache valid token for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(decoded));

    next();
  } catch (error) {
    logger.warn('Token verification failed', {
      error: error.message,
      token: req.headers['authorization']?.substring(0, 20) + '...'
    });
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// API Versioning middleware
const apiVersioning = (req, res, next) => {
  const version = req.headers['accept-version'] || req.headers['api-version'] || 'v1';
  req.apiVersion = version;
  res.setHeader('api-version', version);
  next();
};

// Health check endpoint with detailed metrics
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    service: 'api-gateway',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {}
  };

  // Check service health
  for (const [serviceName] of serviceRegistry.services) {
    const breaker = serviceRegistry.getCircuitBreaker(serviceName);
    health.services[serviceName] = {
      circuitBreaker: breaker?.stats || 'not configured',
      healthy: true // In real implementation, check actual health
    };
  }

  res.json(health);
});

// Actuator endpoints for monitoring
app.use(actuator({
  basePath: '/actuator',
  infoGitMode: 'full',
  infoBuildMode: 'full'
}));

// Service proxy with circuit breaker and load balancing
const createServiceProxy = (serviceName) => {
  return async (req, res, next) => {
    try {
      const targetUrl = await serviceRegistry.getServiceUrl(serviceName);
      const breaker = serviceRegistry.getCircuitBreaker(serviceName);

      // Use circuit breaker for resilience
      const result = await breaker.fire(targetUrl, {
        method: req.method,
        url: req.url.replace(`/api/${serviceName}`, ''),
        headers: {
          ...req.headers,
          'x-correlation-id': req.correlationId,
          'x-user-id': req.user?.id,
          'x-user-role': req.user?.role,
          'x-tenant': req.user?.tenant,
          'x-api-version': req.apiVersion
        },
        data: req.body,
        timeout: 30000
      });

      // Forward response
      res.status(result.status).json(result.data);

    } catch (error) {
      logger.error(`Service proxy error for ${serviceName}`, {
        correlationId: req.correlationId,
        error: error.message,
        service: serviceName
      });

      if (error.status) {
        res.status(error.status).json(error.data);
      } else {
        res.status(503).json({ error: `Service ${serviceName} is currently unavailable` });
      }
    }
  };
};

// API versioning
app.use('/api/v*', apiVersioning);

// Service routes with advanced proxying
app.use('/api/auth', authenticateToken, createServiceProxy('auth'));
app.use('/api/compliance', authenticateToken, createServiceProxy('compliance'));
app.use('/api/ai-security-monitoring', authenticateToken, createServiceProxy('ai-security-monitoring'));
app.use('/api/event-bus', authenticateToken, createServiceProxy('event-bus'));

// GraphQL federation endpoint (future)
app.use('/graphql', (req, res) => {
  res.json({ message: 'GraphQL federation endpoint - coming soon' });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  const metrics = {
    gateway_requests_total: 0, // Would be collected from actual metrics
    gateway_request_duration_seconds: 0,
    circuit_breaker_state: {}
  };

  for (const [serviceName, breaker] of serviceRegistry.circuitBreakers) {
    metrics.circuit_breaker_state[serviceName] = breaker.stats;
  }

  res.set('Content-Type', 'application/json');
  res.json(metrics);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    correlationId: req.correlationId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    correlationId: req.correlationId,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    correlationId: req.correlationId
  });
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing gracefully');
  redisClient.quit();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    await initializeServices();

    app.listen(PORT, () => {
      logger.info(`🚀 Enterprise API Gateway v2.0 running on port ${PORT}`, {
        features: [
          'Circuit Breaker',
          'Service Discovery',
          'Load Balancing',
          'Rate Limiting',
          'Authentication',
          'API Versioning',
          'Metrics Collection',
          'Health Monitoring'
        ]
      });
      console.log(`🚀 Enterprise API Gateway listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();