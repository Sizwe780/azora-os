const express = require('express');
const cors = require('cors');
const winston = require('winston');
const { createLogger, format, transports } = winston;
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8098;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
fs.mkdir(logsDir, { recursive: true }).catch(console.error);

// Configure Winston logger with multiple transports
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'monitoring' },
  transports: [
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// In-memory metrics storage (in production, use Redis or database)
const metrics = {
  services: new Map(),
  system: {
    startTime: Date.now(),
    requests: 0,
    errors: 0,
    uptime: 0
  },
  alerts: []
};

app.use(cors());
app.use(express.json());

// Middleware to track requests
app.use((req, res, next) => {
  metrics.system.requests++;
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });

  next();
});

// Service registry for health checks
const serviceRegistry = [
  { name: 'auth', url: 'http://localhost:4004/health', port: 4004 },
  { name: 'ai-orchestrator', url: 'http://localhost:4001/health', port: 4001 },
  { name: 'neural-context', url: 'http://localhost:4005/health', port: 4005 },
  { name: 'retail-partner', url: 'http://localhost:4006/health', port: 4006 },
  { name: 'cold-chain', url: 'http://localhost:4007/health', port: 4007 },
  { name: 'universal-safety', url: 'http://localhost:4008/health', port: 4008 },
  { name: 'autonomous-ops', url: 'http://localhost:4009/health', port: 4009 },
  { name: 'quantum-tracking', url: 'http://localhost:4010/health', port: 4010 },
  { name: 'quantum-deep-mind', url: 'http://localhost:4011/health', port: 4011 },
  { name: 'ai-evolution', url: 'http://localhost:4012/health', port: 4012 },
  { name: 'onboarding', url: 'http://localhost:4013/health', port: 4013 },
  { name: 'compliance', url: 'http://localhost:4014/health', port: 4014 },
  { name: 'maintenance', url: 'http://localhost:4015/health', port: 4015 },
  { name: 'driver-behavior', url: 'http://localhost:4016/health', port: 4016 },
  { name: 'analytics', url: 'http://localhost:4017/health', port: 4017 },
  { name: 'document-verification', url: 'http://localhost:4018/health', port: 4018 },
  { name: 'advanced-compliance', url: 'http://localhost:4019/health', port: 4019 },
  { name: 'admin-portal', url: 'http://localhost:4020/health', port: 4020 },
  { name: 'employee-onboarding', url: 'http://localhost:4021/health', port: 4021 },
  { name: 'document-vault', url: 'http://localhost:4022/health', port: 4022 },
  { name: 'traffic-routing', url: 'http://localhost:4023/health', port: 4023 },
  { name: 'ai-trip-planning', url: 'http://localhost:4024/health', port: 4024 },
  { name: 'accessibility', url: 'http://localhost:4025/health', port: 4025 },
  { name: 'hr-ai-deputy', url: 'http://localhost:4026/health', port: 4026 },
  { name: 'klipp', url: 'http://localhost:4002/health', port: 4002 },
  { name: 'api-gateway', url: 'http://localhost:3000/health', port: 3000 },
  { name: 'predictive-analytics', url: 'http://localhost:4030/health', port: 4030 }
];

// Health check all services
async function checkServiceHealth(service) {
  try {
    const response = await fetch(service.url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Azora-Monitoring/1.0' }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        name: service.name,
        status: 'healthy',
        port: service.port,
        responseTime: Date.now(),
        details: data
      };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    return {
      name: service.name,
      status: 'unhealthy',
      port: service.port,
      error: error.message,
      lastChecked: Date.now()
    };
  }
}

// System metrics endpoint
app.get('/metrics/system', (req, res) => {
  const systemInfo = {
    uptime: os.uptime(),
    loadAverage: os.loadavg(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpuCount: os.cpus().length,
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    serviceUptime: Date.now() - metrics.system.startTime,
    totalRequests: metrics.system.requests,
    totalErrors: metrics.system.errors
  };

  res.json(systemInfo);
});

// Service health check endpoint
app.get('/health/services', async (req, res) => {
  try {
    const healthChecks = await Promise.allSettled(
      serviceRegistry.map(service => checkServiceHealth(service))
    );

    const results = healthChecks.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: 'unknown',
          status: 'error',
          error: result.reason.message
        };
      }
    });

    // Update metrics
    results.forEach(result => {
      metrics.services.set(result.name, {
        ...result,
        lastChecked: Date.now()
      });
    });

    const summary = {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length,
      timestamp: new Date().toISOString(),
      services: results
    };

    res.json(summary);
  } catch (error) {
    logger.error('Health check error', { error: error.message });
    res.status(500).json({ error: 'Failed to check service health' });
  }
});

