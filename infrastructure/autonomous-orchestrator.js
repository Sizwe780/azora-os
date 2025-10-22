/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Autonomous Self-Healing Infrastructure Orchestrator
 * Monitors all services, detects failures, and automatically heals
 * 
 * Copyright (c) 2025 Sizwe Ngwenya - Azora World (Pty) Ltd
 */

const express = require('express');
const axios = require('axios');
const Docker = require('dockerode');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
const docker = new Docker();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Service Registry - All Azora OS Services
const SERVICES = [
  { name: 'auth', port: 4004, path: '/health', critical: true },
  { name: 'ai-orchestrator', port: 4001, path: '/health', critical: true },
  { name: 'onboarding', port: 4070, path: '/health', critical: false },
  { name: 'compliance', port: 4081, path: '/health', critical: true },
  { name: 'hr-ai-deputy', port: 4091, path: '/health', critical: true },
  { name: 'azora-coin-integration', port: 4092, path: '/health', critical: true },
  { name: 'conversation', port: 4011, path: '/health', critical: false },
  { name: 'security-core', port: 4022, path: '/health', critical: true },
  { name: 'document-vault', port: 4087, path: '/health', critical: false },
  { name: 'analytics', port: 4080, path: '/health', critical: false },
  { name: 'blockchain', port: 8545, path: '/', critical: true },
];

// Service Health Status
const serviceHealth = new Map();

// Initialize health tracking
SERVICES.forEach(service => {
  serviceHealth.set(service.name, {
    status: 'unknown',
    lastCheck: null,
    failures: 0,
    recoveries: 0,
    uptime: 0,
  });
});

/**
 * Health Check Function
 */
async function checkServiceHealth(service) {
  try {
    const response = await axios.get(`http://localhost:${service.port}${service.path}`, {
      timeout: 5000,
    });
    
    const health = serviceHealth.get(service.name);
    const wasDown = health.status === 'down';
    
    health.status = 'healthy';
    health.lastCheck = new Date();
    health.failures = 0;
    
    if (wasDown) {
      health.recoveries++;
      console.log(`✅ Service ${service.name} recovered automatically`);
      await notifyRecovery(service.name);
    }
    
    return true;
  } catch (error) {
    const health = serviceHealth.get(service.name);
    health.status = 'down';
    health.failures++;
    health.lastCheck = new Date();
    
    console.error(`❌ Service ${service.name} is down (failures: ${health.failures})`);
    
    // Auto-heal after 3 failures
    if (health.failures >= 3) {
      await healService(service);
    }
    
    return false;
  }
}

/**
 * Auto-Healing Function
 */
async function healService(service) {
  console.log(`🔧 Attempting to heal ${service.name}...`);
  
  try {
    // Try to restart the Docker container
    const containers = await docker.listContainers({ all: true });
    const container = containers.find(c => 
      c.Names.some(name => name.includes(service.name))
    );
    
    if (container) {
      const dockerContainer = docker.getContainer(container.Id);
      
      // If stopped, start it
      if (container.State === 'exited') {
        await dockerContainer.start();
        console.log(`🚀 Started container for ${service.name}`);
      } else {
        // If running but unhealthy, restart it
        await dockerContainer.restart();
        console.log(`🔄 Restarted container for ${service.name}`);
      }
      
      // Wait for service to come up
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check if healing worked
      const isHealthy = await checkServiceHealth(service);
      if (isHealthy) {
        console.log(`✅ Successfully healed ${service.name}`);
        await notifyHealing(service.name);
      } else {
        console.log(`⚠️ Failed to heal ${service.name}, escalating...`);
        await escalateIssue(service);
      }
    } else {
      console.log(`❌ Container not found for ${service.name}`);
    }
  } catch (error) {
    console.error(`Failed to heal ${service.name}:`, error.message);
    await escalateIssue(service);
  }
}

/**
 * Issue Escalation
 */
async function escalateIssue(service) {
  console.log(`🚨 ESCALATING: ${service.name} could not be auto-healed`);
  
  // Store in Redis for admin dashboard
  await redis.lpush('critical_issues', JSON.stringify({
    service: service.name,
    timestamp: new Date().toISOString(),
    message: 'Auto-healing failed, manual intervention required',
  }));
  
  // If critical service, send alerts
  if (service.critical) {
    await sendCriticalAlert(service.name);
  }
}

