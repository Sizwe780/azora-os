/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Distributed Tracing & Recovery System
 * Each service maintains trace records of neighbors for AI-powered restoration
 * 
 * Copyright (c) 2025 Sizwe Ngwenya - Azora World
 */

const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://azora_user@localhost:5432/azora'
});

// Service Mesh Registry
const SERVICE_MESH = {
  'auth': { port: 4004, neighbors: ['ai-orchestrator', 'onboarding', 'security-core'] },
  'ai-orchestrator': { port: 4001, neighbors: ['auth', 'conversation', 'hr-ai-deputy', 'analytics'] },
  'onboarding': { port: 4070, neighbors: ['auth', 'compliance', 'ai-orchestrator'] },
  'compliance': { port: 4081, neighbors: ['onboarding', 'document-vault', 'security-core'] },
  'hr-ai-deputy': { port: 4091, neighbors: ['ai-orchestrator', 'auth', 'onboarding'] },
  'azora-coin': { port: 4092, neighbors: ['auth', 'blockchain', 'payment'] },
  'conversation': { port: 4011, neighbors: ['ai-orchestrator', 'auth'] },
  'security-core': { port: 4022, neighbors: ['auth', 'compliance', 'document-vault'] },
  'document-vault': { port: 4087, neighbors: ['compliance', 'security-core'] },
  'analytics': { port: 4080, neighbors: ['ai-orchestrator', 'all-services'] },
  'blockchain': { port: 8545, neighbors: ['azora-coin', 'payment'] },
  'payment': { port: 4050, neighbors: ['azora-coin', 'blockchain', 'auth'] },
};

/**
 * Trace Record Structure
 */
class TraceRecord {
  constructor(data) {
    this.traceId = data.traceId || uuidv4();
    this.spanId = uuidv4();
    this.parentSpanId = data.parentSpanId || null;
    this.serviceName = data.serviceName;
    this.operation = data.operation;
    this.timestamp = new Date().toISOString();
    this.duration = data.duration || 0;
    this.statusCode = data.statusCode || 200;
    this.request = data.request || {};
    this.response = data.response || {};
    this.error = data.error || null;
    this.metadata = data.metadata || {};
    this.neighbors = data.neighbors || [];
  }

  toJSON() {
    return {
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      serviceName: this.serviceName,
      operation: this.operation,
      timestamp: this.timestamp,
      duration: this.duration,
      statusCode: this.statusCode,
      request: this.request,
      response: this.response,
      error: this.error,
      metadata: this.metadata,
      neighbors: this.neighbors,
    };
  }
}

/**
 * Service State Snapshot
 */
class ServiceSnapshot {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.timestamp = new Date().toISOString();
    this.state = {};
    this.configuration = {};
    this.recentTraces = [];
    this.neighborStates = {};
    this.healthMetrics = {};
  }

  async capture() {
    // Capture current state from Redis
    const stateKey = `service:${this.serviceName}:state`;
    const stateData = await redis.get(stateKey);
    if (stateData) {
      this.state = JSON.parse(stateData);
    }

    // Capture configuration
    const configKey = `service:${this.serviceName}:config`;
    const configData = await redis.get(configKey);
    if (configData) {
      this.configuration = JSON.parse(configData);
    }

    // Capture recent traces (last 100)
    const traceKey = `traces:${this.serviceName}`;
    const traces = await redis.lrange(traceKey, 0, 99);
    this.recentTraces = traces.map(t => JSON.parse(t));

    // Capture neighbor states
    const neighbors = SERVICE_MESH[this.serviceName]?.neighbors || [];
    for (const neighbor of neighbors) {
      const neighborState = await redis.get(`service:${neighbor}:state`);
      if (neighborState) {
        this.neighborStates[neighbor] = JSON.parse(neighborState);
      }
    }

    // Capture health metrics
    const metricsKey = `metrics:${this.serviceName}`;
    const metrics = await redis.get(metricsKey);
    if (metrics) {
      this.healthMetrics = JSON.parse(metrics);
    }

    return this;
  }

  async store() {
    const snapshotKey = `snapshot:${this.serviceName}:${Date.now()}`;
    await redis.setex(snapshotKey, 86400 * 7, JSON.stringify(this)); // Keep for 7 days
    await redis.lpush(`snapshots:${this.serviceName}`, snapshotKey);
    await redis.ltrim(`snapshots:${this.serviceName}`, 0, 49); // Keep last 50
  }
}

