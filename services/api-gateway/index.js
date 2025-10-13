const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
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

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      logger.warn('Invalid token', { error: err.message, token: token.substring(0, 10) + '...' });
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Service registry - maps service names to their ports
const serviceRegistry = {
  'auth': 'http://localhost:4004',
  'ai-orchestrator': 'http://localhost:4001',
  'neural-context': 'http://localhost:4005',
  'retail-partner': 'http://localhost:4006',
  'cold-chain': 'http://localhost:4007',
  'universal-safety': 'http://localhost:4008',
  'autonomous-ops': 'http://localhost:4009',
  'quantum-tracking': 'http://localhost:4010',
  'quantum-deep-mind': 'http://localhost:4011',
  'ai-evolution': 'http://localhost:4012',
  'onboarding': 'http://localhost:4013',
  'compliance': 'http://localhost:4014',
  'maintenance': 'http://localhost:4015',
  'driver-behavior': 'http://localhost:4016',
  'analytics': 'http://localhost:4017',
  'document-verification': 'http://localhost:4018',
  'advanced-compliance': 'http://localhost:4019',
  'admin-portal': 'http://localhost:4020',
  'employee-onboarding': 'http://localhost:4021',
  'document-vault': 'http://localhost:4022',
  'traffic-routing': 'http://localhost:4023',
  'ai-trip-planning': 'http://localhost:4024',
  'accessibility': 'http://localhost:4025',
  'hr-ai-deputy': 'http://localhost:4026',
  'klipp': 'http://localhost:4002'
};

// Create proxy middleware for each service
Object.entries(serviceRegistry).forEach(([serviceName, targetUrl]) => {
  app.use(`/api/${serviceName}`, createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${serviceName}`]: ''
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add user context to proxied requests
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
        proxyReq.setHeader('X-Tenant', req.user.tenant);
      }
    },
    onError: (err, req, res) => {
      logger.error('Proxy error', {
        service: serviceName,
        error: err.message,
        url: req.url
      });
      res.status(502).json({ error: `Service ${serviceName} is unavailable` });
    }
  }));
});

// Protected routes that require authentication
app.use('/api/protected/*', authenticateToken);

// Main backend API proxy (GraphQL, etc.)
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    if (req.user) {
      proxyReq.setHeader('X-User-ID', req.user.id);
      proxyReq.setHeader('X-User-Role', req.user.role);
      proxyReq.setHeader('X-Tenant', req.user.tenant);
    }
  },
  onError: (err, req, res) => {
    logger.error('Backend proxy error', { error: err.message, url: req.url });
    res.status(502).json({ error: 'Backend service is unavailable' });
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  console.log(`🚀 API Gateway listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});