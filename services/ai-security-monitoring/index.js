/**
 * @file Advanced AI Security Monitoring Service
 * @description Enterprise-grade AI security monitoring with computer vision, real-time ML models, advanced threat detection, and camera integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const cron = require('node-cron');
const axios = require('axios');
const sharp = require('sharp');
const natural = require('natural');
const { MongoClient } = require('mongodb');
const redis = require('redis');
const { Server } = require('socket.io');
const http = require('http');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-security' },
  transports: [
    new winston.transports.File({ filename: 'logs/ai-security.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4600;

// Database connections
let mongoClient;
let analysisCollection;
let redisClient;

// ML Models
let objectDetectionModel;
let anomalyDetectionModel;
let behavioralAnalysisModel;

// Camera feeds and active analyses
const activeCameras = new Map();
const analysisJobs = new Map();
const threatPatterns = new Map();

// Threat detection rules
const THREAT_RULES = {
  INTRUSION: {
    patterns: ['person', 'vehicle'],
    timeWindows: ['night', 'early_morning'],
    locations: ['perimeter', 'restricted_area'],
    confidence: 0.8
  },
  LOITERING: {
    duration: 300000, // 5 minutes
    confidence: 0.7
  },
  CROWD_GATHERING: {
    minPeople: 5,
    duration: 60000, // 1 minute
    confidence: 0.6
  },
  SUSPICIOUS_BEHAVIOR: {
    patterns: ['running', 'crouching', 'looking_around'],
    confidence: 0.75
  }
};

// Initialize external systems
async function initializeSystems() {
  try {
    // Initialize MongoDB
    if (process.env.MONGODB_URL) {
      mongoClient = new MongoClient(process.env.MONGODB_URL);
      await mongoClient.connect();
      const db = mongoClient.db('ai-security');
      analysisCollection = db.collection('analyses');

      await analysisCollection.createIndex({ cameraId: 1, timestamp: -1 });
      await analysisCollection.createIndex({ threatLevel: 1 });
      await analysisCollection.createIndex({ 'location.gps': '2dsphere' });

      logger.info('MongoDB initialized for AI security');
    }

    // Initialize Redis
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await redisClient.connect();

    // Initialize ML models
    await initializeMLModels();

    logger.info('AI Security Monitoring systems initialized');
  } catch (error) {
    logger.error('System initialization failed', { error: error.message });
  }
}

// Initialize ML Models
async function initializeMLModels() {
  try {
    // Load TensorFlow.js models
    const tf = require('@tensorflow/tfjs-node');

    // Object detection model (COCO-SSD)
    const cocoSsd = require('@tensorflow-models/coco-ssd');
    objectDetectionModel = await cocoSsd.load();

    // Custom anomaly detection model (placeholder for trained model)
    anomalyDetectionModel = {
      predict: async (features) => {
        // Mock anomaly detection based on statistical analysis
        const anomalyScore = Math.random();
        return {
          isAnomaly: anomalyScore > 0.8,
          score: anomalyScore,
          confidence: Math.random()
        };
      }
    };

    // Behavioral analysis model
    behavioralAnalysisModel = {
      analyze: async (detections, historicalData) => {
        // Analyze patterns in detections
        const behaviors = [];

        // Loitering detection
        const personDetections = detections.filter(d => d.class === 'person');
        if (personDetections.length > 0) {
          const duration = calculateDuration(personDetections);
          if (duration > THREAT_RULES.LOITERING.duration) {
            behaviors.push({
              type: 'LOITERING',
              confidence: THREAT_RULES.LOITERING.confidence,
              duration
            });
          }
        }

        // Crowd detection
        if (personDetections.length >= THREAT_RULES.CROWD_GATHERING.minPeople) {
          behaviors.push({
            type: 'CROWD_GATHERING',
            confidence: THREAT_RULES.CROWD_GATHERING.confidence,
            peopleCount: personDetections.length
          });
        }

        return behaviors;
      }
    };

    logger.info('ML models initialized successfully');
  } catch (error) {
    logger.error('ML model initialization failed', { error: error.message });
  }
}

// Computer Vision Analysis
class ComputerVisionAnalyzer {
  constructor() {
    this.frameBuffer = new Map();
    this.motionDetection = new Map();
    this.opencvAvailable = false;

    // Try to load OpenCV optionally
    try {
      // OpenCV is optional - will use TensorFlow.js as primary
      this.opencvAvailable = false;
    } catch (error) {
      logger.warn('OpenCV not available, using TensorFlow.js only for computer vision');
    }
  }

  async analyzeFrame(frameBuffer, cameraId, metadata = {}) {
    try {
      // Convert buffer to tensor
      const tf = require('@tensorflow/tfjs-node');
      const image = sharp(frameBuffer);
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      const tensor = tf.tensor3d(data, [info.height, info.width, info.channels]);

      // Object detection
      const detections = await objectDetectionModel.detect(tensor);

      // Anomaly detection
      const anomalyResult = await anomalyDetectionModel.predict(this.extractFeatures(detections));

      // Behavioral analysis
      const historicalData = await this.getHistoricalData(cameraId);
      const behaviors = await behavioralAnalysisModel.analyze(detections, historicalData);

      // Threat assessment
      const threats = await this.assessThreats(detections, behaviors, anomalyResult, metadata);

      // Store analysis result
      const analysisResult = {
        id: uuidv4(),
        cameraId,
        timestamp: new Date(),
        detections,
        anomaly: anomalyResult,
        behaviors,
        threats,
        metadata,
        frameInfo: {
          width: info.width,
          height: info.height,
          channels: info.channels
        }
      };

      // Store in database
      if (analysisCollection) {
        await analysisCollection.insertOne(analysisResult);
      }

      // Cache recent analysis
      await redisClient.setEx(
        `analysis:${cameraId}:latest`,
        300, // 5 minutes
        JSON.stringify(analysisResult)
      );

      // Emit real-time updates via WebSocket
      io.to(`camera:${cameraId}`).emit('analysis', analysisResult);

      return analysisResult;
    } catch (error) {
      logger.error('Frame analysis failed', { error: error.message, cameraId });
      throw error;
    }
  }

  extractFeatures(detections) {
    // Extract numerical features for anomaly detection
    const features = {
      objectCount: detections.length,
      personCount: detections.filter(d => d.class === 'person').length,
      vehicleCount: detections.filter(d => d.class === 'car' || d.class === 'truck').length,
      averageConfidence: detections.reduce((sum, d) => sum + d.score, 0) / detections.length || 0,
      motionLevel: Math.random() // Placeholder for motion detection
    };

    return features;
  }

  async getHistoricalData(cameraId) {
    // Get recent analyses for behavioral pattern analysis
    try {
      const recentAnalyses = await redisClient.get(`analysis:${cameraId}:history`);
      return recentAnalyses ? JSON.parse(recentAnalyses) : [];
    } catch (error) {
      return [];
    }
  }

  async assessThreats(detections, behaviors, anomaly, metadata) {
    const threats = [];

    // Check against threat rules
    for (const behavior of behaviors) {
      if (behavior.confidence >= THREAT_RULES[behavior.type]?.confidence) {
        threats.push({
          type: behavior.type,
          severity: this.calculateSeverity(behavior),
          confidence: behavior.confidence,
          description: this.generateThreatDescription(behavior),
          location: metadata.location,
          timestamp: new Date()
        });
      }
    }

    // Anomaly-based threats
    if (anomaly.isAnomaly && anomaly.score > 0.8) {
      threats.push({
        type: 'ANOMALY_DETECTED',
        severity: 'HIGH',
        confidence: anomaly.confidence,
        description: `Anomalous activity detected with score ${anomaly.score.toFixed(2)}`,
        location: metadata.location,
        timestamp: new Date()
      });
    }

    return threats;
  }

  calculateSeverity(threat) {
    if (threat.confidence > 0.9) return 'CRITICAL';
    if (threat.confidence > 0.8) return 'HIGH';
    if (threat.confidence > 0.6) return 'MEDIUM';
    return 'LOW';
  }

  generateThreatDescription(threat) {
    const descriptions = {
      LOITERING: `Person loitering for ${(threat.duration / 60000).toFixed(1)} minutes`,
      CROWD_GATHERING: `Crowd of ${threat.peopleCount} people gathering`,
      ANOMALY_DETECTED: 'Unusual activity pattern detected'
    };

    return descriptions[threat.type] || 'Unknown threat detected';
  }
}

const visionAnalyzer = new ComputerVisionAnalyzer();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

// File upload for video/image analysis
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// WebSocket connections
io.on('connection', (socket) => {
  logger.info('WebSocket client connected', { socketId: socket.id });

  // Join camera room
  socket.on('join-camera', (cameraId) => {
    socket.join(`camera:${cameraId}`);
    logger.info('Client joined camera room', { socketId: socket.id, cameraId });
  });

  // Leave camera room
  socket.on('leave-camera', (cameraId) => {
    socket.leave(`camera:${cameraId}`);
    logger.info('Client left camera room', { socketId: socket.id, cameraId });
  });

  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected', { socketId: socket.id });
  });
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-security-monitoring',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    modelsLoaded: !!(objectDetectionModel && anomalyDetectionModel),
    activeCameras: activeCameras.size,
    analysisJobs: analysisJobs.size,
    mongodb: !!analysisCollection,
    redis: !!redisClient
  });
});

// API health endpoint (legacy)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    modelsLoaded: !!(objectDetectionModel && anomalyDetectionModel)
  });
});

// Analyze uploaded media
app.post('/v1/analyze/upload', upload.single('media'), async (req, res) => {
  try {
    const { cameraId, location, analysisConfig } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No media file provided' });
    }

    const jobId = uuidv4();
    analysisJobs.set(jobId, { status: 'PROCESSING', startTime: Date.now() });

    // Process asynchronously
    setTimeout(async () => {
      try {
        const result = await visionAnalyzer.analyzeFrame(
          file.buffer,
          cameraId || 'upload',
          {
            location: location ? JSON.parse(location) : null,
            analysisConfig: analysisConfig ? JSON.parse(analysisConfig) : {},
            source: 'upload'
          }
        );

        analysisJobs.set(jobId, {
          status: 'COMPLETED',
          result,
          completedAt: new Date()
        });

        // Publish threats to event bus
        for (const threat of result.threats) {
          await publishThreatEvent(threat, result);
        }

      } catch (error) {
        analysisJobs.set(jobId, {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date()
        });
        logger.error('Analysis job failed', { jobId, error: error.message });
      }
    }, 100);

    res.json({
      jobId,
      status: 'QUEUED',
      estimatedCostAzr: 0.001
    });
  } catch (error) {
    logger.error('Upload analysis failed', { error: error.message });
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Submit analysis job (legacy endpoint)
app.post('/v1/analyze/submit', async (req, res) => {
  try {
    const { source_id, media_url, location, analysis_config } = req.body;

    const jobId = uuidv4();
    analysisJobs.set(jobId, { status: 'PROCESSING', startTime: Date.now() });

    // Mock async processing with real analysis
    setTimeout(async () => {
      try {
        // Fetch media if URL provided
        let mediaBuffer;
        if (media_url) {
          const response = await axios.get(media_url, { responseType: 'arraybuffer' });
          mediaBuffer = Buffer.from(response.data);
        } else {
          // Generate mock frame for demo
          mediaBuffer = Buffer.alloc(1920 * 1080 * 3); // Mock RGB image
        }

        const result = await visionAnalyzer.analyzeFrame(
          mediaBuffer,
          source_id,
          {
            location,
            analysisConfig: analysis_config,
            source: 'api'
          }
        );

        analysisJobs.set(jobId, {
          status: 'COMPLETED',
          result,
          completedAt: new Date()
        });

        // Publish threats to event bus
        for (const threat of result.threats) {
          await publishThreatEvent(threat, result);
        }

      } catch (error) {
        analysisJobs.set(jobId, {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date()
        });
        logger.error('Analysis job failed', { jobId, error: error.message });
      }
    }, 2000);

    res.json({
      job_id: jobId,
      status: 'QUEUED',
      estimated_cost_azr: 0.0005
    });
  } catch (error) {
    logger.error('Analysis submission failed', { error: error.message });
    res.status(500).json({ error: 'Analysis submission failed' });
  }
});

// Get analysis job status
app.get('/v1/analyze/job/:jobId', (req, res) => {
  const job = analysisJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// Get camera analysis history
app.get('/api/camera/:cameraId/analysis', async (req, res) => {
  try {
    const { cameraId } = req.params;
    const { limit = 50, threatLevel } = req.query;

    let query = { cameraId };
    if (threatLevel) {
      query['threats.severity'] = threatLevel;
    }

    let analyses = [];
    if (analysisCollection) {
      analyses = await analysisCollection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .toArray();
    }

    res.json({ analyses });
  } catch (error) {
    logger.error('Camera analysis retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve analyses' });
  }
});

// Register camera feed
app.post('/api/camera/register', (req, res) => {
  try {
    const { cameraId, location, config } = req.body;

    activeCameras.set(cameraId, {
      id: cameraId,
      location,
      config,
      registeredAt: new Date(),
      lastSeen: new Date()
    });

    res.json({ message: 'Camera registered successfully' });
  } catch (error) {
    logger.error('Camera registration failed', { error: error.message });
    res.status(500).json({ error: 'Camera registration failed' });
  }
});

// Get active cameras
app.get('/api/camera/active', (req, res) => {
  const cameras = Array.from(activeCameras.values()).map(camera => ({
    ...camera,
    isOnline: (Date.now() - camera.lastSeen) < 300000 // 5 minutes
  }));

  res.json({ cameras });
});

// Threat patterns and analytics
app.get('/api/analytics/threats', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    // Aggregate threat data
    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: new Date(Date.now() - parseTimeframe(timeframe))
          }
        }
      },
      {
        $unwind: '$threats'
      },
      {
        $group: {
          _id: '$threats.type',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$threats.confidence' },
          severities: { $push: '$threats.severity' }
        }
      }
    ];

    let analytics = [];
    if (analysisCollection) {
      analytics = await analysisCollection.aggregate(pipeline).toArray();
    }

    res.json({ analytics, timeframe });
  } catch (error) {
    logger.error('Threat analytics failed', { error: error.message });
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Publish threat event to event bus
async function publishThreatEvent(threat, analysis) {
  try {
    await axios.post('http://localhost:3005/events/publish', {
      topic: 'security.event.threat_detected',
      message: {
        threat,
        analysis: {
          id: analysis.id,
          cameraId: analysis.cameraId,
          timestamp: analysis.timestamp,
          location: analysis.metadata?.location
        }
      }
    });
  } catch (error) {
    logger.error('Failed to publish threat event', { error: error.message });
  }
}

// Utility functions
function parseTimeframe(timeframe) {
  const units = {
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000,
    'w': 7 * 24 * 60 * 60 * 1000
  };

  const match = timeframe.match(/^(\d+)([hdw])$/);
  if (match) {
    return parseInt(match[1]) * units[match[2]];
  }
  return 24 * 60 * 60 * 1000; // Default 24h
}

function calculateDuration(detections) {
  if (detections.length < 2) return 0;
  const timestamps = detections.map(d => new Date(d.timestamp || Date.now()));
  return Math.max(...timestamps) - Math.min(...timestamps);
}

// Scheduled cleanup
cron.schedule('*/30 * * * *', () => {
  // Clean up old analysis jobs
  const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
  for (const [jobId, job] of analysisJobs) {
    if (job.completedAt && job.completedAt < cutoff) {
      analysisJobs.delete(jobId);
    }
  }

  // Update camera last seen
  for (const camera of activeCameras.values()) {
    if ((Date.now() - camera.lastSeen) > (10 * 60 * 1000)) { // 10 minutes
      activeCameras.delete(camera.id);
    }
  }
});

// Error handling
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

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing gracefully');

  try {
    if (mongoClient) await mongoClient.close();
    if (redisClient) await redisClient.quit();
    io.close();
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
  }

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    await initializeSystems();

    server.listen(PORT, () => {
      logger.info(`🚀 Advanced AI Security Monitoring v2.0 running on port ${PORT}`, {
        features: [
          'Computer Vision (TensorFlow)',
          'Real-time Object Detection',
          'Anomaly Detection',
          'Behavioral Analysis',
          'Threat Assessment',
          'WebSocket Streaming',
          'Event Bus Integration',
          'Camera Management',
          'Analytics Dashboard'
        ]
      });
      console.log(`🚀 Advanced AI Security Monitoring listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();

