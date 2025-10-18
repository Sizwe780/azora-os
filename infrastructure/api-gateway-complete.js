/**
 * Azora OS - Complete API Gateway
 * Unified entry point for all services with intelligent routing
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'azora-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Service Routes with Proxying
const services = {
  auth: { target: 'http://localhost:4004', prefix: '/api/auth' },
  ai: { target: 'http://localhost:4001', prefix: '/api/ai' },
  onboarding: { target: 'http://localhost:4070', prefix: '/api/onboarding' },
  compliance: { target: 'http://localhost:4081', prefix: '/api/compliance' },
  hr: { target: 'http://localhost:4091', prefix: '/api/hr' },
  coin: { target: 'http://localhost:4092', prefix: '/api/coin' },
  conversation: { target: 'http://localhost:4011', prefix: '/api/conversation' },
  security: { target: 'http://localhost:4022', prefix: '/api/security' },
  documents: { target: 'http://localhost:4087', prefix: '/api/documents' },
  analytics: { target: 'http://localhost:4080', prefix: '/api/analytics' },
};

// Create proxies for each service
Object.entries(services).forEach(([name, config]) => {
  app.use(
    config.prefix,
    createProxyMiddleware({
      target: config.target,
      changeOrigin: true,
      pathRewrite: (path) => path.replace(config.prefix, ''),
      onError: (err, req, res) => {
        console.error(`Proxy error for ${name}:`, err.message);
        res.status(503).json({
          error: 'Service temporarily unavailable',
          service: name,
        });
      },
    })
  );
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    gateway: 'Azora OS API Gateway',
    services: Object.keys(services),
  });
});

// Unified student earnings endpoint (Azora Learn integration)
app.post('/api/v1/students/earn', authenticateToken, async (req, res) => {
  const { activity, metadata } = req.body;
  const userId = req.user.id;
  
  const rewards = {
    'signup': 50,
    'first_tutorial': 50,
    'code_completion': 5,
    'git_commit': 5,
    'code_review': 10,
    'bounty_complete': 500,
    'course_complete': 200,
    'project_deploy': 1000,
  };
  
  const azrAmount = rewards[activity] || 0;
  
  if (azrAmount > 0) {
    // Mint AZR coins for the student
    try {
      await axios.post('http://localhost:4092/api/propose-mint', {
        recipient: userId,
        amount: azrAmount,
        complianceRecord: {
          activity,
          userId,
          timestamp: new Date().toISOString(),
          metadata,
        },
      });
      
      res.json({
        success: true,
        activity,
        azr_earned: azrAmount,
        message: `You earned ${azrAmount} AZR!`,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process reward' });
    }
  } else {
    res.status(400).json({ error: 'Invalid activity' });
  }
});

// Start server
const PORT = process.env.API_GATEWAY_PORT || 4000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🌐 AZORA OS - API GATEWAY                            ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Port: ${PORT}`);
  console.log(`Services: ${Object.keys(services).length}`);
  console.log('');
  console.log('Routing:');
  Object.entries(services).forEach(([name, config]) => {
    console.log(`  ${config.prefix} → ${config.target}`);
  });
  console.log('');
});

module.exports = app;
