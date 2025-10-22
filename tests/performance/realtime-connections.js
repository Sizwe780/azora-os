/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Real-time Connections Performance Test
 *
 * Tests real-time service performance under various connection loads
 * Measures connection handling, message throughput, and latency
 */

export async function run() {
  const results = {
    passed: false,
    details: {},
    metrics: {},
    error: null
  };

  try {
    console.log('  🔄 Testing real-time connections performance...');

    // Test 1: Connection establishment rate
    const connectionTest = await testConnectionEstablishment();
    results.details.connectionEstablishment = connectionTest.success;
    results.metrics.connectionEstablishment = connectionTest.metrics;

    // Test 2: Message throughput
    const messageTest = await testMessageThroughput();
    results.details.messageThroughput = messageTest.success;
    results.metrics.messageThroughput = messageTest.metrics;

    // Test 3: Concurrent connections
    const concurrentTest = await testConcurrentRealtimeConnections();
    results.details.concurrentRealtimeConnections = concurrentTest.success;
    results.metrics.concurrentRealtimeConnections = concurrentTest.metrics;

    // Test 4: Message latency
    const latencyTest = await testMessageLatency();
    results.details.messageLatency = latencyTest.success;
    results.metrics.messageLatency = latencyTest.metrics;

    // Test 5: Connection stability
    const stabilityTest = await testConnectionStability();
    results.details.connectionStability = stabilityTest.success;
    results.metrics.connectionStability = stabilityTest.metrics;

    // Test 6: Broadcast performance
    const broadcastTest = await testBroadcastPerformance();
    results.details.broadcastPerformance = broadcastTest.success;
    results.metrics.broadcastPerformance = broadcastTest.metrics;

    // Performance thresholds
    const thresholds = {
      connectionEstablishment: { min: 100, unit: 'connections/sec' },
      messageThroughput: { min: 5000, unit: 'messages/sec' },
      concurrentRealtimeConnections: { min: 1000, unit: 'connections' },
      messageLatency: { max: 20, unit: 'ms' },
      connectionStability: { min: 0.99, unit: 'uptime' },
      broadcastPerformance: { min: 10000, unit: 'messages/sec' }
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
      results.details.summary = 'All real-time connection tests passed performance thresholds';
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

async function testConnectionEstablishment() {
  try {
    const targetConnections = 500;
    const connections = [];
    const startTime = Date.now();

    // Establish connections concurrently
    for (let i = 0; i < targetConnections; i++) {
      connections.push(establishWebSocketConnection(i));
    }

    const results = await Promise.all(connections);
    const endTime = Date.now();

    const successful = results.filter(r => r.success).length;
    const duration = (endTime - startTime) / 1000; // seconds
    const rate = successful / duration;

    return {
      success: successful >= targetConnections * 0.95, // 95% success rate
      metrics: {
        targetConnections: targetConnections,
        successfulConnections: successful,
        duration: duration,
        establishmentRate: rate,
        average: rate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function establishWebSocketConnection(id) {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket('ws://localhost:4000');

      const timeout = setTimeout(() => {
        ws.close();
        resolve({ success: false, id });
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({ success: true, id });
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve({ success: false, id });
      };
    } catch (error) {
      resolve({ success: false, id, error: error.message });
    }
  });
}

async function testMessageThroughput() {
  try {
    const connections = 50;
    const messagesPerConnection = 100;
    const websockets = [];
  // const results = []; // Removed unused variable

    // Establish connections
    for (let i = 0; i < connections; i++) {
      const ws = await establishWebSocketConnectionForMessaging(i);
      if (ws) websockets.push(ws);
    }

    const startTime = Date.now();

    // Send messages through all connections
    const messagePromises = [];
    for (const ws of websockets) {
      for (let j = 0; j < messagesPerConnection; j++) {
        messagePromises.push(sendMessage(ws, j));
      }
    }

    const messageResults = await Promise.all(messagePromises);
    const endTime = Date.now();

    // Close connections
    websockets.forEach(ws => ws.close());

    const successful = messageResults.filter(r => r.success).length;
    const total = messageResults.length;
    const duration = (endTime - startTime) / 1000;
    const throughput = total / duration;

    return {
      success: successful === total,
      metrics: {
        connections: connections,
        messagesPerConnection: messagesPerConnection,
        totalMessages: total,
        successfulMessages: successful,
        duration: duration,
        throughput: throughput,
        average: throughput
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function establishWebSocketConnectionForMessaging(_id) {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket('ws://localhost:4000');

      ws.onopen = () => {
        resolve(ws);
      };

      ws.onerror = () => {
        resolve(null);
      };

      // Timeout after 5 seconds
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          resolve(null);
        }
      }, 5000);
  } catch (_error) {
      resolve(null);
    }
  });
}

async function sendMessage(ws, messageId) {
  return new Promise((resolve) => {
    try {
      const message = {
        type: 'test_message',
        id: messageId,
        data: `Test message ${messageId}`,
        timestamp: Date.now()
      };

      ws.send(JSON.stringify(message));

      // Assume success if no error within 100ms
      setTimeout(() => {
        resolve({ success: true, messageId });
      }, 100);
    } catch (error) {
      resolve({ success: false, messageId, error: error.message });
    }
  });
}

async function testConcurrentRealtimeConnections() {
  try {
    const targetConnections = 1000;
    const testDuration = 30000; // 30 seconds
  // const connections = []; // Removed unused variable
    const activeConnections = new Set();

    // Establish connections gradually
    const establishmentPromises = [];
    for (let i = 0; i < targetConnections; i++) {
      establishmentPromises.push(
        new Promise((resolve) => {
          setTimeout(async () => {
            const ws = await establishWebSocketConnectionForMessaging(i);
            if (ws) {
              activeConnections.add(ws);
              ws.onclose = () => activeConnections.delete(ws);
            }
            resolve(ws);
          }, (i * 10)); // Stagger connections by 10ms
        })
      );
    }

    await Promise.all(establishmentPromises);

    // Wait for test duration while maintaining connections
    await new Promise(resolve => setTimeout(resolve, testDuration));

    const finalActiveConnections = activeConnections.size;

    // Clean up
    activeConnections.forEach(ws => ws.close());

    return {
      success: finalActiveConnections >= targetConnections * 0.9, // 90% connection maintenance
      metrics: {
        targetConnections: targetConnections,
        finalActiveConnections: finalActiveConnections,
        maintenanceRate: finalActiveConnections / targetConnections,
        testDuration: testDuration / 1000,
        average: finalActiveConnections
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testMessageLatency() {
  try {
    const ws = await establishWebSocketConnectionForMessaging('latency-test');
    if (!ws) {
      return { success: false, error: 'Failed to establish connection' };
    }

    const latencies = [];
    const messageCount = 100;

    // Set up message handler
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'echo_response') {
          const sentTime = data.originalTimestamp;
          const receivedTime = Date.now();
          latencies.push(receivedTime - sentTime);
        }
  } catch (_error) {
        // Ignore parsing errors
      }
    };

    // Send messages and measure round-trip latency
    for (let i = 0; i < messageCount; i++) {
      const message = {
        type: 'echo_request',
        id: i,
        data: `Latency test message ${i}`,
        timestamp: Date.now(),
        originalTimestamp: Date.now()
      };

      ws.send(JSON.stringify(message));
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay between messages
    }

    // Wait for responses
    await new Promise(resolve => setTimeout(resolve, 2000));

    ws.close();

    if (latencies.length === 0) {
      return { success: false, error: 'No latency measurements received' };
    }

    const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

    return {
      success: averageLatency < 50, // Average latency under 50ms
      metrics: {
        messageCount: messageCount,
        receivedResponses: latencies.length,
        averageLatency: averageLatency,
        p95Latency: p95Latency,
        minLatency: Math.min(...latencies),
        maxLatency: Math.max(...latencies),
        average: averageLatency
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testConnectionStability() {
  try {
    const connections = 100;
    const testDuration = 60000; // 60 seconds
    const websockets = [];
    const stabilityData = [];

    // Establish connections
    for (let i = 0; i < connections; i++) {
      const ws = await establishWebSocketConnectionForMessaging(`stability-${i}`);
      if (ws) {
        websockets.push({
          ws,
          id: i,
          connectedAt: Date.now(),
          messagesSent: 0,
          messagesReceived: 0,
          reconnects: 0
        });
      }
    }

    const startTime = Date.now();

    // Monitor connections during test duration
    while (Date.now() - startTime < testDuration) {
      const currentTime = Date.now();

      // Send heartbeat messages
      for (const conn of websockets) {
        if (conn.ws.readyState === WebSocket.OPEN) {
          try {
            conn.ws.send(JSON.stringify({
              type: 'heartbeat',
              id: conn.id,
              timestamp: currentTime
            }));
            conn.messagesSent++;
          } catch (_error) {
            // Connection might be broken
          }
        }
      }

      // Record stability snapshot
      const activeConnections = websockets.filter(conn => conn.ws.readyState === WebSocket.OPEN).length;
      stabilityData.push({
        timestamp: currentTime,
        activeConnections: activeConnections,
        totalConnections: connections
      });

      await new Promise(resolve => setTimeout(resolve, 1000)); // Check every second
    }

    // Calculate uptime percentage
    const uptime = stabilityData.reduce((sum, data) => sum + (data.activeConnections / data.totalConnections), 0) / stabilityData.length;

    // Clean up
    websockets.forEach(conn => conn.ws.close());

    return {
      success: uptime >= 0.95, // 95% uptime
      metrics: {
        totalConnections: connections,
        testDuration: testDuration / 1000,
        uptimePercentage: uptime,
        stabilitySnapshots: stabilityData.length,
        average: uptime
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testBroadcastPerformance() {
  try {
    const subscriberConnections = 200;
    const broadcastMessages = 100;
    const websockets = [];
    const receivedMessages = new Map();

    // Establish subscriber connections
    for (let i = 0; i < subscriberConnections; i++) {
      const ws = await establishWebSocketConnectionForMessaging(`broadcast-${i}`);
      if (ws) {
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'broadcast_test') {
              const count = receivedMessages.get(data.messageId) || 0;
              receivedMessages.set(data.messageId, count + 1);
            }
          } catch (_error) {
            // Ignore parsing errors
          }
        };
        websockets.push(ws);
      }
    }

    // Send broadcast messages via HTTP API
    const broadcastPromises = [];
    for (let i = 0; i < broadcastMessages; i++) {
      broadcastPromises.push(
        fetch('http://localhost:4000/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'broadcast_test',
            messageId: i,
            data: `Broadcast message ${i}`,
            timestamp: Date.now()
          })
        })
      );
    }

    const startTime = Date.now();
    await Promise.all(broadcastPromises);
    const endTime = Date.now();

    // Wait for messages to be received
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate broadcast efficiency
    const totalExpected = broadcastMessages * subscriberConnections;
    const totalReceived = Array.from(receivedMessages.values()).reduce((sum, count) => sum + count, 0);
    const efficiency = totalReceived / totalExpected;
    const duration = (endTime - startTime) / 1000;
    const throughput = broadcastMessages / duration;

    // Clean up
    websockets.forEach(ws => ws.close());

    return {
      success: efficiency >= 0.9, // 90% message delivery
      metrics: {
        subscriberConnections: subscriberConnections,
        broadcastMessages: broadcastMessages,
        totalExpected: totalExpected,
        totalReceived: totalReceived,
        deliveryEfficiency: efficiency,
        duration: duration,
        throughput: throughput,
        average: throughput
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}