// Individual service health
app.get('/health/:service', async (req, res) => {
  const serviceName = req.params.service;
  const service = serviceRegistry.find(s => s.name === serviceName);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  try {
    const result = await checkServiceHealth(service);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Alerts endpoint
app.get('/alerts', (req, res) => {
  const recentAlerts = metrics.alerts.filter(alert =>
    Date.now() - alert.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
  );

  res.json({
    total: recentAlerts.length,
    alerts: recentAlerts.slice(-50) // Last 50 alerts
  });
});

// Log analysis endpoint
app.get('/logs/analysis', async (req, res) => {
  try {
    const logFiles = await fs.readdir(logsDir);
    const analysis = {
      files: logFiles,
      summary: {
        totalErrors: 0,
        totalWarnings: 0,
        mostCommonErrors: {},
        recentActivity: []
      }
    };

    // Simple log analysis (in production, use more sophisticated tools)
    for (const file of logFiles) {
      if (file.endsWith('.log')) {
        try {
          const content = await fs.readFile(path.join(logsDir, file), 'utf8');
          const lines = content.split('\n').filter(line => line.trim());

          lines.forEach(line => {
            if (line.includes('"level":"error"')) analysis.summary.totalErrors++;
            if (line.includes('"level":"warn"')) analysis.summary.totalWarnings++;
          });
        } catch (error) {
          logger.warn('Failed to analyze log file', { file, error: error.message });
        }
      }
    }

    res.json(analysis);
  } catch (error) {
    logger.error('Log analysis error', { error: error.message });
    res.status(500).json({ error: 'Failed to analyze logs' });
  }
});

// Performance metrics endpoint
app.get('/metrics/performance', (req, res) => {
  const performance = {
    services: Array.from(metrics.services.values()),
    system: {
      uptime: os.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      eventLoopLag: 0 // Would need additional monitoring
    },
    timestamp: new Date().toISOString()
  };

  res.json(performance);
});

// Alert creation endpoint (for services to report issues)
app.post('/alerts', (req, res) => {
  const { service, type, message, severity = 'info', metadata = {} } = req.body;

  const alert = {
    id: Date.now().toString(),
    service,
    type,
    message,
    severity,
    metadata,
    timestamp: Date.now(),
    acknowledged: false
  };

  metrics.alerts.push(alert);

  // Log the alert
  logger.log(severity, `Alert from ${service}: ${message}`, { alertId: alert.id, metadata });

  // In production, send notifications (email, Slack, etc.)
  if (severity === 'error' || severity === 'critical') {
    console.log(`🚨 CRITICAL ALERT: ${service} - ${message}`);
  }

  res.status(201).json(alert);
});

// Dashboard data endpoint
app.get('/dashboard', async (req, res) => {
  try {
    const [systemMetrics, serviceHealth] = await Promise.all([
      fetch(`${req.protocol}://${req.get('host')}/metrics/system`).then(r => r.json()),
      fetch(`${req.protocol}://${req.get('host')}/health/services`).then(r => r.json())
    ]);

    const dashboard = {
      system: systemMetrics,
      services: serviceHealth,
      alerts: metrics.alerts.slice(-10),
      timestamp: new Date().toISOString()
    };

    res.json(dashboard);
  } catch (error) {
    logger.error('Dashboard data error', { error: error.message });
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Health check for monitoring service itself
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'monitoring',
    uptime: Date.now() - metrics.system.startTime,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  metrics.system.errors++;
  logger.error('Unhandled error in monitoring service', {
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

// Periodic health checks
setInterval(async () => {
  try {
    const results = await Promise.allSettled(
      serviceRegistry.slice(0, 5).map(service => checkServiceHealth(service)) // Check first 5 services
    );

    const unhealthyServices = results
      .filter(result => result.status === 'fulfilled' && result.value.status === 'unhealthy')
      .map(result => result.value);

    if (unhealthyServices.length > 0) {
      logger.warn('Unhealthy services detected', { services: unhealthyServices });
    }
  } catch (error) {
    logger.error('Periodic health check failed', { error: error.message });
  }
}, 30000); // Every 30 seconds

app.listen(PORT, () => {
  logger.info(`Monitoring service started on port ${PORT}`);
  console.log(`📊 Monitoring service listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('Monitoring service shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Monitoring service shutting down');
  process.exit(0);
});