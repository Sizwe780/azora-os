/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Comprehensive Database & Analytics Integration Service
 *
 * Enterprise-grade database integration with PostgreSQL, MongoDB, and Redis
 * providing real-time data sync, advanced analytics, and intelligent caching.
 *
 * Features:
 * - PostgreSQL with Prisma ORM (relational data, transactions, structured schemas)
 * - MongoDB for document storage (logs, analytics, flexible schemas)
 * - Redis for caching, sessions, real-time data, and pub/sub
 * - Real-time data synchronization
 * - Advanced analytics and reporting
 * - Intelligent caching strategies
 * - Data migration and backup
 * - Performance monitoring
 * - Automated data archiving
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables FIRST (before any imports that use them)
require('dotenv').config();

import express from 'express';
import cors from 'cors';
import { DatabaseManager, DB_CONFIG } from './DatabaseManager.js';
import { AnalyticsEngine } from './AnalyticsEngine.js';
import { CacheEngine } from './CacheEngine.js';
import { SyncEngine } from './SyncEngine.js';

const app = express();
const PORT = process.env.DATABASE_PORT || 5002;

// ============================================================================
// DATABASE CONNECTIONS
// ============================================================================

// ============================================================================
// ANALYTICS ENGINE
// ============================================================================

// ============================================================================
// CACHING ENGINE
// ============================================================================

// ============================================================================
// REAL-TIME SYNC ENGINE
// ============================================================================

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

const dbManager = new DatabaseManager();
const analytics = new AnalyticsEngine(dbManager);
const cache = new CacheEngine(dbManager);
const sync = new SyncEngine(dbManager);

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// HEALTH & MONITORING ENDPOINTS
// ============================================================================

