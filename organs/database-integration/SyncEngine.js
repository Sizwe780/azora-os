/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export class SyncEngine {
  constructor(dbManager, cacheEngine) {
    this.dbManager = dbManager;
    this.cacheEngine = cacheEngine;
    this.syncJobs = new Map();
    this.syncInterval = 5 * 60 * 1000; // 5 minutes
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Start sync process
  async startSync(companyId, options = {}) {
    const syncId = `sync_${companyId}_${Date.now()}`;

    const syncJob = {
      id: syncId,
      companyId,
      status: 'running',
      startTime: new Date(),
      options: {
        fullSync: options.fullSync || false,
        tables: options.tables || ['employees', 'vehicles', 'trips', 'jobs'],
        ...options
      },
      progress: {
        total: 0,
        completed: 0,
        current: null
      },
      results: {
        synced: 0,
        skipped: 0,
        errors: 0,
        details: []
      }
    };

    this.syncJobs.set(syncId, syncJob);

    try {
      await this.performSync(syncJob);
      syncJob.status = 'completed';
      syncJob.endTime = new Date();
    } catch (error) {
      console.error('Sync failed:', error);
      syncJob.status = 'failed';
      syncJob.error = error.message;
      syncJob.endTime = new Date();
    }

    return syncJob;
  }

  async performSync(syncJob) {
    const { companyId, options } = syncJob;

    for (const table of options.tables) {
      try {
        syncJob.progress.current = table;
        await this.syncTable(companyId, table, syncJob, options.fullSync);
        syncJob.progress.completed++;
      } catch (error) {
        console.error(`Failed to sync table ${table}:`, error);
        syncJob.results.errors++;
        syncJob.results.details.push({
          table,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    syncJob.progress.total = options.tables.length;
  }

  async syncTable(companyId, table, syncJob, fullSync = false) {
    let lastSync = null;

    if (!fullSync) {
      lastSync = await this.getLastSyncTime(companyId, table);
    }

    const data = await this.fetchTableData(table, companyId, lastSync);
    const synced = await this.syncToMongoDB(table, data, companyId);

    syncJob.results.synced += synced.synced;
    syncJob.results.skipped += synced.skipped;

    // Update last sync time
    await this.updateLastSyncTime(companyId, table);

    // Invalidate related cache
    await this.invalidateTableCache(companyId, table);
  }

  async fetchTableData(table, companyId, lastSync) {
    const whereClause = { companyId };
    if (lastSync) {
      whereClause.updatedAt = { gt: lastSync };
    }

    switch (table) {
      case 'employees':
        return await this.dbManager.prisma.employee.findMany({
          where: whereClause,
          include: {
            department: true,
            position: true,
            manager: true
          }
        });

      case 'vehicles':
        return await this.dbManager.prisma.vehicle.findMany({
          where: whereClause,
          include: {
            vehicleType: true,
            currentLocation: true
          }
        });

      case 'trips':
        return await this.dbManager.prisma.trip.findMany({
          where: whereClause,
          include: {
            vehicle: true,
            driver: true,
            route: true
          }
        });

      case 'jobs':
        return await this.dbManager.prisma.job.findMany({
          where: whereClause,
          include: {
            assignedTo: true,
            vehicle: true,
            customer: true
          }
        });

      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  async syncToMongoDB(table, data, companyId) {
    if (!this.dbManager.mongoDb) {
      throw new Error('MongoDB not available for sync');
    }

    const collection = this.dbManager.mongoDb.collection(table);

    let synced = 0;
    let skipped = 0;

    for (const item of data) {
      try {
        // Check if item already exists
        const existing = await collection.findOne({
          id: item.id,
          companyId
        });

        if (existing) {
          // Update existing
          await collection.updateOne(
            { id: item.id, companyId },
            {
              $set: {
                ...item,
                syncedAt: new Date(),
                version: (existing.version || 0) + 1
              }
            }
          );
        } else {
          // Insert new
          await collection.insertOne({
            ...item,
            companyId,
            syncedAt: new Date(),
            version: 1
          });
        }

        synced++;
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        skipped++;
      }
    }

    return { synced, skipped };
  }

  async getLastSyncTime(companyId, table) {
    if (!this.dbManager.mongoDb) return null;

    const collection = this.dbManager.mongoDb.collection('sync_metadata');

    const metadata = await collection.findOne({
      companyId,
      table
    });

    return metadata?.lastSync || null;
  }

  async updateLastSyncTime(companyId, table) {
    if (!this.dbManager.mongoDb) return;

    const collection = this.dbManager.mongoDb.collection('sync_metadata');

    await collection.updateOne(
      { companyId, table },
      {
        $set: {
          lastSync: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  async invalidateTableCache(companyId, table) {
    const patterns = [
      `${table}:${companyId}:*`,
      `company:${companyId}:${table}:*`,
      `analytics:${companyId}:*`
    ];

    for (const pattern of patterns) {
      await this.cacheEngine.invalidate(pattern);
    }
  }

  // Get sync status
  getSyncStatus(syncId) {
    return this.syncJobs.get(syncId) || null;
  }

  // Get all active sync jobs
  getActiveSyncs() {
    return Array.from(this.syncJobs.values()).filter(job => job.status === 'running');
  }

  // Cancel sync job
  async cancelSync(syncId) {
    const job = this.syncJobs.get(syncId);
    if (job && job.status === 'running') {
      job.status = 'cancelled';
      job.endTime = new Date();
      return true;
    }
    return false;
  }

  // Clean up old sync jobs
  cleanupOldJobs(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - maxAge;

    for (const [id, job] of this.syncJobs) {
      if (job.endTime && job.endTime.getTime() < cutoff) {
        this.syncJobs.delete(id);
      }
    }
  }

  // Real-time sync for critical data
  async syncCriticalData(companyId, dataType, data) {
    try {
      await this.syncToMongoDB(dataType, [data], companyId);

      // Invalidate cache immediately
      await this.invalidateTableCache(companyId, dataType);

      return { success: true };
    } catch (error) {
      console.error('Critical data sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Bulk sync with progress tracking
  async bulkSync(companyId, tables, onProgress = null) {
    const syncId = `bulk_sync_${companyId}_${Date.now()}`;

    const syncJob = {
      id: syncId,
      companyId,
      status: 'running',
      startTime: new Date(),
      options: { tables, fullSync: true },
      progress: { total: tables.length, completed: 0, current: null },
      results: { synced: 0, skipped: 0, errors: 0, details: [] }
    };

    this.syncJobs.set(syncId, syncJob);

    try {
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        syncJob.progress.current = table;

        try {
          await this.syncTable(companyId, table, syncJob, true);
          syncJob.progress.completed = i + 1;

          if (onProgress) {
            onProgress({
              table,
              completed: i + 1,
              total: tables.length,
              results: syncJob.results
            });
          }
        } catch (error) {
          syncJob.results.errors++;
          syncJob.results.details.push({
            table,
            error: error.message,
            timestamp: new Date()
          });
        }
      }

      syncJob.status = 'completed';
      syncJob.endTime = new Date();
    } catch (error) {
      syncJob.status = 'failed';
      syncJob.error = error.message;
      syncJob.endTime = new Date();
    }

    return syncJob;
  }

  // Publish entity update for real-time sync
  async publish(entityType, entityId, data, operation = 'update') {
    try {
      // Store in MongoDB for persistence
      if (this.dbManager.mongoDb) {
        const collection = this.dbManager.mongoDb.collection('entity_updates');
        await collection.insertOne({
          entityType,
          entityId,
          data,
          operation,
          timestamp: new Date(),
          processed: false
        });
      }

      // Publish to Redis pub/sub if available
      if (this.dbManager.redis) {
        const channel = `entity:${entityType}:${entityId}`;
        const message = JSON.stringify({
          entityType,
          entityId,
          data,
          operation,
          timestamp: new Date()
        });

        await this.dbManager.redis.publish(channel, message);
      }

      // Invalidate related cache
      await this.cacheEngine.invalidate(`${entityType}:${entityId}:*`);

      return { success: true };
    } catch (error) {
      console.error('Publish error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get sync statistics
  async getSyncStats(companyId) {
    if (!this.dbManager.mongoDb) return null;

    const collection = this.dbManager.mongoDb.collection('sync_metadata');

    const stats = await collection.aggregate([
      { $match: { companyId } },
      {
        $group: {
          _id: null,
          totalTables: { $sum: 1 },
          lastSync: { $max: '$lastSync' },
          avgSyncInterval: { $avg: { $subtract: [new Date(), '$lastSync'] } }
        }
      }
    ]).toArray();

    return stats[0] || {
      totalTables: 0,
      lastSync: null,
      avgSyncInterval: 0
    };
  }
}