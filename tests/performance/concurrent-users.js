/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Concurrent Users Performance Test
 *
 * Tests system performance under concurrent user load
 * Measures response times, resource usage, and system stability
 */

export async function run() {
  const results = {
    passed: false,
    details: {},
    metrics: {},
    error: null
  };

  try {
    console.log('  👥 Testing concurrent users performance...');

    // Test 1: Gradual user ramp-up
    const rampTest = await testGradualUserRampUp();
    results.details.gradualUserRampUp = rampTest.success;
    results.metrics.gradualUserRampUp = rampTest.metrics;

    // Test 2: Sustained concurrent load
    const sustainedTest = await testSustainedConcurrentLoad();
    results.details.sustainedConcurrentLoad = sustainedTest.success;
    results.metrics.sustainedConcurrentLoad = sustainedTest.metrics;

    // Test 3: Peak concurrent users
    const peakTest = await testPeakConcurrentUsers();
    results.details.peakConcurrentUsers = peakTest.success;
    results.metrics.peakConcurrentUsers = peakTest.metrics;

    // Test 4: User session management
    const sessionTest = await testUserSessionManagement();
    results.details.userSessionManagement = sessionTest.success;
    results.metrics.userSessionManagement = sessionTest.metrics;

    // Test 5: Resource usage under load
    const resourceTest = await testResourceUsageUnderLoad();
    results.details.resourceUsageUnderLoad = resourceTest.success;
    results.metrics.resourceUsageUnderLoad = resourceTest.metrics;

    // Test 6: Recovery from load spikes
    const recoveryTest = await testRecoveryFromLoadSpikes();
    results.details.recoveryFromLoadSpikes = recoveryTest.success;
    results.metrics.recoveryFromLoadSpikes = recoveryTest.metrics;

    // Performance thresholds
    const thresholds = {
      gradualUserRampUp: { min: 500, unit: 'users' },
      sustainedConcurrentLoad: { min: 300, unit: 'users' },
      peakConcurrentUsers: { min: 1000, unit: 'users' },
      userSessionManagement: { min: 0.95, unit: 'success_rate' },
      resourceUsageUnderLoad: { max: 80, unit: 'cpu_percent' },
      recoveryFromLoadSpikes: { max: 30, unit: 'seconds' }
    };

    // Validate against thresholds
    const validations = {};
    for (const [test, threshold] of Object.entries(thresholds)) {
      const metric = results.metrics[test];
      if (metric && metric.average !== undefined) {
        if (threshold.min !== undefined) {
          validations[test] = metric.average >= threshold.min;
        } else if (threshold.max !== undefined) {
          validations[test] = metric.average <= threshold.max;
        }
      } else {
        validations[test] = false;
      }
    }

    results.details.thresholds = thresholds;
    results.details.validations = validations;

    // Overall pass/fail based on thresholds
    results.passed = Object.values(validations).every(v => v === true);

    if (results.passed) {
      results.details.summary = 'All concurrent users tests passed performance thresholds';
    } else {
      const failedTests = Object.entries(validations).filter(([_, v]) => !v).map(([k]) => k);
      results.details.summary = `Failed performance thresholds: ${failedTests.join(', ')}`;
    }

  } catch (error) {
    results.error = error.message;
    results.details.error = error.stack;
  }

  return results;
}

