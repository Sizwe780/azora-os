/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { MongoClient } = require('mongodb');
const cron = require('node-cron');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.OFFLINE_SYNC_PORT || 4800;

// Database connections
let pgPool;
let redisClient;
let mongoClient;
let db;

// Initialize connections
async function initConnections() {
  try {
    // PostgreSQL
    pgPool = new Pool({
      connectionString: process.env.POSTGRES_URL || 'postgresql://azora_admin:password@postgres-primary:5432/azora_db',
      max: 20,
    });
    await pgPool.query('SELECT 1');
    console.log('✓ PostgreSQL connected');

    // Redis
    redisClient = new Redis(process.env.REDIS_URL || 'redis://redis-master:6379');
    await redisClient.ping();
    console.log('✓ Redis connected');

    // MongoDB
    mongoClient = new MongoClient(process.env.MONGODB_URL || 'mongodb://mongodb:27017');
    await mongoClient.connect();
    db = mongoClient.db('azora_sync');
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'offline-sync-service',
    timestamp: new Date().toISOString(),
    connections: {
      postgres: !!pgPool,
      redis: !!redisClient,
      mongodb: !!mongoClient
    }
  });
});

// Queue offline data for sync
app.post('/api/sync/queue', async (req, res) => {
  try {
    const { userId, action, data, timestamp } = req.body;
    
    const syncItem = {
      userId,
      action,
      data,
      timestamp: timestamp || new Date().toISOString(),
      synced: false,
      attempts: 0
    };

    // Store in MongoDB
    if (db) {
      await db.collection('sync_queue').insertOne(syncItem);
    }

    // Cache in Redis for quick access
    if (redisClient) {
      await redisClient.lpush(`sync:${userId}`, JSON.stringify(syncItem));
    }

    res.json({
      success: true,
      message: 'Queued for synchronization',
      id: syncItem._id
    });
  } catch (error) {
    console.error('Queue error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sync status
app.get('/api/sync/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let pending = 0;
    let synced = 0;

    if (db) {
      pending = await db.collection('sync_queue').countDocuments({ userId, synced: false });
      synced = await db.collection('sync_queue').countDocuments({ userId, synced: true });
    }

    res.json({
      userId,
      pending,
      synced,
      total: pending + synced,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process sync queue (called by cron)
async function processSyncQueue() {
  if (!db) return;

  try {
    const pendingItems = await db.collection('sync_queue')
      .find({ synced: false, attempts: { $lt: 3 } })
      .limit(100)
      .toArray();

    console.log(`Processing ${pendingItems.length} pending sync items...`);

    for (const item of pendingItems) {
      try {
        // Sync to PostgreSQL based on action
        switch (item.action) {
          case 'student_activity':
            if (pgPool) {
              await pgPool.query(
                'INSERT INTO student_activities (user_id, data, created_at) VALUES ($1, $2, $3)',
                [item.userId, JSON.stringify(item.data), item.timestamp]
              );
            }
            break;
          // Add more sync actions as needed
        }

        // Mark as synced
        await db.collection('sync_queue').updateOne(
          { _id: item._id },
          { $set: { synced: true, syncedAt: new Date() } }
        );

        console.log(`✓ Synced item ${item._id}`);
      } catch (error) {
        console.error(`Failed to sync item ${item._id}:`, error.message);
        
        // Increment attempts
        await db.collection('sync_queue').updateOne(
          { _id: item._id },
          { $inc: { attempts: 1 } }
        );
      }
    }
  } catch (error) {
    console.error('Sync processing error:', error);
  }
}

// Schedule sync every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('Running scheduled sync...');
  processSyncQueue();
});

// Start server
app.listen(PORT, async () => {
  await initConnections();
  console.log(`✅ Offline Sync Service running on port ${PORT}`);
  console.log(`📊 Sync interval: 5 minutes`);
  
  // Run initial sync
  setTimeout(processSyncQueue, 5000);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  if (pgPool) await pgPool.end();
  if (redisClient) redisClient.quit();
  if (mongoClient) await mongoClient.close();
  process.exit(0);
});