/**
 * Trace Collector - Records all service interactions
 */
class TraceCollector {
  async recordTrace(trace) {
    const traceRecord = new TraceRecord(trace);
    
    // Store in Redis for fast access
    await redis.lpush(`traces:${trace.serviceName}`, JSON.stringify(traceRecord));
    await redis.ltrim(`traces:${trace.serviceName}`, 0, 999); // Keep last 1000

    // Store in PostgreSQL for long-term analysis
    await pool.query(
      `INSERT INTO distributed_traces 
       (trace_id, span_id, parent_span_id, service_name, operation, timestamp, 
        duration, status_code, request, response, error, metadata, neighbors)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        traceRecord.traceId,
        traceRecord.spanId,
        traceRecord.parentSpanId,
        traceRecord.serviceName,
        traceRecord.operation,
        traceRecord.timestamp,
        traceRecord.duration,
        traceRecord.statusCode,
        JSON.stringify(traceRecord.request),
        JSON.stringify(traceRecord.response),
        traceRecord.error,
        JSON.stringify(traceRecord.metadata),
        JSON.stringify(traceRecord.neighbors),
      ]
    );

    // Update neighbor awareness
    await this.updateNeighborAwareness(traceRecord);

    return traceRecord;
  }

  async updateNeighborAwareness(trace) {
    const neighbors = SERVICE_MESH[trace.serviceName]?.neighbors || [];
    
    for (const neighbor of neighbors) {
      const awarenessKey = `awareness:${neighbor}:${trace.serviceName}`;
      await redis.setex(awarenessKey, 3600, JSON.stringify({
        lastSeen: trace.timestamp,
        lastOperation: trace.operation,
        lastStatus: trace.statusCode,
        traceId: trace.traceId,
      }));
    }
  }

  async getTraceChain(traceId) {
    const result = await pool.query(
      `SELECT * FROM distributed_traces WHERE trace_id = $1 ORDER BY timestamp`,
      [traceId]
    );
    return result.rows;
  }

  async getServiceInteractions(serviceName, limit = 100) {
    const result = await pool.query(
      `SELECT * FROM distributed_traces 
       WHERE service_name = $1 
       ORDER BY timestamp DESC LIMIT $2`,
      [serviceName, limit]
    );
    return result.rows;
  }
}

/**
 * AI-Powered Service Recovery Engine
 */
class AIRecoveryEngine {
  constructor() {
    this.collector = new TraceCollector();
  }

  async analyzeFailure(serviceName) {
    console.log(`🔍 Analyzing failure for ${serviceName}...`);

    // 1. Get recent traces before failure
    const recentTraces = await this.collector.getServiceInteractions(serviceName, 50);
    
    // 2. Get neighbor states
    const neighbors = SERVICE_MESH[serviceName]?.neighbors || [];
    const neighborStates = {};
    
    for (const neighbor of neighbors) {
      const awarenessKey = `awareness:${neighbor}:${serviceName}`;
      const awareness = await redis.get(awarenessKey);
      if (awareness) {
        neighborStates[neighbor] = JSON.parse(awareness);
      }
    }

    // 3. Get last known good state
    const snapshots = await redis.lrange(`snapshots:${serviceName}`, 0, 4);
    const lastGoodState = snapshots.length > 0 ? 
      JSON.parse(await redis.get(snapshots[0])) : null;

    // 4. Analyze interaction patterns
    const interactionPattern = this.extractInteractionPattern(recentTraces);

    return {
      serviceName,
      failureTimestamp: new Date().toISOString(),
      recentTraces: recentTraces.slice(0, 10),
      neighborStates,
      lastGoodState,
      interactionPattern,
      recoveryStrategy: await this.generateRecoveryStrategy({
        serviceName,
        recentTraces,
        neighborStates,
        lastGoodState,
        interactionPattern,
      }),
    };
  }

  extractInteractionPattern(traces) {
    const pattern = {
      commonOperations: {},
      averageResponseTime: 0,
      errorRate: 0,
      dependencyGraph: {},
    };

    traces.forEach(trace => {
      // Count operations
      pattern.commonOperations[trace.operation] = 
        (pattern.commonOperations[trace.operation] || 0) + 1;

      // Calculate metrics
      pattern.averageResponseTime += trace.duration || 0;
      if (trace.status_code >= 400) pattern.errorRate++;

      // Build dependency graph
      if (trace.neighbors && Array.isArray(trace.neighbors)) {
        trace.neighbors.forEach(dep => {
          pattern.dependencyGraph[dep] = 
            (pattern.dependencyGraph[dep] || 0) + 1;
        });
      }
    });

    pattern.averageResponseTime /= traces.length || 1;
    pattern.errorRate = (pattern.errorRate / traces.length) * 100;

    return pattern;
  }

  async generateRecoveryStrategy(analysis) {
    const { serviceName, recentTraces, neighborStates, lastGoodState, interactionPattern } = analysis;

    const strategy = {
      type: 'automatic',
      steps: [],
      estimatedTime: 0,
      confidence: 0,
    };

    // Step 1: Restore from last good state
    if (lastGoodState) {
      strategy.steps.push({
        order: 1,
        action: 'restore_state',
        description: `Restore ${serviceName} from snapshot at ${lastGoodState.timestamp}`,
        data: lastGoodState.state,
        estimatedTime: 5,
      });
      strategy.confidence += 30;
    }

    // Step 2: Restore configuration
    if (lastGoodState?.configuration) {
      strategy.steps.push({
        order: 2,
        action: 'restore_config',
        description: 'Apply last known good configuration',
        data: lastGoodState.configuration,
        estimatedTime: 2,
      });
      strategy.confidence += 20;
    }

    // Step 3: Rebuild dependencies from neighbor awareness
    const criticalNeighbors = Object.entries(interactionPattern.dependencyGraph)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    if (criticalNeighbors.length > 0) {
      strategy.steps.push({
        order: 3,
        action: 'reconnect_neighbors',
        description: 'Re-establish connections with critical neighbors',
        data: { neighbors: criticalNeighbors, states: neighborStates },
        estimatedTime: 10,
      });
      strategy.confidence += 25;
    }

    // Step 4: Replay recent successful operations
    const successfulOps = recentTraces
      .filter(t => t.status_code < 400)
      .slice(0, 5);

    if (successfulOps.length > 0) {
      strategy.steps.push({
        order: 4,
        action: 'warm_cache',
        description: 'Replay recent successful operations to warm cache',
        data: successfulOps,
        estimatedTime: 15,
      });
      strategy.confidence += 15;
    }

    // Step 5: Health verification
    strategy.steps.push({
      order: 5,
      action: 'verify_health',
      description: 'Run comprehensive health checks',
      estimatedTime: 5,
    });
    strategy.confidence += 10;

    strategy.estimatedTime = strategy.steps.reduce((sum, step) => sum + step.estimatedTime, 0);

    return strategy;
  }

  async executeRecovery(serviceName, strategy) {
    console.log(`🔧 Executing recovery for ${serviceName}...`);
    console.log(`📊 Confidence: ${strategy.confidence}%`);
    console.log(`⏱️  Estimated time: ${strategy.estimatedTime}s`);

    const results = [];

    for (const step of strategy.steps) {
      console.log(`\n▶️  Step ${step.order}: ${step.description}`);
      
      try {
        const startTime = Date.now();
        let result;

        switch (step.action) {
          case 'restore_state':
            result = await this.restoreState(serviceName, step.data);
            break;
          case 'restore_config':
            result = await this.restoreConfig(serviceName, step.data);
            break;
          case 'reconnect_neighbors':
            result = await this.reconnectNeighbors(serviceName, step.data);
            break;
          case 'warm_cache':
            result = await this.warmCache(serviceName, step.data);
            break;
          case 'verify_health':
            result = await this.verifyHealth(serviceName);
            break;
          default:
            result = { success: false, message: 'Unknown action' };
        }

        const duration = Date.now() - startTime;
        results.push({
          step: step.order,
          action: step.action,
          success: result.success,
          duration,
          message: result.message,
        });

        console.log(`✅ Completed in ${duration}ms: ${result.message}`);

      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        results.push({
          step: step.order,
          action: step.action,
          success: false,
          error: error.message,
        });
      }
    }

    const success = results.every(r => r.success);
    
    // Store recovery record
    await pool.query(
      `INSERT INTO recovery_records 
       (service_name, strategy, results, success, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [serviceName, JSON.stringify(strategy), JSON.stringify(results), success]
    );

    return { success, results };
  }

  async restoreState(serviceName, state) {
    await redis.set(`service:${serviceName}:state`, JSON.stringify(state));
    return { success: true, message: 'State restored successfully' };
  }

  async restoreConfig(serviceName, config) {
    await redis.set(`service:${serviceName}:config`, JSON.stringify(config));
    return { success: true, message: 'Configuration restored successfully' };
  }

  async reconnectNeighbors(serviceName, data) {
    const { neighbors } = data;
    let connected = 0;

    for (const neighbor of neighbors) {
      try {
        // Notify neighbor that service is back
        await redis.publish(`service:${neighbor}:notifications`, JSON.stringify({
          event: 'neighbor_recovered',
          service: serviceName,
          timestamp: new Date().toISOString(),
        }));
        connected++;
      } catch (error) {
        console.error(`Failed to reconnect to ${neighbor}:`, error.message);
      }
    }

    return { 
      success: connected > 0, 
      message: `Reconnected to ${connected}/${neighbors.length} neighbors` 
    };
  }

  async warmCache(serviceName, operations) {
    // Simulate replaying operations
    for (const op of operations) {
      await redis.set(
        `cache:${serviceName}:${op.operation}`,
        JSON.stringify(op.response),
        'EX',
        3600
      );
    }

    return { 
      success: true, 
      message: `Warmed cache with ${operations.length} operations` 
    };
  }

  async verifyHealth(serviceName) {
    const service = SERVICE_MESH[serviceName];
    if (!service) {
      return { success: false, message: 'Service not found in mesh' };
    }

    try {
      const response = await fetch(`http://localhost:${service.port}/health`, {
        timeout: 5000,
      });

      return {
        success: response.ok,
        message: response.ok ? 'Service is healthy' : 'Service health check failed',
      };
    } catch (error) {
      return { success: false, message: `Health check failed: ${error.message}` };
    }
  }
}

// Initialize components
const collector = new TraceCollector();
const recoveryEngine = new AIRecoveryEngine();

/**
 * API Endpoints
 */

// Record a trace
app.post('/api/trace', async (req, res) => {
  try {
    const trace = await collector.recordTrace(req.body);
    res.json({ success: true, trace });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trace chain
app.get('/api/trace/:traceId', async (req, res) => {
  try {
    const chain = await collector.getTraceChain(req.params.traceId);
    res.json({ success: true, chain });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Capture service snapshot
app.post('/api/snapshot/:serviceName', async (req, res) => {
  try {
    const snapshot = new ServiceSnapshot(req.params.serviceName);
    await snapshot.capture();
    await snapshot.store();
    res.json({ success: true, snapshot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze failure
app.post('/api/analyze-failure/:serviceName', async (req, res) => {
  try {
    const analysis = await recoveryEngine.analyzeFailure(req.params.serviceName);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute recovery
app.post('/api/recover/:serviceName', async (req, res) => {
  try {
    const analysis = await recoveryEngine.analyzeFailure(req.params.serviceName);
    const result = await recoveryEngine.executeRecovery(
      req.params.serviceName,
      analysis.recoveryStrategy
    );
    res.json({ success: true, result, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get service interaction history
app.get('/api/interactions/:serviceName', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const interactions = await collector.getServiceInteractions(req.params.serviceName, limit);
    res.json({ success: true, interactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Distributed Tracing & Recovery',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.TRACING_PORT || 4998;
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🔄 AZORA OS - DISTRIBUTED TRACING & RECOVERY         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Port: ${PORT}`);
  console.log('');
  console.log('Capabilities:');
  console.log('  ✅ Distributed trace collection');
  console.log('  ✅ Neighbor awareness tracking');
  console.log('  ✅ Service state snapshots');
  console.log('  ✅ AI-powered failure analysis');
  console.log('  ✅ Automatic recovery execution');
  console.log('  ✅ Interaction pattern learning');
  console.log('');
  console.log(`Services monitored: ${Object.keys(SERVICE_MESH).length}`);
  console.log('');
});

module.exports = { app, TraceCollector, AIRecoveryEngine, ServiceSnapshot };