/**
 * Notifications
 */
async function notifyRecovery(serviceName) {
  await redis.lpush('recoveries', JSON.stringify({
    service: serviceName,
    timestamp: new Date().toISOString(),
    message: 'Service recovered automatically',
  }));
}

async function notifyHealing(serviceName) {
  await redis.lpush('healings', JSON.stringify({
    service: serviceName,
    timestamp: new Date().toISOString(),
    message: 'Service healed by orchestrator',
  }));
}

async function sendCriticalAlert(serviceName) {
  // In production, this would send emails, SMS, Slack notifications
  console.log(`🚨 CRITICAL ALERT: ${serviceName} is down and could not be healed`);
}

/**
 * Continuous Monitoring Loop
 */
async function monitorServices() {
  console.log('🔍 Starting service health monitoring...');
  
  setInterval(async () => {
    for (const service of SERVICES) {
      await checkServiceHealth(service);
    }
  }, 30000); // Check every 30 seconds
}

/**
 * System Metrics Collection
 */
async function collectMetrics() {
  setInterval(async () => {
    const metrics = {
      timestamp: new Date().toISOString(),
      services: {},
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };
    
    for (const [name, health] of serviceHealth.entries()) {
      metrics.services[name] = {
        status: health.status,
        failures: health.failures,
        recoveries: health.recoveries,
      };
    }
    
    await redis.set('system_metrics', JSON.stringify(metrics));
  }, 60000); // Every minute
}

/**
 * API Endpoints
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    orchestrator: 'Azora OS Autonomous Infrastructure',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/services/status', (req, res) => {
  const status = {};
  for (const [name, health] of serviceHealth.entries()) {
    status[name] = health;
  }
  res.json(status);
});

app.get('/api/system/metrics', async (req, res) => {
  const metrics = await redis.get('system_metrics');
  res.json(JSON.parse(metrics || '{}'));
});

app.get('/api/issues/critical', async (req, res) => {
  const issues = await redis.lrange('critical_issues', 0, 99);
  res.json(issues.map(i => JSON.parse(i)));
});

app.post('/api/services/:name/heal', async (req, res) => {
  const { name } = req.params;
  const service = SERVICES.find(s => s.name === name);
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  await healService(service);
  res.json({ message: `Healing initiated for ${name}` });
});

/**
 * Startup
 */
const PORT = process.env.ORCHESTRATOR_PORT || 4999;

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🤖 AZORA OS - AUTONOMOUS ORCHESTRATOR                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Port: ${PORT}`);
  console.log('Status: ACTIVE');
  console.log('');
  console.log('Capabilities:');
  console.log('  ✅ Autonomous health monitoring');
  console.log('  ✅ Self-healing service recovery');
  console.log('  ✅ Automatic container restart');
  console.log('  ✅ Issue escalation & alerting');
  console.log('  ✅ Real-time metrics collection');
  console.log('');
  console.log('��🇦 Built by Sizwe Ngwenya - Making companies fully autonomous');
  console.log('');
  
  // Start monitoring
  monitorServices();
  collectMetrics();
});

module.exports = app;

// Add recovery integration
const TRACING_SERVICE = 'http://localhost:4998';

async function attemptAIRecovery(service) {
  console.log(`🤖 Initiating AI-powered recovery for ${service.name}...`);
  
  try {
    const response = await axios.post(`${TRACING_SERVICE}/api/recover/${service.name}`);
    
    if (response.data.success && response.data.result.success) {
      console.log(`✅ AI recovery successful for ${service.name}`);
      console.log(`📊 Recovery confidence: ${response.data.analysis.recoveryStrategy.confidence}%`);
      console.log(`⏱️  Recovery time: ${response.data.result.results.reduce((sum, r) => sum + (r.duration || 0), 0)}ms`);
      return true;
    } else {
      console.log(`⚠️  AI recovery failed for ${service.name}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ AI recovery error for ${service.name}:`, error.message);
    return false;
  }
}

// Update healService to use AI recovery first
const originalHealService = healService;
healService = async function(service) {
  // Try AI recovery first
  const aiRecovered = await attemptAIRecovery(service);
  
  if (aiRecovered) {
    return true;
  }
  
  // Fall back to container restart
  console.log(`🔄 Falling back to container restart for ${service.name}`);
  return await originalHealService(service);
};
