/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Database Throughput Performance Test
 *
 * Tests database performance under various load conditions
 * Measures read/write throughput, latency, and concurrent operations
 */

export async function run() {
  const results = {
    passed: false,
    details: {},
    metrics: {},
    error: null
  };

  try {
    console.log('  📊 Testing database throughput performance...');

    // Test 1: Write throughput
    const writeTest = await testWriteThroughput();
    results.details.writeThroughput = writeTest.success;
    results.metrics.writeThroughput = writeTest.metrics;

    // Test 2: Read throughput
    const readTest = await testReadThroughput();
    results.details.readThroughput = readTest.success;
    results.metrics.readThroughput = readTest.metrics;

    // Test 3: Mixed operations throughput
    const mixedTest = await testMixedOperationsThroughput();
    results.details.mixedOperationsThroughput = mixedTest.success;
    results.metrics.mixedOperationsThroughput = mixedTest.metrics;

    // Test 4: Concurrent connections
    const concurrentTest = await testConcurrentConnections();
    results.details.concurrentConnections = concurrentTest.success;
    results.metrics.concurrentConnections = concurrentTest.metrics;

    // Test 5: Latency under load
    const latencyTest = await testLatencyUnderLoad();
    results.details.latencyUnderLoad = latencyTest.success;
    results.metrics.latencyUnderLoad = latencyTest.metrics;

    // Test 6: Bulk operations
    const bulkTest = await testBulkOperations();
    results.details.bulkOperations = bulkTest.success;
    results.metrics.bulkOperations = bulkTest.metrics;

    // Performance thresholds
    const thresholds = {
      writeThroughput: { min: 1000, unit: 'ops/sec' },
      readThroughput: { min: 2000, unit: 'ops/sec' },
      mixedOperationsThroughput: { min: 1500, unit: 'ops/sec' },
      concurrentConnections: { min: 100, unit: 'connections' },
      latencyUnderLoad: { max: 50, unit: 'ms' },
      bulkOperations: { min: 5000, unit: 'ops/sec' }
    };

    // Validate against thresholds
    const validations = {};
    for (const [test, threshold] of Object.entries(thresholds)) {
      const metric = results.metrics[test];
      if (metric && metric.average) {
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
      results.details.summary = 'All database throughput tests passed performance thresholds';
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

async function testWriteThroughput() {
  try {
    const testDuration = 10000; // 10 seconds
    const operations = [];
    const startTime = Date.now();

    // Generate write operations
    while (Date.now() - startTime < testDuration) {
      const operation = {
        collection: 'performance_tests',
        document: {
          id: `write-test-${Date.now()}-${Math.random()}`,
          data: generateTestData(),
          timestamp: new Date().toISOString(),
          type: 'write_throughput_test'
        }
      };

      operations.push(
        fetch('http://localhost:5002/data/mongodb/performance_tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(operation)
        })
      );
    }

    const start = Date.now();
    const responses = await Promise.all(operations);
    const end = Date.now();

    const successful = responses.filter(r => r.ok).length;
    const total = responses.length;
    const duration = (end - start) / 1000; // seconds
    const throughput = total / duration;

    return {
      success: successful === total,
      metrics: {
        total: total,
        successful: successful,
        duration: duration,
        throughput: throughput,
        average: throughput
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testReadThroughput() {
  try {
    // First, ensure we have data to read
    await seedTestData(1000);

    const testDuration = 10000; // 10 seconds
    const operations = [];
    const startTime = Date.now();

    // Generate read operations
    while (Date.now() - startTime < testDuration) {
      operations.push(
        fetch('http://localhost:5002/data/mongodb/performance_tests/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collection: 'performance_tests',
            query: { type: 'read_throughput_test' },
            limit: 10
          })
        })
      );
    }

    const start = Date.now();
    const responses = await Promise.all(operations);
    const end = Date.now();

    const successful = responses.filter(r => r.ok).length;
    const total = responses.length;
    const duration = (end - start) / 1000;
    const throughput = total / duration;

    return {
      success: successful === total,
      metrics: {
        total: total,
        successful: successful,
        duration: duration,
        throughput: throughput,
        average: throughput
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testMixedOperationsThroughput() {
  try {
    const testDuration = 15000; // 15 seconds
    const operations = [];
    const startTime = Date.now();

    // Generate mixed read/write operations
    while (Date.now() - startTime < testDuration) {
      const isWrite = Math.random() > 0.5;

      if (isWrite) {
        operations.push(
          fetch('http://localhost:5002/data/mongodb/performance_tests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collection: 'performance_tests',
              document: {
                id: `mixed-test-${Date.now()}-${Math.random()}`,
                data: generateTestData(),
                timestamp: new Date().toISOString(),
                type: 'mixed_operations_test'
              }
            })
          })
        );
      } else {
        operations.push(
          fetch('http://localhost:5002/data/mongodb/performance_tests/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collection: 'performance_tests',
              query: { type: 'mixed_operations_test' },
              limit: 5
            })
          })
        );
      }
    }

    const start = Date.now();
    const responses = await Promise.all(operations);
    const end = Date.now();

    const successful = responses.filter(r => r.ok).length;
    const total = responses.length;
    const duration = (end - start) / 1000;
    const throughput = total / duration;

    return {
      success: successful / total >= 0.95, // 95% success rate
      metrics: {
        total: total,
        successful: successful,
        successRate: successful / total,
        duration: duration,
        throughput: throughput,
        average: throughput
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testConcurrentConnections() {
  try {
    const concurrentConnections = 200;
    const testDuration = 30000; // 30 seconds
    const connections = [];

    // Create concurrent connections
    for (let i = 0; i < concurrentConnections; i++) {
      connections.push(runConcurrentConnection(i, testDuration));
    }

    const start = Date.now();
    const results = await Promise.all(connections);
    const end = Date.now();

    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const duration = (end - start) / 1000;

    // Calculate metrics
    const totalOperations = results.reduce((sum, r) => sum + (r.operations || 0), 0);
    const throughput = totalOperations / duration;

    return {
      success: successful === total,
      metrics: {
        concurrentConnections: concurrentConnections,
        successfulConnections: successful,
        totalConnections: total,
        duration: duration,
        totalOperations: totalOperations,
        throughput: throughput,
        average: successful
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runConcurrentConnection(connectionId, duration) {
  const operations = [];
  const startTime = Date.now();

  try {
    while (Date.now() - startTime < duration) {
      const response = await fetch('http://localhost:5002/data/mongodb/performance_tests/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'performance_tests',
          query: { type: 'concurrent_test' },
          limit: 1
        })
      });

      operations.push(response.ok);
    }

    return {
      success: true,
      operations: operations.length,
      successRate: operations.filter(Boolean).length / operations.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testLatencyUnderLoad() {
  try {
    const concurrentRequests = 50;
    const totalRequests = 1000;
    const latencies = [];

    // Generate load with concurrent requests
    for (let batch = 0; batch < totalRequests / concurrentRequests; batch++) {
      const batchPromises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const start = Date.now();
        const promise = fetch('http://localhost:5002/data/mongodb/performance_tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collection: 'performance_tests',
            document: {
              id: `latency-test-${batch}-${i}-${Date.now()}`,
              data: generateTestData(),
              timestamp: new Date().toISOString(),
              type: 'latency_test'
            }
          })
        }).then(response => {
          const end = Date.now();
          latencies.push(end - start);
          return response;
        });

        batchPromises.push(promise);
      }

      await Promise.all(batchPromises);
    }

    const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
    const p99Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.99)];

    return {
      success: averageLatency < 100, // Average latency under 100ms
      metrics: {
        totalRequests: totalRequests,
        averageLatency: averageLatency,
        p95Latency: p95Latency,
        p99Latency: p99Latency,
        minLatency: Math.min(...latencies),
        maxLatency: Math.max(...latencies),
        average: averageLatency
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testBulkOperations() {
  try {
    const bulkSize = 1000;
    const batches = 5;
    const results = [];

    for (let batch = 0; batch < batches; batch++) {
      const documents = [];
      for (let i = 0; i < bulkSize; i++) {
        documents.push({
          id: `bulk-test-${batch}-${i}-${Date.now()}`,
          data: generateTestData(),
          timestamp: new Date().toISOString(),
          type: 'bulk_operations_test'
        });
      }

      const start = Date.now();
      const response = await fetch('http://localhost:5002/data/mongodb/performance_tests/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'performance_tests',
          documents: documents
        })
      });
      const end = Date.now();

      results.push({
        success: response.ok,
        duration: end - start,
        throughput: bulkSize / ((end - start) / 1000)
      });
    }

    const successful = results.filter(r => r.success).length;
    const averageThroughput = results.reduce((sum, r) => sum + r.throughput, 0) / results.length;

    return {
      success: successful === batches,
      metrics: {
        batches: batches,
        successful: successful,
        bulkSize: bulkSize,
        totalOperations: bulkSize * batches,
        averageThroughput: averageThroughput,
        average: averageThroughput
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function seedTestData(count) {
  const documents = [];
  for (let i = 0; i < count; i++) {
    documents.push({
      id: `seed-${i}-${Date.now()}`,
      data: generateTestData(),
      timestamp: new Date().toISOString(),
      type: 'read_throughput_test'
    });
  }

  await fetch('http://localhost:5002/data/mongodb/performance_tests/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collection: 'performance_tests',
      documents: documents
    })
  });
}

function generateTestData() {
  return {
    field1: Math.random().toString(36),
    field2: Math.floor(Math.random() * 1000),
    field3: new Date().toISOString(),
    field4: Array.from({ length: 10 }, () => Math.random()),
    field5: {
      nested: {
        value: Math.random(),
        text: 'test data'
      }
    }
  };
}