/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export class CacheEngine {
  constructor(dbManager) {
    this.dbManager = dbManager;
    this.ttl = 3600; // 1 hour default TTL
    this.inMemoryCache = new Map();
    this.cacheStrategies = {
      lru: 'Least Recently Used',
      ttl: 'Time To Live',
      writeThrough: 'Write Through',
      writeBack: 'Write Back'
    };
  }

  // Helper method for Upstash REST API calls
  async restCall(command, args = []) {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) {
      throw new Error('Redis REST API not available');
    }

    const url = `${this.dbManager.redisClient.restUrl}/${command}`;
    const headers = {
      'Authorization': `Bearer ${this.dbManager.redisClient.restToken}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(args)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('Upstash REST API error:', error);
      throw error;
    }
  }

  // Set cache value with TTL
  async set(key, value, ttl = this.ttl) {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) {
      console.warn('Redis REST API not available, skipping cache set');
      return false;
    }

    try {
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        ttl
      });

      await this.restCall('setex', [key, ttl.toString(), serializedValue]);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Get cache value
  async get(key) {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) {
      console.warn('Redis REST API not available, skipping cache get');
      return null;
    }

    try {
      const cached = await this.restCall('get', [key]);
      if (!cached) return null;

      const parsed = JSON.parse(cached);

      // Check if expired
      if (Date.now() - parsed.timestamp > parsed.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Cache get error:', error);
      await this.delete(key); // Remove corrupted cache
      return null;
    }
  }

  // Delete cache key
  async delete(key) {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) return false;

    try {
      await this.restCall('del', [key]);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) return false;

    try {
      const result = await this.restCall('exists', [key]);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Get cache TTL
  async getTTL(key) {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) return -1;

    try {
      return await this.restCall('ttl', [key]);
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -1;
    }
  }

  // Set multiple keys
  async mset(keyValuePairs, ttl = this.ttl) {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) return false;

    try {
      // Upstash doesn't have a direct mset with TTL, so we'll set each key individually
      const promises = Object.entries(keyValuePairs).map(async ([key, value]) => {
        const serializedValue = JSON.stringify({
          data: value,
          timestamp: Date.now(),
          ttl
        });
        return this.restCall('setex', [key, ttl.toString(), serializedValue]);
      });

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Get multiple keys
  async mget(keys) {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) return new Array(keys.length).fill(null);

    try {
      const promises = keys.map(key => this.restCall('get', [key]));
      const cached = await Promise.all(promises);

      return cached.map((item, index) => {
        if (!item) return null;

        try {
          const parsed = JSON.parse(item);

          // Check if expired
          if (Date.now() - parsed.timestamp > parsed.ttl * 1000) {
            this.delete(keys[index]);
            return null;
          }

          return parsed.data;
        } catch (error) {
          console.error('Cache mget parse error:', error);
          this.delete(keys[index]);
          return null;
        }
      });
    } catch (error) {
      console.error('Cache mget error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  // Clear all cache
  async clear(pattern = '*') {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) return false;

    try {
      // Get all keys matching pattern
      const keys = await this.getKeys(pattern);
      if (keys.length > 0) {
        // Delete keys in batches to avoid overwhelming the API
        const batchSize = 100;
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize);
          await Promise.all(batch.map(key => this.restCall('del', [key])));
        }
      }
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

    // Get cache statistics
  async getStats() {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) {
      return { available: false, keys: 0, memory: 0 };
    }

    try {
      // Get database size (number of keys)
      const keys = await this.restCall('dbsize', []);

      // Get memory info
      const info = await this.restCall('info', ['memory']);
      const memory = this.parseMemoryInfo(info);

      return {
        available: true,
        keys,
        memory,
        hitRate: 0, // Would need additional tracking for hit rate
        uptime: 0 // Would need to track uptime
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { available: false, keys: 0, memory: 0, error: error.message };
    }
  }

  parseMemoryInfo(info) {
    if (typeof info === 'string') {
      const lines = info.split('\n');
      for (const line of lines) {
        if (line.startsWith('used_memory:')) {
          return parseInt(line.split(':')[1]);
        }
      }
    }
    return 0;
  }

  // Set cache TTL for existing key
  async expire(key, ttl) {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) return false;

    try {
      return await this.restCall('expire', [key, ttl.toString()]);
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  // Get all keys matching pattern
  async getKeys(pattern = '*') {
    if (!this.dbManager.redisClient || !this.dbManager.redisClient.isConnected) return [];

    try {
      return await this.restCall('keys', [pattern]);
    } catch (error) {
      console.error('Cache getKeys error:', error);
      return [];
    }
  }

  // Cache with fallback to database
  async getOrSet(key, fetcher, ttl = this.ttl) {
    // Try cache first
    let data = await this.get(key);
    if (data !== null) {
      return data;
    }

    // Fetch from source
    try {
      data = await fetcher();

      // Cache the result
      await this.set(key, data, ttl);

      return data;
    } catch (error) {
      console.error('Cache fallback fetch error:', error);
      throw error;
    }
  }

  // Invalidate cache by pattern
  async invalidate(pattern) {
    return await this.clear(pattern);
  }

  // Increment numeric value
  async increment(key, amount = 1) {
    if (!this.dbManager.redis) return null;

    try {
      // Get current value
      const current = await this.get(key) || 0;
      const newValue = current + amount;

      // Set new value
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      console.error('Cache increment error:', error);
      return null;
    }
  }

  // Decrement numeric value
  async decrement(key, amount = 1) {
    return await this.increment(key, -amount);
  }

  // Warm up cache with frequently accessed data
  async warmCache() {
    try {
      console.log('🔥 Warming up cache...');

      // This would typically load frequently accessed data
      // For now, just initialize the cache
      this.inMemoryCache.clear();

      console.log('✅ Cache warmed up');
    } catch (error) {
      console.error('Cache warm up error:', error);
    }
  }
}