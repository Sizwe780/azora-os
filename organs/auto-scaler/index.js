/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Auto-Scaling Service
 * @description Automatically scales services based on load and self-heals failures
 */

const express = require('express');
const axios = require('axios');
const Docker = require('dockerode');
const cron = require('node-cron');

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://prometheus:9090';
const CPU_THRESHOLD = parseFloat(process.env.CPU_THRESHOLD) || 70;
const MEMORY_THRESHOLD = parseFloat(process.env.MEMORY_THRESHOLD) || 80;

// ============================================================================
// METRICS COLLECTION
// ============================================================================

const getServiceMetrics = async (serviceName) => {
  try {
    const cpuQuery = `rate(container_cpu_usage_seconds_total{name=~".*${serviceName}.*"}[5m]) * 100`;
    const memoryQuery = `container_memory_usage_bytes{name=~".*${serviceName}.*"} / container_spec_memory_limit_bytes{name=~".*${serviceName}.*"} * 100`;
    
    const [cpuResponse, memoryResponse] = await Promise.all([
      axios.get(`${PROMETHEUS_URL}/api/v1/query`, { params: { query: cpuQuery } }),
      axios.get(`${PROMETHEUS_URL}/api/v1/query`, { params: { query: memoryQuery } })
    ]);

    const cpuUsage = cpuResponse.data?.data?.result?.[0]?.value?.[1] || 0;
    const memoryUsage = memoryResponse.data?.data?.result?.[0]?.value?.[1] || 0;

    return {
      cpu: parseFloat(cpuUsage),
      memory: parseFloat(memoryUsage),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`Metrics error for ${serviceName}:`, error.message);
    return null;
  }
};

// ============================================================================
// AUTO-SCALING LOGIC
// ============================================================================

const scaleService = async (serviceName, direction) => {
  try {
    const service = docker.getService(serviceName);
    const serviceInfo = await service.inspect();
    const currentReplicas = serviceInfo.Spec.Mode.Replicated.Replicas;
    
    let newReplicas = currentReplicas;
    if (direction === 'up') {
      newReplicas = Math.min(currentReplicas + 1, 10); // Max 10 replicas
    } else if (direction === 'down') {
      newReplicas = Math.max(currentReplicas - 1, 1); // Min 1 replica
    }

    if (newReplicas !== currentReplicas) {
      await service.update({
        version: parseInt(serviceInfo.Version.Index),
        Spec: {
          ...serviceInfo.Spec,
          Mode: {
            Replicated: { Replicas: newReplicas }
          }
        }
      });

      console.log(`✅ Scaled ${serviceName} from ${currentReplicas} to ${newReplicas} replicas`);
      return { success: true, from: currentReplicas, to: newReplicas };
    }

    return { success: false, message: 'No scaling needed' };
  } catch (error) {
    console.error(`Scaling error for ${serviceName}:`, error.message);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// SELF-HEALING
// ============================================================================

const checkServiceHealth = async (serviceName) => {
  try {
    const containers = await docker.listContainers({
      filters: { name: [serviceName] }
    });

    for (const containerInfo of containers) {
      const container = docker.getContainer(containerInfo.Id);
      const info = await container.inspect();

      if (info.State.Status !== 'running') {
        console.log(`🔧 Restarting unhealthy container: ${serviceName}`);
        await container.restart();
        return { healed: true, container: containerInfo.Id };
      }

      // Check health status
      if (info.State.Health && info.State.Health.Status === 'unhealthy') {
        console.log(`🔧 Container ${serviceName} unhealthy, restarting...`);
        await container.restart();
        return { healed: true, container: containerInfo.Id, reason: 'unhealthy' };
      }
    }

    return { healed: false, message: 'All containers healthy' };
  } catch (error) {
    console.error(`Health check error for ${serviceName}:`, error.message);
    return { healed: false, error: error.message };
  }
};

// ============================================================================
// MONITORING SCHEDULER
// ============================================================================

const MONITORED_SERVICES = [
  'ai-orchestrator',
  'student-earnings-service',
  'auth',
  'sovereign-minter'
];

cron.schedule('*/2 * * * *', async () => {
  console.log('🔍 Running auto-scaling check...');

  for (const serviceName of MONITORED_SERVICES) {
    const metrics = await getServiceMetrics(serviceName);
    
    if (!metrics) continue;

    console.log(`📊 ${serviceName}: CPU ${metrics.cpu.toFixed(2)}%, Memory ${metrics.memory.toFixed(2)}%`);

    // Scale up if needed
    if (metrics.cpu > CPU_THRESHOLD || metrics.memory > MEMORY_THRESHOLD) {
      console.log(`⚠️  ${serviceName} exceeds threshold, scaling up...`);
      await scaleService(serviceName, 'up');
    }

    // Scale down if underutilized
    if (metrics.cpu < 30 && metrics.memory < 40) {
      console.log(`📉 ${serviceName} underutilized, considering scale down...`);
      await scaleService(serviceName, 'down');
    }

    // Self-healing check
    await checkServiceHealth(serviceName);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auto-scaler' });
});

// Manual scaling endpoint
app.post('/api/scale/:service/:direction', async (req, res) => {
  const { service, direction } = req.params;
  const result = await scaleService(service, direction);
  res.json(result);
});

const PORT = process.env.PORT || 4900;
app.listen(PORT, () => {
  console.log(`✅ Auto-Scaler Service running on port ${PORT}`);
});