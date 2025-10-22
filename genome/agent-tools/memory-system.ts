/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';

export interface MemoryEntry {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: any;
  metadata: {
    userId?: string;
    context?: Record<string, any>;
    timestamp: Date;
    expiresAt?: Date;
    importance: number; // 0-1 scale
  };
  embedding?: number[]; // Vector embedding for semantic search
}

export interface ConversationContext {
  conversationId: string;
  userId: string;
  messages: Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>;
  context: Record<string, any>;
  lastActivity: Date;
}

export class MemorySystem {
  private redis: Redis;
  private postgres: Pool;
  private isInitialized: boolean = false;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    });

    this.postgres = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'azora_nexus',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
    });

    this.initializeConnections();
  }

  private async initializeConnections(): Promise<void> {
    try {
      // Test Redis connection
      await this.redis.ping();
      logger.info('Redis connection established');

      // Test PostgreSQL connection
      await this.postgres.query('SELECT NOW()');
      logger.info('PostgreSQL connection established');

      // Create tables if they don't exist
      await this.createTables();

      this.isInitialized = true;
      logger.info('Memory system initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize memory system', { error: error.message });
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const queries = [
      // Enable pgvector extension
      'CREATE EXTENSION IF NOT EXISTS vector;',

      // Episodic memory table (personal experiences)
      `CREATE TABLE IF NOT EXISTS episodic_memory (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        content JSONB,
        metadata JSONB,
        embedding vector(1536),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Semantic memory table (general knowledge)
      `CREATE TABLE IF NOT EXISTS semantic_memory (
        id VARCHAR(255) PRIMARY KEY,
        content JSONB,
        metadata JSONB,
        embedding vector(1536),
        importance FLOAT DEFAULT 0.5,
        access_count INTEGER DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Procedural memory table (learned procedures)
      `CREATE TABLE IF NOT EXISTS procedural_memory (
        id VARCHAR(255) PRIMARY KEY,
        procedure_name VARCHAR(255),
        steps JSONB,
        success_rate FLOAT DEFAULT 0.0,
        execution_count INTEGER DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // Create indexes for better performance
      'CREATE INDEX IF NOT EXISTS idx_episodic_user ON episodic_memory(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_episodic_timestamp ON episodic_memory(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_semantic_importance ON semantic_memory(importance);',
      'CREATE INDEX IF NOT EXISTS idx_semantic_access ON semantic_memory(last_accessed);',
      'CREATE INDEX IF NOT EXISTS idx_procedural_name ON procedural_memory(procedure_name);',
    ];

    for (const query of queries) {
      await this.postgres.query(query);
    }

    logger.info('Memory tables created successfully');
  }

  // Short-term memory methods (Redis)
  async storeShortTerm(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      logger.debug('Stored in short-term memory', { key, ttl: ttlSeconds });
    } catch (error) {
      logger.error('Failed to store in short-term memory', { key, error: error.message });
      throw error;
    }
  }

  async retrieveShortTerm(key: string): Promise<any> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Failed to retrieve from short-term memory', { key, error: error.message });
      return null;
    }
  }

  async deleteShortTerm(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug('Deleted from short-term memory', { key });
    } catch (error) {
      logger.error('Failed to delete from short-term memory', { key, error: error.message });
    }
  }

  // Conversation context management
  async storeConversationContext(context: ConversationContext): Promise<void> {
    const key = `conversation:${context.conversationId}`;
    await this.storeShortTerm(key, context, 3600); // 1 hour TTL
  }

  async getConversationContext(conversationId: string): Promise<ConversationContext | null> {
    const key = `conversation:${conversationId}`;
    return await this.retrieveShortTerm(key);
  }

  async updateConversationContext(conversationId: string, updates: Partial<ConversationContext>): Promise<void> {
    const existing = await this.getConversationContext(conversationId);
    if (existing) {
      const updated = { ...existing, ...updates, lastActivity: new Date() };
      await this.storeConversationContext(updated);
    }
  }

  // Long-term memory methods (PostgreSQL)
  async storeLongTerm(entry: MemoryEntry): Promise<void> {
    try {
      const table = this.getTableForType(entry.type);
      const query = `
        INSERT INTO ${table} (id, user_id, content, metadata, embedding, importance)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          metadata = EXCLUDED.metadata,
          embedding = EXCLUDED.embedding,
          importance = EXCLUDED.importance
      `;

      const values = [
        entry.id,
        entry.metadata.userId,
        JSON.stringify(entry.content),
        JSON.stringify(entry.metadata),
        entry.embedding ? `[${entry.embedding.join(',')}]` : null,
        entry.metadata.importance,
      ];

      await this.postgres.query(query, values);
      logger.debug('Stored in long-term memory', { id: entry.id, type: entry.type });

    } catch (error) {
      logger.error('Failed to store in long-term memory', { id: entry.id, error: error.message });
      throw error;
    }
  }

  async retrieveLongTerm(id: string, type: MemoryEntry['type']): Promise<MemoryEntry | null> {
    try {
      const table = this.getTableForType(type);
      const query = `SELECT * FROM ${table} WHERE id = $1`;
      const result = await this.postgres.query(query, [id]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        type,
        content: row.content,
        metadata: row.metadata,
        embedding: row.embedding,
      };
    } catch (error) {
      logger.error('Failed to retrieve from long-term memory', { id, type, error: error.message });
      return null;
    }
  }

  async semanticSearch(query: string, embedding: number[], limit: number = 10): Promise<MemoryEntry[]> {
    try {
      // Use cosine similarity for semantic search
      const queryText = `
        SELECT id, content, metadata, embedding, importance,
               1 - (embedding <=> $1::vector) as similarity
        FROM semantic_memory
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector
        LIMIT $2
      `;

      const result = await this.postgres.query(queryText, [`[${embedding.join(',')}]`, limit]);

      return result.rows.map(row => ({
        id: row.id,
        type: 'semantic' as const,
        content: row.content,
        metadata: row.metadata,
        embedding: row.embedding,
      }));

    } catch (error) {
      logger.error('Failed to perform semantic search', { query, error: error.message });
      return [];
    }
  }

  async getUserEpisodicMemory(userId: string, limit: number = 20): Promise<MemoryEntry[]> {
    try {
      const query = `
        SELECT * FROM episodic_memory
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;

      const result = await this.postgres.query(query, [userId, limit]);

      return result.rows.map(row => ({
        id: row.id,
        type: 'episodic' as const,
        content: row.content,
        metadata: row.metadata,
        embedding: row.embedding,
      }));

    } catch (error) {
      logger.error('Failed to get user episodic memory', { userId, error: error.message });
      return [];
    }
  }

  async storeLearnedProcedure(procedure: {
    name: string;
    steps: any[];
    successRate: number;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      const query = `
        INSERT INTO procedural_memory (id, procedure_name, steps, success_rate, metadata)
        VALUES (gen_random_uuid(), $1, $2, $3, $4)
        ON CONFLICT (procedure_name) DO UPDATE SET
          steps = EXCLUDED.steps,
          success_rate = EXCLUDED.success_rate,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
      `;

      await this.postgres.query(query, [
        procedure.name,
        JSON.stringify(procedure.steps),
        procedure.successRate,
        JSON.stringify(procedure.metadata),
      ]);

      logger.debug('Stored learned procedure', { name: procedure.name });

    } catch (error) {
      logger.error('Failed to store learned procedure', { name: procedure.name, error: error.message });
      throw error;
    }
  }

  async getLearnedProcedure(name: string): Promise<any> {
    try {
      const query = 'SELECT * FROM procedural_memory WHERE procedure_name = $1';
      const result = await this.postgres.query(query, [name]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.procedure_name,
        steps: row.steps,
        successRate: row.success_rate,
        executionCount: row.execution_count,
        metadata: row.metadata,
      };
    } catch (error) {
      logger.error('Failed to get learned procedure', { name, error: error.message });
      return null;
    }
  }

  private getTableForType(type: MemoryEntry['type']): string {
    switch (type) {
      case 'episodic': return 'episodic_memory';
      case 'semantic': return 'semantic_memory';
      case 'procedural': return 'procedural_memory';
      default: throw new Error(`Unknown memory type: ${type}`);
    }
  }

  // Cleanup and maintenance
  async cleanupExpiredMemories(): Promise<void> {
    try {
      // Clean up old episodic memories (older than 90 days)
      await this.postgres.query(`
        DELETE FROM episodic_memory
        WHERE created_at < NOW() - INTERVAL '90 days'
        AND (metadata->>'importance')::float < 0.7
      `);

      // Clean up low-importance semantic memories
      await this.postgres.query(`
        DELETE FROM semantic_memory
        WHERE importance < 0.3
        AND last_accessed < NOW() - INTERVAL '180 days'
      `);

      logger.info('Memory cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup memories', { error: error.message });
    }
  }

  async getMemoryStats(): Promise<{
    shortTerm: { keys: number };
    longTerm: {
      episodic: number;
      semantic: number;
      procedural: number;
    };
  }> {
    try {
      const shortTermKeys = await this.redis.dbsize();

      const episodicCount = await this.postgres.query('SELECT COUNT(*) FROM episodic_memory');
      const semanticCount = await this.postgres.query('SELECT COUNT(*) FROM semantic_memory');
      const proceduralCount = await this.postgres.query('SELECT COUNT(*) FROM procedural_memory');

      return {
        shortTerm: { keys: shortTermKeys },
        longTerm: {
          episodic: parseInt(episodicCount.rows[0].count),
          semantic: parseInt(semanticCount.rows[0].count),
          procedural: parseInt(proceduralCount.rows[0].count),
        },
      };
    } catch (error) {
      logger.error('Failed to get memory stats', { error: error.message });
      return {
        shortTerm: { keys: 0 },
        longTerm: { episodic: 0, semantic: 0, procedural: 0 },
      };
    }
  }

  // Generic store method for backwards compatibility
  async store(type: string, data: any, metadata?: any): Promise<void> {
    switch (type) {
      case 'user_profiles':
      case 'user_contexts':
      case 'agent_actions':
      case 'system_events':
      case 'completed_tasks':
      case 'successful_patterns':
      case 'failure_patterns':
        // Store in short-term memory with appropriate TTL
        const key = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const ttl = type.includes('events') || type.includes('tasks') ? 3600 : 86400; // 1 hour or 24 hours
        await this.storeShortTerm(key, { data, metadata, timestamp: new Date() }, ttl);
        break;
      default:
        // Store as long-term memory
        const entry: MemoryEntry = {
          id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'semantic',
          content: data,
          metadata: {
            ...metadata,
            timestamp: new Date(),
            importance: 0.5,
          },
        };
        await this.storeLongTerm(entry);
    }
  }

  // Generic retrieve method for backwards compatibility
  async retrieve(type: string, filter?: any): Promise<any[]> {
    // For now, return empty array as this is a simplified implementation
    // In a full implementation, this would search the appropriate storage
    return [];
  }

  async close(): Promise<void> {
    await this.redis.quit();
    await this.postgres.end();
    logger.info('Memory system connections closed');
  }
}

// Global memory system instance
export const memorySystem = new MemorySystem();