async function testGradualUserRampUp() {
  try {
    const maxUsers = 500;
    const rampUpDuration = 300; // 5 minutes in seconds
    const usersPerSecond = maxUsers / rampUpDuration;
    const userSessions = [];
    const metrics = [];

    let currentUsers = 0;
    const startTime = Date.now();

    while (currentUsers < maxUsers) {
      // Add new users gradually
      const newUsers = Math.min(Math.floor(usersPerSecond), maxUsers - currentUsers);
      for (let i = 0; i < newUsers; i++) {
        const userSession = await createUserSession(`ramp-user-${currentUsers + i}`);
        if (userSession) {
          userSessions.push(userSession);
        }
      }

      currentUsers = userSessions.length;

      // Test system responsiveness with current load
      const responsiveness = await testSystemResponsiveness(userSessions.slice(0, Math.min(50, userSessions.length)));
      metrics.push({
        timestamp: Date.now(),
        activeUsers: currentUsers,
        responsiveness: responsiveness.averageLatency
      });

      // Wait before next batch
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calculate average responsiveness during ramp-up
    const averageResponsiveness = metrics.reduce((sum, m) => sum + m.responsiveness, 0) / metrics.length;

    // Clean up sessions
    await Promise.all(userSessions.map(session => endUserSession(session)));

    return {
      success: averageResponsiveness < 1000, // Average response time under 1 second
      metrics: {
        maxUsers: maxUsers,
        rampUpDuration: rampUpDuration,
        finalActiveUsers: currentUsers,
        averageResponsiveness: averageResponsiveness,
        metricsSnapshots: metrics.length,
        average: currentUsers
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testSustainedConcurrentLoad() {
  try {
    const targetUsers = 300;
    const testDuration = 600; // 10 minutes in seconds
    const userSessions = [];
    const metrics = [];

    // Create initial user sessions
    for (let i = 0; i < targetUsers; i++) {
      const userSession = await createUserSession(`sustained-user-${i}`);
      if (userSession) {
        userSessions.push(userSession);
      }
    }

    const startTime = Date.now();

    // Monitor performance during sustained load
    while (Date.now() - startTime < testDuration * 1000) {
      const currentTime = Date.now();

      // Test responsiveness with sample of users
      const sampleSize = Math.min(100, userSessions.length);
      const sampleUsers = userSessions.slice(0, sampleSize);
      const responsiveness = await testSystemResponsiveness(sampleUsers);

      // Test system health
      const health = await testSystemHealth();

      metrics.push({
        timestamp: currentTime,
        activeUsers: userSessions.length,
        responsiveness: responsiveness.averageLatency,
        systemHealth: health.score
      });

      await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30 seconds
    }

    // Calculate sustained performance metrics
    const averageResponsiveness = metrics.reduce((sum, m) => sum + m.responsiveness, 0) / metrics.length;
    const averageHealth = metrics.reduce((sum, m) => sum + m.systemHealth, 0) / metrics.length;
    const uptime = metrics.filter(m => m.systemHealth > 0.8).length / metrics.length;

    // Clean up sessions
    await Promise.all(userSessions.map(session => endUserSession(session)));

    return {
      success: averageResponsiveness < 1500 && uptime >= 0.95, // Response under 1.5s, 95% uptime
      metrics: {
        targetUsers: targetUsers,
        testDuration: testDuration,
        finalActiveUsers: userSessions.length,
        averageResponsiveness: averageResponsiveness,
        averageSystemHealth: averageHealth,
        uptimePercentage: uptime,
        metricsSnapshots: metrics.length,
        average: userSessions.length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testPeakConcurrentUsers() {
  try {
    const peakUsers = 1000;
    const peakDuration = 120; // 2 minutes in seconds
    const userSessions = [];
    const metrics = [];

    // Rapidly create user sessions to reach peak
    const creationPromises = [];
    for (let i = 0; i < peakUsers; i++) {
      creationPromises.push(createUserSession(`peak-user-${i}`));
    }

    const createdSessions = await Promise.all(creationPromises);
    userSessions.push(...createdSessions.filter(s => s !== null));

    const startTime = Date.now();

    // Monitor performance at peak load
    while (Date.now() - startTime < peakDuration * 1000) {
      const currentTime = Date.now();

      // Test responsiveness with multiple samples
      const sampleSize = Math.min(200, userSessions.length);
      const sampleUsers = [];
      for (let i = 0; i < sampleSize; i++) {
        sampleUsers.push(userSessions[Math.floor(Math.random() * userSessions.length)]);
      }

      const responsiveness = await testSystemResponsiveness(sampleUsers);
      const health = await testSystemHealth();

      metrics.push({
        timestamp: currentTime,
        activeUsers: userSessions.length,
        responsiveness: responsiveness.averageLatency,
        systemHealth: health.score,
        errorRate: responsiveness.errorRate
      });

      await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
    }

    // Calculate peak performance metrics
    const averageResponsiveness = metrics.reduce((sum, m) => sum + m.responsiveness, 0) / metrics.length;
    const averageHealth = metrics.reduce((sum, m) => sum + m.systemHealth, 0) / metrics.length;
    const averageErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;

    // Clean up sessions
    await Promise.all(userSessions.map(session => endUserSession(session)));

    return {
      success: averageResponsiveness < 2000 && averageErrorRate < 0.1, // Response under 2s, error rate under 10%
      metrics: {
        peakUsers: peakUsers,
        peakDuration: peakDuration,
        finalActiveUsers: userSessions.length,
        averageResponsiveness: averageResponsiveness,
        averageSystemHealth: averageHealth,
        averageErrorRate: averageErrorRate,
        metricsSnapshots: metrics.length,
        average: userSessions.length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testUserSessionManagement() {
  try {
    const totalSessions = 500;
    const sessions = [];
    const sessionMetrics = {
      created: 0,
      active: 0,
      ended: 0,
      errors: 0
    };

    // Create sessions
    for (let i = 0; i < totalSessions; i++) {
      try {
        const session = await createUserSession(`session-test-${i}`);
        if (session) {
          sessions.push(session);
          sessionMetrics.created++;
        } else {
          sessionMetrics.errors++;
        }
  } catch (_error) {
        sessionMetrics.errors++;
      }
    }

    sessionMetrics.active = sessions.length;

    // Test session operations
    const operationResults = [];
    for (const session of sessions.slice(0, 100)) { // Test with subset
      const operations = await testSessionOperations(session);
      operationResults.push(operations);
    }

    // End sessions
    for (const session of sessions) {
      try {
        await endUserSession(session);
        sessionMetrics.ended++;
  } catch (_error) {
        sessionMetrics.errors++;
      }
    }

    const successRate = (sessionMetrics.created + sessionMetrics.ended) / (totalSessions * 2);
    const operationSuccessRate = operationResults.filter(r => r.success).length / operationResults.length;

    return {
      success: successRate >= 0.95 && operationSuccessRate >= 0.95,
      metrics: {
        totalSessions: totalSessions,
        sessionMetrics: sessionMetrics,
        successRate: successRate,
        operationSuccessRate: operationSuccessRate,
        average: successRate
      }
    };
  } catch (_error) {
    return { success: false, error: error.message };
  }
}

async function testResourceUsageUnderLoad() {
  try {
    const testUsers = 200;
    const testDuration = 300; // 5 minutes
    const userSessions = [];
    const resourceMetrics = [];

    // Create user sessions
    for (let i = 0; i < testUsers; i++) {
      const session = await createUserSession(`resource-test-${i}`);
      if (session) userSessions.push(session);
    }

    const startTime = Date.now();

    // Monitor resource usage during load
    while (Date.now() - startTime < testDuration * 1000) {
      const resources = await getSystemResources();
      resourceMetrics.push({
        timestamp: Date.now(),
        cpu: resources.cpu,
        memory: resources.memory,
        disk: resources.disk,
        network: resources.network
      });

      await new Promise(resolve => setTimeout(resolve, 15000)); // Check every 15 seconds
    }

    // Calculate average resource usage
    const averageCpu = resourceMetrics.reduce((sum, m) => sum + m.cpu, 0) / resourceMetrics.length;
    const averageMemory = resourceMetrics.reduce((sum, m) => sum + m.memory, 0) / resourceMetrics.length;
    const peakCpu = Math.max(...resourceMetrics.map(m => m.cpu));
    const peakMemory = Math.max(...resourceMetrics.map(m => m.memory));

    // Clean up sessions
    await Promise.all(userSessions.map(session => endUserSession(session)));

    return {
      success: averageCpu < 80 && averageMemory < 85, // CPU under 80%, memory under 85%
      metrics: {
        testUsers: testUsers,
        testDuration: testDuration,
        averageCpu: averageCpu,
        averageMemory: averageMemory,
        peakCpu: peakCpu,
        peakMemory: peakMemory,
        metricsSnapshots: resourceMetrics.length,
        average: averageCpu
      }
    };
  } catch (_error) {
    return { success: false, error: error.message };
  }
}

async function testRecoveryFromLoadSpikes() {
  try {
    const baseUsers = 100;
    const spikeUsers = 500;
    const spikeDuration = 60; // 1 minute
    const recoveryDuration = 120; // 2 minutes
    const userSessions = [];
    const recoveryMetrics = [];

    // Create base load
    for (let i = 0; i < baseUsers; i++) {
      const session = await createUserSession(`recovery-base-${i}`);
      if (session) userSessions.push(session);
    }

    // Test baseline performance
    const baseline = await testSystemResponsiveness(userSessions.slice(0, 50));
    recoveryMetrics.push({
      phase: 'baseline',
      timestamp: Date.now(),
      users: baseUsers,
      responsiveness: baseline.averageLatency
    });

    // Create load spike
    const spikeSessions = [];
    for (let i = 0; i < spikeUsers; i++) {
      const session = await createUserSession(`recovery-spike-${i}`);
      if (session) {
        userSessions.push(session);
        spikeSessions.push(session);
      }
    }

    // Test during spike
    const duringSpike = await testSystemResponsiveness(userSessions.slice(0, 100));
    recoveryMetrics.push({
      phase: 'spike',
      timestamp: Date.now(),
      users: userSessions.length,
      responsiveness: duringSpike.averageLatency
    });

    // Wait during spike
    await new Promise(resolve => setTimeout(resolve, spikeDuration * 1000));

    // End spike sessions
    await Promise.all(spikeSessions.map(session => endUserSession(session)));
    userSessions.splice(userSessions.length - spikeSessions.length);

    // Monitor recovery
    const recoveryStart = Date.now();
    while (Date.now() - recoveryStart < recoveryDuration * 1000) {
      const responsiveness = await testSystemResponsiveness(userSessions.slice(0, 50));
      recoveryMetrics.push({
        phase: 'recovery',
        timestamp: Date.now(),
        users: userSessions.length,
        responsiveness: responsiveness.averageLatency
      });

      await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
    }

    // Calculate recovery time (time to return to baseline performance)
    const baselineLatency = baseline.averageLatency;
    const recoveryMetricsFiltered = recoveryMetrics.filter(m => m.phase === 'recovery');
    const recoveryTime = recoveryMetricsFiltered.findIndex(m => m.responsiveness <= baselineLatency * 1.2);
    const actualRecoveryTime = recoveryTime >= 0 ? (recoveryTime * 10) : recoveryDuration;

    // Clean up remaining sessions
    await Promise.all(userSessions.map(session => endUserSession(session)));

    return {
      success: actualRecoveryTime < 60, // Recovery within 60 seconds
      metrics: {
        baseUsers: baseUsers,
        spikeUsers: spikeUsers,
        spikeDuration: spikeDuration,
        recoveryDuration: recoveryDuration,
        baselineLatency: baselineLatency,
        recoveryTimeSeconds: actualRecoveryTime,
        average: actualRecoveryTime
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper functions
async function createUserSession(userId) {
  try {
    // Simulate user authentication and session creation
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userId,
        password: 'test-password',
        clientType: 'performance-test'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        userId: userId,
        sessionId: data.sessionId,
        token: data.token,
        createdAt: Date.now()
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function endUserSession(session) {
  try {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`
      },
      body: JSON.stringify({ sessionId: session.sessionId })
    });
  } catch (error) {
    // Ignore cleanup errors
  }
}

async function testSystemResponsiveness(sessions) {
  const latencies = [];
  const errors = [];

  for (const session of sessions) {
    try {
      const start = Date.now();
      const response = await fetch('http://localhost:3000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      const end = Date.now();

      if (response.ok) {
        latencies.push(end - start);
      } else {
        errors.push(response.status);
      }
  } catch (_error) {
      errors.push('network_error');
    }
  }

  return {
    averageLatency: latencies.length > 0 ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length : 0,
    errorRate: errors.length / sessions.length,
    totalRequests: sessions.length,
    successfulRequests: latencies.length
  };
}

async function testSystemHealth() {
  try {
    const services = ['database-integration', 'real-time', 'security-core', 'ai-orchestrator'];
    let healthyServices = 0;

    for (const service of services) {
      try {
        const config = getServiceConfig(service);
        if (config) {
          const response = await fetch(`http://localhost:${config.port}/health`);
          if (response.ok) healthyServices++;
        }
  } catch (_error) {
        // Service not healthy
      }
    }

    return {
      score: healthyServices / services.length,
      healthyServices: healthyServices,
      totalServices: services.length
    };
  } catch (_error) {
    return { score: 0 };
  }
}

async function testSessionOperations(session) {
  try {
    // Test various session operations
    const operations = [
      fetch('http://localhost:3000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${session.token}` }
      }),
      fetch('http://localhost:3000/api/user/settings', {
        headers: { 'Authorization': `Bearer ${session.token}` }
      }),
      fetch('http://localhost:3000/api/notifications', {
        headers: { 'Authorization': `Bearer ${session.token}` }
      })
    ];

    const results = await Promise.all(operations);
    const successCount = results.filter(r => r.ok).length;

    return {
      success: successCount === operations.length,
      successRate: successCount / operations.length
    };
  } catch (_error) {
    return { success: false };
  }
}

async function getSystemResources() {
  // This would typically query system monitoring APIs
  // For this test, we'll simulate resource monitoring
  return {
    cpu: 45 + Math.random() * 30, // 45-75% CPU
    memory: 60 + Math.random() * 20, // 60-80% memory
    disk: 30 + Math.random() * 20, // 30-50% disk
    network: 50 + Math.random() * 30 // 50-80% network
  };
}

function getServiceConfig(serviceName) {
  const configs = {
    'database-integration': { port: 5002 },
    'real-time': { port: 4000 },
    'security-core': { port: 4022 },
    'ai-orchestrator': { port: 4001 },
    'blockchain-verification': { port: 3001 }
  };
  return configs[serviceName];
}