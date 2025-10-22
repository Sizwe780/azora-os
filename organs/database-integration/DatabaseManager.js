/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

export const DB_CONFIG = {
  postgresql: {
    get url() { return process.env.DATABASE_URL; },
    schema: 'public'
  },
  mongodb: {
    get uri() { return process.env.MONGO_URI; },
    database: 'azora_os'
  },
  redis: {
    get restUrl() { return process.env.UPSTASH_REDIS_REST_URL; },
    get restToken() { return process.env.UPSTASH_REDIS_REST_TOKEN; }
  }
};

export class DatabaseManager {
  constructor() {
    this.prisma = null;
    this.mongoClient = null;
    this.redisClient = null;
    this.connections = {
      postgresql: false,
      mongodb: false,
      redis: false
    };
  }

  async connectPostgreSQL() {
    try {
      console.log('🔄 Attempting PostgreSQL connection...');
      if (!process.env.DATABASE_URL) {
        console.log('⚠️  PostgreSQL DATABASE_URL not configured, skipping connection');
        this.connections.postgresql = false;
        return;
      }

      console.log('📍 PostgreSQL URL exists, attempting connection...');
      this.prisma = new PrismaClient({
        datasourceUrl: DB_CONFIG.postgresql.url
      });

      await this.prisma.$connect();
      this.connections.postgresql = true;
      console.log('✅ PostgreSQL connected via Prisma');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error.message);
      console.log('💡 Falling back to Redis-only mode for data storage');
      this.connections.postgresql = false;
      // Don't throw error, allow service to continue
    }
  }

  async connectMongoDB() {
    try {
      console.log('🔄 Attempting MongoDB connection...');
      if (!process.env.MONGO_URI) {
        console.log('⚠️  MongoDB MONGO_URI not configured, skipping connection');
        this.connections.mongodb = false;
        return;
      }

      console.log('📍 MongoDB URI exists, creating client...');
      this.mongoClient = new MongoClient(DB_CONFIG.mongodb.uri, {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000
      });
      console.log('🔗 Connecting to MongoDB...');
      await this.mongoClient.connect();
      this.mongoDb = this.mongoClient.db(DB_CONFIG.mongodb.database);
      this.connections.mongodb = true;
      console.log('✅ MongoDB connected');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('💡 Falling back to Redis for document storage');
      this.connections.mongodb = false;
      // Don't throw error, allow service to continue
    }
  }

  async connectRedis() {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.log('⚠️  Upstash Redis REST API not configured, skipping connection');
        this.connections.redis = false;
        return;
      }

      // Test connection with a simple PING command
      const response = await fetch(`${DB_CONFIG.redis.restUrl}/ping`, {
        headers: {
          'Authorization': `Bearer ${DB_CONFIG.redis.restToken}`
        }
      });

      if (response.ok) {
        this.redisClient = {
          restUrl: DB_CONFIG.redis.restUrl,
          restToken: DB_CONFIG.redis.restToken,
          isConnected: true
        };
        this.connections.redis = true;
        console.log('✅ Upstash Redis REST API connected');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Upstash Redis REST API connection failed:', error.message);
      this.connections.redis = false;
      // Don't throw error, allow service to continue
    }
  }

  async connectAll() {
    await Promise.allSettled([
      this.connectPostgreSQL(),
      this.connectMongoDB(),
      this.connectRedis()
    ]);

    const connectedCount = Object.values(this.connections).filter(Boolean).length;
    console.log(`🔗 Database connections: ${connectedCount}/3 active`);
  }

  async disconnectAll() {
    try {
      if (this.prisma) await this.prisma.$disconnect();
      if (this.mongoClient) await this.mongoClient.close();
      // Upstash Redis REST API doesn't require explicit disconnection
      if (this.redisClient) {
        this.redisClient.isConnected = false;
      }
      console.log('🔌 All database connections closed');
    } catch (error) {
      console.error('Error disconnecting databases:', error);
    }
  }

  getConnectionStatus() {
    return {
      postgresql: this.connections.postgresql,
      mongodb: this.connections.mongodb,
      redis: this.connections.redis,
      overall: Object.values(this.connections).every(Boolean)
    };
  }

  // Getter for backward compatibility
  get redis() {
    return this.redisClient;
  }
}