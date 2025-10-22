/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file index.js
 * @module organs/vigil-service
 * @description Main entry point for the Vigil service - AI-powered video surveillance and alerting
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies express, onvif, mqtt, kafkajs, cloudevents
 * @integrates_with
 *   - /organs/auth-service (authentication)
 *   - /organs/pulse-service (analytics)
 *   - /synapse/vigil-ui (frontend)
 * @api_endpoints /api/vigil/cameras, /api/vigil/alerts, /api/vigil/streams, /api/vigil/streams/:cameraId/start, /api/vigil/streams/:cameraId/stop, /api/vigil/streams/:cameraId/status, /api/vigil/streams/:cameraId/endpoints, /api/vigil/alerts/:id/ack, /api/vigil/alerts/:id/escalate, /api/vigil/alerts/:id/resolve, /api/vigil/alerts/stats, /api/vigil/system/metrics, /api/vigil/auth/login, /api/vigil/auth/me, /api/vigil/admin/users, /health, /metrics
 * @state_management local
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit, integration
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['express', 'cors', 'helmet', 'dotenv', 'winston', 'onvif', 'mqtt', 'kafkajs', 'cloudevents'],
  exports: ['VigilService'],
  consumed_by: ['vigil-ui', 'pulse-service'],
  dependencies: ['auth-service', 'database'],
  api_calls: ['/auth/verify', '/pulse/metrics'],
  state_shared: false,
  environment_vars: ['DATABASE_URL', 'MQTT_BROKER', 'KAFKA_BROKERS', 'AZURE_EVENTGRID_KEY']
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});
const { CloudEvent } = require('cloudevents');

// Import service modules
const cameraManager = require('./cameraManager');
const alertEngine = require('./alertEngine');
const streamProcessor = require('./streamProcessor');

// Import route modules
const authRoutes = require('./routes/auth.js');
const adminRoutes = require('./routes/admin.js');

// Import auth middleware
const { requireAuth, requireRole, optionalAuth } = require('./auth/middlewares.js');

// Import Socket.io
const { Server } = require('socket.io');
const http = require('http');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.UI_ORIGIN?.split(',') || ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io'
});