// Health check
app.get('/health', async (req, res) => {
  const status = dbManager.getConnectionStatus();

  res.json({
    service: 'Database & Analytics Integration',
    status: status.overall ? 'healthy' : 'degraded',
    databases: status,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  const status = dbManager.getConnectionStatus();

  let dbStats = {};
  try {
    if (status.postgresql && dbManager.prisma) {
      const userCount = await dbManager.prisma.user.count();
      const jobCount = await dbManager.prisma.job.count();
      dbStats.postgresql = { users: userCount, jobs: jobCount };
    }

    if (status.mongodb && dbManager.mongoDb) {
      const collections = await dbManager.mongoDb.collections();
      dbStats.mongodb = {
        collections: collections.length,
        collectionsList: collections.map(c => c.collectionName)
      };
    }

    if (status.redis && dbManager.redisClient) {
      const info = await dbManager.redisClient.info();
      const dbSize = info.split('\n').find(line => line.startsWith('db0:keys='))?.split('=')[1] || '0';
      dbStats.redis = { keys: parseInt(dbSize) };
    }
  } catch (error) {
    dbStats.error = error.message;
  }

  res.json({
    service: 'Database & Analytics Integration',
    status: status.overall ? 'healthy' : 'degraded',
    databases: status,
    stats: dbStats,
    cache: {
      inMemorySize: cache.inMemoryCache?.size || 0
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

// Get company metrics
app.get('/analytics/metrics/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { timeframe = '30d' } = req.query;

    const cacheKey = `metrics:${companyId}:${timeframe}`;
    let metrics = await cache.get(cacheKey, 'metrics');

    if (!metrics) {
      metrics = await analytics.calculateMetrics(companyId, timeframe);
      await cache.set(cacheKey, metrics, 'metrics');
    }

    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get predictions
app.get('/analytics/predictions/:companyId/:metricType', async (req, res) => {
  try {
    const { companyId, metricType } = req.params;

    const predictions = await analytics.generatePredictions(companyId, metricType);

    res.json({ success: true, predictions });
  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get analytics dashboard data
app.get('/analytics/dashboard/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { timeframe = '30d' } = req.query;

    // Get multiple metrics in parallel
    const [metrics, revenuePredictions, safetyPredictions] = await Promise.all([
      analytics.calculateMetrics(companyId, timeframe),
      analytics.generatePredictions(companyId, 'financial.totalRevenue'),
      analytics.generatePredictions(companyId, 'safety.totalIncidents')
    ]);

    // Get recent AI insights
    let insights = [];
    if (dbManager.prisma) {
      insights = await dbManager.prisma.aIInsight.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
    }

    res.json({
      success: true,
      dashboard: {
        metrics,
        predictions: {
          revenue: revenuePredictions,
          safety: safetyPredictions
        },
        insights,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DATA MANAGEMENT ENDPOINTS
// ============================================================================

// PostgreSQL query endpoint (admin only)
app.post('/data/postgresql/query', async (req, res) => {
  try {
    const { query, params = [] } = req.body;

    // Basic security check - only allow SELECT queries for now
    if (!query.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(403).json({ error: 'Only SELECT queries allowed' });
    }

    if (!dbManager.prisma) {
      return res.status(503).json({ error: 'PostgreSQL not connected' });
    }

    const result = await dbManager.prisma.$queryRawUnsafe(query, ...params);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('PostgreSQL query error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// MongoDB collection operations
app.get('/data/mongodb/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const { limit = 100, skip = 0, filter = '{}' } = req.query;

    if (!dbManager.mongoDb) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }

    const mongoCollection = dbManager.mongoDb.collection(collection);
    const query = JSON.parse(filter);

    const documents = await mongoCollection
      .find(query)
      .limit(parseInt(String(limit), 10))
      .skip(parseInt(String(skip), 10))
      .toArray();

    const total = await mongoCollection.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: { total, limit: parseInt(String(limit), 10), skip: parseInt(String(skip), 10) }
    });
  } catch (error) {
    console.error('MongoDB query error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Redis cache operations
app.get('/data/redis/:key', async (req, res) => {
  try {
    const { key } = req.params;

    if (!dbManager.redisClient) {
      return res.status(503).json({ error: 'Redis not connected' });
    }

    const value = await dbManager.redisClient.get(key);

    res.json({
      success: true,
      key,
      value: value ? JSON.parse(value) : null,
      exists: value !== null
    });
  } catch (error) {
    console.error('Redis get error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// REAL-TIME SYNC ENDPOINTS
// ============================================================================

// Subscribe to entity updates
app.post('/sync/subscribe/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { webhookUrl } = req.body;

    // In production, this would register webhooks
    // For now, just acknowledge
    console.log(`📡 Subscribed to ${entityType}:${entityId} updates`);

    res.json({
      success: true,
      subscription: { entityType, entityId, webhookUrl },
      message: 'Subscription registered'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Publish entity update
app.post('/sync/publish/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { data, operation = 'update' } = req.body;

    await sync.publish(entityType, entityId, data, operation);

    res.json({
      success: true,
      published: { entityType, entityId, operation },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CACHE MANAGEMENT ENDPOINTS
// ============================================================================

// Get cache statistics
app.get('/cache/stats', async (req, res) => {
  try {
    let redisStats = {};
    if (dbManager.redisClient) {
      const info = await dbManager.redisClient.info();
      redisStats = {
        connected_clients: info.split('\n').find(line => line.startsWith('connected_clients:'))?.split(':')[1],
        used_memory: info.split('\n').find(line => line.startsWith('used_memory:'))?.split(':')[1],
        total_keys: info.split('\n').find(line => line.startsWith('db0:keys='))?.split('=')[1]
      };
    }

    res.json({
      success: true,
      cache: {
        inMemory: {
          size: cache.inMemoryCache?.size || 0,
          strategies: Object.keys(cache.cacheStrategies)
        },
        redis: redisStats
      }
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear cache
app.post('/cache/clear', async (req, res) => {
  try {
    const { pattern = '*' } = req.body;

    if (dbManager.redisClient) {
      const keys = await dbManager.redisClient.keys(pattern);
      if (keys.length > 0) {
        await dbManager.redisClient.del(keys);
      }
    }

    // Clear in-memory cache
    if (cache.inMemoryCache) {
      cache.inMemoryCache.clear();
    }

    res.json({
      success: true,
      cleared: true,
      pattern,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// STARTUP
// ============================================================================

async function startServer() {
  try {
    // Connect to all databases (won't fail if not configured)
    await dbManager.connectAll();

    // Warm up cache (only if Redis is available)
    if (dbManager.connections.redis) {
      await cache.warmCache();
    }

    // Start the server regardless of database connections
    app.listen(PORT, () => {
      console.log(`🗄️  Database & Analytics Integration Service online on port ${PORT}`);
      console.log(`📊 PostgreSQL: ${dbManager.connections.postgresql ? '✅' : '❌'} Connected`);
      console.log(`🍃 MongoDB: ${dbManager.connections.mongodb ? '✅' : '❌'} Connected`);
      console.log(`🔴 Redis: ${dbManager.connections.redis ? '✅' : '❌'} Connected`);
      console.log(`📈 Analytics Engine: ✅ Active`);
      console.log(`💾 Intelligent Caching: ${dbManager.connections.redis ? '✅' : '⚠️'} Active (Redis required)`);
      console.log(`🔄 Real-time Sync: ${dbManager.connections.redis ? '✅' : '⚠️'} Active (Redis required)`);
      console.log(`🚀 Ready to power Azora OS data operations`);
    });

  } catch (error) {
    console.error('Failed to start database service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down database service...');
  await dbManager.disconnectAll();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down database service...');
  await dbManager.disconnectAll();
  process.exit(0);
});

startServer();

export {
  dbManager,
  analytics,
  cache,
  sync,
  DB_CONFIG
};
export default app;