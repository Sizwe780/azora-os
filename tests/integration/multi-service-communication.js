/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Multi-Service Communication Integration Test
 *
 * Tests communication and coordination between all Azora OS services
 * Validates service discovery, inter-service APIs, and system-wide events
 */

export async function run() {
  const results = {
    passed: false,
    details: {},
    error: null
  };

  try {
    console.log('  🌐 Testing multi-service communication...');

    // Test 1: Service health checks
    const services = ['database-integration', 'real-time', 'security-core', 'ai-orchestrator', 'blockchain-verification'];
    const healthResults = {};

    for (const service of services) {
      const config = getServiceConfig(service);
      if (config) {
        const health = await testEndpoint(`http://localhost:${config.port}/health`);
        healthResults[service] = health.success;
      } else {
        healthResults[service] = false;
      }
    }
    results.details.serviceHealth = healthResults;

    // Test 2: Inter-service API calls
    const apiTest = await testInterServiceAPIs();
    results.details.interServiceAPIs = apiTest.success;

    // Test 3: Event broadcasting and subscription
    const eventTest = await testEventBroadcasting();
    results.details.eventBroadcasting = eventTest.success;

    // Test 4: Service discovery
    const discoveryTest = await testServiceDiscovery();
    results.details.serviceDiscovery = discoveryTest.success;

    // Test 5: Cross-service data flow
    const dataFlowTest = await testCrossServiceDataFlow();
    results.details.crossServiceDataFlow = dataFlowTest.success;

    // Test 6: System-wide coordination
    const coordinationTest = await testSystemCoordination();
    results.details.systemCoordination = coordinationTest.success;

    // Determine overall pass/fail
    const allTests = [
      ...Object.values(results.details.serviceHealth),
      results.details.interServiceAPIs,
      results.details.eventBroadcasting,
      results.details.serviceDiscovery,
      results.details.crossServiceDataFlow,
      results.details.systemCoordination
    ];
    results.passed = allTests.every(test => test === true);

    if (results.passed) {
      results.details.summary = 'All multi-service communication tests passed';
    } else {
      results.details.summary = `Failed tests: ${allTests.filter(t => !t).length}/${allTests.length}`;
    }

  } catch (error) {
    results.error = error.message;
    results.details.error = error.stack;
  }

  return results;
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

async function testEndpoint(url) {
  try {
    const response = await fetch(url, { timeout: 5000 });
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testInterServiceAPIs() {
  try {
    // Test API calls between different services
    const tests = [
      // Database -> Real-time
      {
        from: 'database-integration',
        to: 'real-time',
        endpoint: '/sync/subscribe/test-entity/test-123',
        method: 'POST',
        body: { webhookUrl: 'http://localhost:5002/webhook' }
      },
      // Real-time -> Database
      {
        from: 'real-time',
        to: 'database-integration',
        endpoint: '/sync/publish/test-entity/test-123',
        method: 'POST',
        body: { data: { test: 'data' }, operation: 'update' }
      },
      // AI -> Security
      {
        from: 'ai-orchestrator',
        to: 'security-core',
        endpoint: '/threats/analyze',
        method: 'POST',
        body: { threatData: { type: 'test' } }
      }
    ];

    const results = [];
    for (const test of tests) {
      const fromConfig = getServiceConfig(test.from);
      const toConfig = getServiceConfig(test.to);

      if (fromConfig && toConfig) {
        const url = `http://localhost:${toConfig.port}${test.endpoint}`;
        const response = await fetch(url, {
          method: test.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test.body)
        });
        results.push(response.ok);
      } else {
        results.push(false);
      }
    }

    return {
      success: results.every(r => r === true),
      results: results
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testEventBroadcasting() {
  try {
    // Test system-wide event broadcasting
    const eventData = {
      event: 'system.test',
      payload: {
        message: 'Integration test event',
        timestamp: new Date().toISOString(),
        source: 'test-suite'
      },
      targets: ['database-integration', 'real-time', 'security-core']
    };

    // Broadcast via real-time service
    const broadcastResponse = await fetch('http://localhost:4000/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });

    // Test event subscription
    const subscribeResponse = await fetch('http://localhost:4000/events/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'system.test',
        callback: 'http://localhost:5002/webhook'
      })
    });

    return {
      success: broadcastResponse.ok && subscribeResponse.ok,
      broadcastStatus: broadcastResponse.status,
      subscribeStatus: subscribeResponse.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testServiceDiscovery() {
  try {
    // Test service discovery mechanism
    const discoveryData = {
      service: 'test-service',
      endpoints: {
        health: '/health',
        api: '/api/v1'
      },
      metadata: {
        version: '1.0.0',
        environment: 'test'
      }
    };

    // Register service
    const registerResponse = await fetch('http://localhost:4000/discovery/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discoveryData)
    });

    // Discover services
    const discoverResponse = await fetch('http://localhost:4000/discovery/services');

    let services = [];
    if (discoverResponse.ok) {
      const data = await discoverResponse.json();
      services = data.services || [];
    }

    return {
      success: registerResponse.ok && discoverResponse.ok && services.length > 0,
      registerStatus: registerResponse.status,
      discoverStatus: discoverResponse.status,
      servicesFound: services.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testCrossServiceDataFlow() {
  try {
    // Test complete data flow across multiple services
    const testData = {
      id: 'flow-test-' + Date.now(),
      userId: 'test-user',
      companyId: 'test-company',
      data: {
        type: 'integration_test',
        value: Math.random(),
        timestamp: new Date().toISOString()
      }
    };

    // Step 1: Store in database
    const dbResponse = await fetch('http://localhost:5002/data/mongodb/integration_tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: 'integration_tests',
        document: testData
      })
    });

    // Step 2: Broadcast via real-time service
    const broadcastResponse = await fetch('http://localhost:4000/broadcast/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: testData,
        channels: ['integration-tests']
      })
    });

    // Step 3: Analyze via AI service
    const aiResponse = await fetch('http://localhost:4001/analyze/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: testData })
    });

    // Step 4: Verify via blockchain
    const blockchainResponse = await fetch('http://localhost:3001/verify/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: testData, hash: 'test-hash' })
    });

    return {
      success: dbResponse.ok && broadcastResponse.ok && aiResponse.ok && blockchainResponse.ok,
      steps: {
        database: dbResponse.status,
        broadcast: broadcastResponse.status,
        ai: aiResponse.status,
        blockchain: blockchainResponse.status
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testSystemCoordination() {
  try {
    // Test system-wide coordination and orchestration
    const coordinationData = {
      operation: 'system_test',
      services: ['database-integration', 'real-time', 'ai-orchestrator'],
      parameters: {
        testMode: true,
        timeout: 30000,
        expectedResults: 'coordinated_response'
      }
    };

    // Initiate coordinated operation
    const coordResponse = await fetch('http://localhost:4000/coordination/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coordinationData)
    });

    // Check coordination status
    const statusResponse = await fetch('http://localhost:4000/coordination/status/system_test');

    let status = {};
    if (statusResponse.ok) {
      status = await statusResponse.json();
    }

    return {
      success: coordResponse.ok && statusResponse.ok,
      coordStatus: coordResponse.status,
      statusCheck: statusResponse.status,
      coordinationState: status.state || 'unknown'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}