const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// HSTS header for HTTPS
app.use((req, res, next) => {
  if (req.secure || req.header('x-forwarded-proto') === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
app.use(cors({
  origin: process.env.UI_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/vigil/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-camera', (cameraId) => {
    socket.join(`camera:${cameraId}`);
    console.log(`Client ${socket.id} joined camera:${cameraId}`);
  });

  socket.on('leave-camera', (cameraId) => {
    socket.leave(`camera:${cameraId}`);
    console.log(`Client ${socket.id} left camera:${cameraId}`);
  });

  socket.on('join-dashboard', () => {
    socket.join('dashboard');
    console.log(`Client ${socket.id} joined dashboard`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to publish real-time metrics
function publishMetrics() {
  setInterval(async () => {
    try {
      // Get camera metrics
      const cameras = await cameraManager.getCameras();
  const activeStreams = streamProcessor.getActiveStreams();

      // Calculate system-wide metrics
      const systemMetrics = {
        timestamp: new Date().toISOString(),
        cameras: {
          total: cameras.length,
          online: cameras.filter(c => c.status === 'online').length
        },
        streams: {
          active: activeStreams.length,
          totalProcessed: activeStreams.reduce((sum, s) => sum + s.frameCount, 0)
        },
        alerts: {
          total: (await alertEngine.getAlerts()).length,
          recent: (await alertEngine.getAlerts()).filter(a =>
            new Date(a.timestamp) > new Date(Date.now() - 3600000) // Last hour
          ).length
        }
      };

      // Publish to dashboard subscribers
      io.to('dashboard').emit('system-metrics', systemMetrics);

      // Publish per-camera metrics
      for (const camera of cameras) {
        const cameraMetrics = {
          cameraId: camera.id,
          timestamp: new Date().toISOString(),
          status: camera.status,
          fps: activeStreams.find(s => s.cameraId === camera.id)?.fps || 0,
          latency: Math.random() * 100 + 50, // Placeholder - would come from inference
          alertsLastHour: (await alertEngine.getAlerts()).filter(a =>
            a.event.source.includes(camera.id) &&
            new Date(a.timestamp) > new Date(Date.now() - 3600000)
          ).length
        };

        io.to(`camera:${camera.id}`).emit('camera-metrics', cameraMetrics);
      }
    } catch (error) {
      console.error('Error publishing metrics:', error);
    }
  }, 5000); // Update every 5 seconds
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'vigil-service', timestamp: new Date().toISOString() });
});

// Authentication routes (public)
app.use('/api/vigil/auth', authRoutes);

// Admin routes (protected - admin only)
app.use('/api/vigil/admin', adminRoutes);

// API Routes (protected based on roles)
app.get('/api/vigil/cameras', optionalAuth, async (req, res) => {
  try {
    const cameras = await cameraManager.getCameras();
    res.json(cameras);
  } catch (error) {
    logger.error('Error fetching cameras:', error);
    res.status(500).json({ error: 'Failed to fetch cameras' });
  }
});

app.get('/api/vigil/cameras/:id', optionalAuth, async (req, res) => {
  try {
    const camera = await cameraManager.getCamera(req.params.id);
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    res.json(camera);
  } catch (error) {
    logger.error('Error fetching camera:', error);
    res.status(500).json({ error: 'Failed to fetch camera' });
  }
});

app.post('/api/vigil/cameras/discover', requireAuth, requireRole('operator', 'admin'), async (req, res) => {
  try {
    await cameraManager.discoverCameras();
    res.json({ message: 'Camera discovery initiated' });
  } catch (error) {
    logger.error('Error discovering cameras:', error);
    res.status(500).json({ error: 'Failed to discover cameras' });
  }
});

app.get('/api/vigil/alerts', optionalAuth, async (req, res) => {
  try {
    const alerts = await alertEngine.getAlerts(req.query);
    res.json(alerts);
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.get('/api/vigil/alerts/:id', optionalAuth, async (req, res) => {
  try {
    const alert = await alertEngine.getAlert(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    logger.error('Error fetching alert:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

app.post('/api/vigil/alerts/:id/ack', requireAuth, requireRole('operator', 'admin'), async (req, res) => {
  try {
    await alertEngine.acknowledgeAlert(req.params.id, req.body);
    res.json({ message: 'Alert acknowledged' });
  } catch (error) {
    logger.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

app.post('/api/vigil/alerts/:id/escalate', requireAuth, requireRole('operator', 'admin'), async (req, res) => {
  try {
    await alertEngine.escalateAlert(req.params.id, req.body);
    res.json({ message: 'Alert escalated' });
  } catch (error) {
    logger.error('Error escalating alert:', error);
    res.status(500).json({ error: 'Failed to escalate alert' });
  }
});

app.post('/api/vigil/alerts/:id/resolve', requireAuth, requireRole('operator', 'admin'), async (req, res) => {
  try {
    const alert = await alertEngine.getAlert(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Mark alert as resolved
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = req.user.id;
    alert.resolution = req.body.resolution || 'Resolved by user';

    res.json({
      message: 'Alert resolved',
      alert: {
        id: alert.id,
        resolved: alert.resolved,
        resolvedAt: alert.resolvedAt,
        resolvedBy: alert.resolvedBy,
        resolution: alert.resolution
      }
    });
  } catch (error) {
    logger.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

app.get('/api/vigil/alerts/stats', optionalAuth, async (req, res) => {
  try {
    const alerts = await alertEngine.getAlerts();
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: alerts.length,
      acknowledged: alerts.filter(a => a.acknowledged).length,
      escalated: alerts.filter(a => a.escalated).length,
      resolved: alerts.filter(a => a.resolved).length,
      bySeverity: {
        critical: alerts.filter(a => a.event.data.severity === 'critical').length,
        high: alerts.filter(a => a.event.data.severity === 'high').length,
        medium: alerts.filter(a => a.event.data.severity === 'medium').length,
        low: alerts.filter(a => a.event.data.severity === 'low').length
      },
      recent: {
        last24h: alerts.filter(a => new Date(a.timestamp) > last24h).length,
        last7d: alerts.filter(a => new Date(a.timestamp) > last7d).length
      },
      avgResolutionTime: calculateAvgResolutionTime(alerts)
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

app.post('/api/vigil/streams/:cameraId/start', requireAuth, requireRole('operator', 'admin'), async (req, res) => {
  try {
    const result = await streamProcessor.startStream(req.params.cameraId);
    res.json(result);
  } catch (error) {
    logger.error('Error starting stream:', error);
    res.status(500).json({ error: 'Failed to start stream' });
  }
});

app.post('/api/vigil/streams/:cameraId/stop', requireAuth, requireRole('operator', 'admin'), async (req, res) => {
  try {
    await streamProcessor.stopStream(req.params.cameraId);
    res.json({ message: 'Stream stopped' });
  } catch (error) {
    logger.error('Error stopping stream:', error);
    res.status(500).json({ error: 'Failed to stop stream' });
  }
});

app.get('/api/vigil/streams', optionalAuth, async (req, res) => {
  try {
    const streams = streamProcessor.getActiveStreams();
    res.json(streams);
  } catch (error) {
    logger.error('Error fetching streams:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

app.get('/api/vigil/streams/:cameraId/status', optionalAuth, async (req, res) => {
  try {
    const status = await streamProcessor.getStreamStatus(req.params.cameraId);
    res.json(status);
  } catch (error) {
    logger.error('Error getting stream status:', error);
    res.status(500).json({ error: 'Failed to get stream status' });
  }
});

app.get('/api/vigil/streams/:cameraId/endpoints', optionalAuth, async (req, res) => {
  try {
    const cameraId = req.params.cameraId;
    const camera = await cameraManager.getCamera(cameraId);

    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    // Determine available streaming endpoints based on camera capabilities
    const endpoints = {
      webrtc: null,
      hls: null,
      dash: null,
      rtsp: camera.streamUrl // Original RTSP stream
    };

    // Check if WebRTC is available (would be configured per camera)
    if (camera.capabilities?.webrtc) {
      endpoints.webrtc = {
        wsUrl: `ws://localhost:${PORT}/webrtc/${cameraId}`,
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };
    }

    // Check if HLS is available
    if (camera.capabilities?.hls) {
      endpoints.hls = `http://localhost:${PORT}/hls/${cameraId}/stream.m3u8`;
    }

    // Check if DASH is available
    if (camera.capabilities?.dash) {
      endpoints.dash = `http://localhost:${PORT}/dash/${cameraId}/manifest.mpd`;
    }

    res.json(endpoints);
  } catch (error) {
    logger.error('Error getting stream endpoints:', error);
    res.status(500).json({ error: 'Failed to get stream endpoints' });
  }
});

app.get('/api/vigil/system/metrics', optionalAuth, async (req, res) => {
  try {
    const cameras = await cameraManager.getCameras();
  const activeStreams = streamProcessor.getActiveStreams();
    const alerts = await alertEngine.getAlerts();

    const metrics = {
      timestamp: new Date().toISOString(),
      cameras: {
        total: cameras.length,
        online: cameras.filter(c => c.status === 'online').length
      },
      streams: {
        active: activeStreams.length,
        totalProcessed: activeStreams.reduce((sum, s) => sum + s.frameCount, 0)
      },
      alerts: {
        total: alerts.length,
        recent: alerts.filter(a =>
          new Date(a.timestamp) > new Date(Date.now() - 3600000) // Last hour
        ).length,
        bySeverity: {
          critical: alerts.filter(a => a.event.data.severity === 'critical').length,
          high: alerts.filter(a => a.event.data.severity === 'high').length,
          medium: alerts.filter(a => a.event.data.severity === 'medium').length,
          low: alerts.filter(a => a.event.data.severity === 'low').length
        }
      },
      uptime: process.uptime()
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching system metrics:', error);
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

// Health checks
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'vigil-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health/liveness', (req, res) => {
  // Kubernetes liveness probe - check if service is running
  res.status(200).json({ status: 'alive' });
});

app.get('/health/readiness', async (req, res) => {
  // Kubernetes readiness probe - check if service is ready to serve traffic
  try {
    // Check database connectivity, MQTT, etc.
    const isReady = await checkReadiness();
    if (isReady) {
      res.json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

app.get('/health/deep', async (req, res) => {
  // Deep health check including all dependencies
  try {
    const health = await performDeepHealthCheck();
    res.json(health);
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await collectMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    logger.error('Error collecting metrics:', error);
    res.status(500).send('Error collecting metrics');
  }
});

// Initialize service

// Initialize service
async function initializeService() {
  try {
    logger.info('Initializing Vigil Service...');

    // Initialize camera discovery
    await cameraManager.initialize();

    // Initialize alert engine
    await alertEngine.initialize();

    // Initialize stream processor
    await streamProcessor.initialize();

    logger.info('Vigil Service initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Vigil Service:', error);
    process.exit(1);
  }
}

// Start server
server.listen(PORT, async () => {
  logger.info(`Vigil Service running on port ${PORT}`);
  await initializeService();
  publishMetrics(); // Start real-time metrics publishing
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Helper functions for health checks and metrics
async function checkReadiness() {
  // Check if all dependencies are ready
  try {
    // Check MQTT connection
    const mqttReady = !process.env.MQTT_BROKER || true; // Simplified check

    // Check database connection (placeholder)
    const dbReady = true;

    // Check camera manager
    const camerasReady = cameraManager ? true : false;

    return mqttReady && dbReady && camerasReady;
  } catch (error) {
    logger.error('Readiness check failed:', error);
    return false;
  }
}

async function performDeepHealthCheck() {
  const health = {
    service: 'vigil-service',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {}
  };

  try {
    // Camera manager health
    health.checks.cameras = {
      status: 'healthy',
      count: (await cameraManager.getCameras()).length
    };

    // Alert engine health
    health.checks.alerts = {
      status: 'healthy',
      count: (await alertEngine.getAlerts()).length
    };

    // Stream processor health
    health.checks.streams = {
      status: 'healthy',
      active: streamProcessor.getActiveStreams().length
    };

    // MQTT health (placeholder)
    health.checks.mqtt = {
      status: 'healthy',
      connected: true
    };

    // Database health (placeholder)
    health.checks.database = {
      status: 'healthy',
      connected: true
    };

  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
  }

  return health;
}

function calculateAvgResolutionTime(alerts) {
  const resolvedAlerts = alerts.filter(a => a.resolved && a.resolvedAt && a.timestamp);

  if (resolvedAlerts.length === 0) return 0;

  const totalTime = resolvedAlerts.reduce((sum, alert) => {
    const created = new Date(alert.timestamp);
    const resolved = new Date(alert.resolvedAt);
    return sum + (resolved.getTime() - created.getTime());
  }, 0);

  return totalTime / resolvedAlerts.length / 1000; // Return in seconds
}

async function collectMetrics() {
  // Prometheus metrics format
  let metrics = `# HELP vigil_cameras_total Total number of cameras
# TYPE vigil_cameras_total gauge
vigil_cameras_total ${(await cameraManager.getCameras()).length}

# HELP vigil_alerts_total Total number of alerts
# TYPE vigil_alerts_total gauge
vigil_alerts_total ${(await alertEngine.getAlerts()).length}

# HELP vigil_streams_active Number of active streams
# TYPE vigil_streams_active gauge
vigil_streams_active ${streamProcessor.getActiveStreams().length}

# HELP vigil_service_uptime_seconds Service uptime in seconds
# TYPE vigil_service_uptime_seconds counter
vigil_service_uptime_seconds ${process.uptime()}
`;

  return metrics;
}

module.exports = app;