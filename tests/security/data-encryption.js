/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Data Encryption Security Test
 *
 * Tests data encryption mechanisms and key management
 * Validates encryption at rest, in transit, and key security
 */

export async function run() {
  const results = {
    passed: false,
    details: {},
    metrics: {},
    error: null
  };

  try {
    console.log('  🔒 Testing data encryption...');

    // Test 1: Encryption at rest
    const restTest = await testEncryptionAtRest();
    results.details.encryptionAtRest = restTest.success;
    results.metrics.encryptionAtRest = restTest.metrics;

    // Test 2: Encryption in transit
    const transitTest = await testEncryptionInTransit();
    results.details.encryptionInTransit = transitTest.success;
    results.metrics.encryptionInTransit = transitTest.metrics;

    // Test 3: Key management
    const keyTest = await testKeyManagement();
    results.details.keyManagement = keyTest.success;
    results.metrics.keyManagement = keyTest.metrics;

    // Test 4: Data integrity
    const integrityTest = await testDataIntegrity();
    results.details.dataIntegrity = integrityTest.success;
    results.metrics.dataIntegrity = integrityTest.metrics;

    // Test 5: Encryption performance
    const performanceTest = await testEncryptionPerformance();
    results.details.encryptionPerformance = performanceTest.success;
    results.metrics.encryptionPerformance = performanceTest.metrics;

    // Test 6: Key rotation
    const rotationTest = await testKeyRotation();
    results.details.keyRotation = rotationTest.success;
    results.metrics.keyRotation = rotationTest.metrics;

    // Security thresholds
    const thresholds = {
      encryptionAtRest: { min: 0.99, unit: 'encryption_rate' },
      encryptionInTransit: { min: 0.95, unit: 'tls_rate' },
      keyManagement: { min: 0.98, unit: 'security_rate' },
      dataIntegrity: { min: 0.99, unit: 'integrity_rate' },
      encryptionPerformance: { max: 50, unit: 'ms_overhead' },
      keyRotation: { min: 0.90, unit: 'rotation_success' }
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
      results.details.summary = 'All data encryption tests passed security thresholds';
    } else {
      const failedTests = Object.entries(validations).filter(([_, v]) => !v).map(([k]) => k);
      results.details.summary = `Failed security thresholds: ${failedTests.join(', ')}`;
    }

  } catch (error) {
    results.error = error.message;
    results.details.error = error.stack;
  }

  return results;
}

async function testEncryptionAtRest() {
  try {
    // Test data encryption in database
    const testData = [
      { type: 'user_pii', data: { ssn: '123-45-6789', email: 'user@example.com' } },
      { type: 'financial', data: { account: '123456789', balance: 1000.00 } },
      { type: 'health', data: { medicalId: 'MED001', diagnosis: 'Test condition' } }
    ];

    const encryptionResults = [];

    for (const item of testData) {
      // Store encrypted data
      const storeResponse = await fetch('http://localhost:5002/data/mongodb/encrypted_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'encrypted_data',
          document: item,
          encrypt: true
        })
      });

      if (!storeResponse.ok) {
        encryptionResults.push({ type: item.type, encrypted: false });
        continue;
      }

      const storeData = await storeResponse.json();
      const documentId = storeData.id;

      // Retrieve and check if data is encrypted
      const retrieveResponse = await fetch(`http://localhost:5002/data/mongodb/encrypted_data/${documentId}`);
      if (retrieveResponse.ok) {
        const retrievedData = await retrieveResponse.json();

        // Check if sensitive fields are encrypted (not plain text)
        const isEncrypted = checkDataEncryption(retrievedData, item.data);
        encryptionResults.push({ type: item.type, encrypted: isEncrypted });
      } else {
        encryptionResults.push({ type: item.type, encrypted: false });
      }
    }

    // Test raw database access (should not see plain text)
    const rawAccessTest = await testRawDatabaseAccess();

    const encryptedCount = encryptionResults.filter(r => r.encrypted).length;
    const encryptionRate = encryptedCount / encryptionResults.length;

    return {
      success: encryptionRate >= 0.99 && rawAccessTest.secure, // 99% encryption rate and raw access secure
      metrics: {
        dataTypes: encryptionResults.length,
        encryptedTypes: encryptedCount,
        encryptionRate: encryptionRate,
        rawAccessSecure: rawAccessTest.secure,
        average: encryptionRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testEncryptionInTransit() {
  try {
    // Test TLS/SSL encryption for all services
    const services = [
      { name: 'main-app', port: 3000, endpoint: '/health' },
      { name: 'database-integration', port: 5002, endpoint: '/health' },
      { name: 'real-time', port: 4000, endpoint: '/health' },
      { name: 'security-core', port: 4022, endpoint: '/health' },
      { name: 'ai-orchestrator', port: 4001, endpoint: '/health' }
    ];

    const tlsResults = [];

    for (const service of services) {
      // Test HTTPS connection
      try {
        const httpsResponse = await fetch(`https://localhost:${service.port}${service.endpoint}`, {
          agent: new (require('https').Agent)({ rejectUnauthorized: false }) // For self-signed certs in testing
        });

        // Check if connection uses TLS
        const usesTLS = httpsResponse.ok; // In test environment, assume HTTPS works

        // Test HTTP connection (should redirect or fail)
        let httpBlocked = false;
        try {
          await fetch(`http://localhost:${service.port}${service.endpoint}`, { timeout: 2000 });
        } catch (error) {
          httpBlocked = true; // HTTP should be blocked or redirected
        }

        tlsResults.push({
          service: service.name,
          usesTLS: usesTLS,
          httpBlocked: httpBlocked
        });
      } catch (error) {
        tlsResults.push({
          service: service.name,
          usesTLS: false,
          httpBlocked: true
        });
      }
    }

    // Test certificate validity
    const certTest = await testCertificateValidity();

    const tlsEnabled = tlsResults.filter(r => r.usesTLS).length;
    const httpBlocked = tlsResults.filter(r => r.httpBlocked).length;
    const tlsRate = tlsEnabled / tlsResults.length;

    return {
      success: tlsRate >= 0.95 && certTest.valid, // 95% TLS usage and valid certificates
      metrics: {
        services: tlsResults.length,
        tlsEnabled: tlsEnabled,
        httpBlocked: httpBlocked,
        tlsRate: tlsRate,
        certificatesValid: certTest.valid,
        average: tlsRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testKeyManagement() {
  try {
    const keyTests = [
      // Test key generation
      { operation: 'generate_key', algorithm: 'AES-256', usage: 'data_encryption' },
      { operation: 'generate_key', algorithm: 'RSA-2048', usage: 'key_encryption' },

      // Test key storage
      { operation: 'store_key', keyId: 'test-key-1', secure: true },
      { operation: 'store_key', keyId: 'test-key-2', secure: false }, // Should fail

      // Test key access controls
      { operation: 'access_key', keyId: 'test-key-1', user: 'admin', shouldAllow: true },
      { operation: 'access_key', keyId: 'test-key-1', user: 'user', shouldAllow: false },

      // Test key backup and recovery
      { operation: 'backup_key', keyId: 'test-key-1' },
      { operation: 'recover_key', keyId: 'test-key-1' }
    ];

    const results = [];

    for (const test of keyTests) {
      const result = await performKeyOperation(test);
      let success = false;

      if (test.shouldAllow !== undefined) {
        success = result.allowed === test.shouldAllow;
      } else {
        success = result.success;
      }

      results.push({
        operation: test.operation,
        success: success,
        details: result
      });
    }

    // Test key lifecycle
    const lifecycleTest = await testKeyLifecycle();

    const successfulOperations = results.filter(r => r.success).length;
    const securityRate = successfulOperations / results.length;

    return {
      success: securityRate >= 0.98 && lifecycleTest.secure, // 98% security compliance and secure lifecycle
      metrics: {
        keyOperations: results.length,
        successfulOperations: successfulOperations,
        securityRate: securityRate,
        lifecycleSecure: lifecycleTest.secure,
        average: securityRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testDataIntegrity() {
  try {
    const integrityTests = [
      // Test data tampering detection
      { type: 'tamper_test', data: 'Original data', tamper: true },
      { type: 'integrity_test', data: 'Original data', tamper: false },

      // Test hash verification
      { type: 'hash_test', data: 'Data to hash', algorithm: 'SHA-256' },

      // Test digital signatures
      { type: 'signature_test', data: 'Data to sign', algorithm: 'RSA' }
    ];

    const results = [];

    for (const test of integrityTests) {
      const result = await testDataIntegrityCheck(test);
      results.push({
        type: test.type,
        integrityMaintained: result.integrity,
        tamperingDetected: result.tamperingDetected
      });
    }

    // Test data corruption scenarios
    const corruptionTest = await testDataCorruptionScenarios();

    const integrityMaintained = results.filter(r => r.integrityMaintained).length;
    const tamperingDetected = results.filter(r => r.tamperingDetected).length;
    const integrityRate = integrityMaintained / results.length;

    return {
      success: integrityRate >= 0.99 && corruptionTest.resilient, // 99% integrity and corruption resilient
      metrics: {
        integrityTests: results.length,
        integrityMaintained: integrityMaintained,
        tamperingDetected: tamperingDetected,
        integrityRate: integrityRate,
        corruptionResilient: corruptionTest.resilient,
        average: integrityRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testEncryptionPerformance() {
  try {
    const performanceTests = [
      { dataSize: '1KB', iterations: 100 },
      { dataSize: '10KB', iterations: 50 },
      { dataSize: '100KB', iterations: 20 },
      { dataSize: '1MB', iterations: 5 }
    ];

    const results = [];

    for (const test of performanceTests) {
      const data = generateTestData(test.dataSize);
      const latencies = [];

      for (let i = 0; i < test.iterations; i++) {
        const startTime = Date.now();

        // Test encryption operation
        const response = await fetch('http://localhost:5002/crypto/encrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: data,
            algorithm: 'AES-256'
          })
        });

        const endTime = Date.now();
        latencies.push(endTime - startTime);
      }

      const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

      results.push({
        dataSize: test.dataSize,
        iterations: test.iterations,
        averageLatency: averageLatency,
        p95Latency: p95Latency
      });
    }

    // Calculate encryption overhead
    const baselineLatencies = results.map(r => r.averageLatency);
    const averageOverhead = baselineLatencies.reduce((sum, lat) => sum + lat, 0) / baselineLatencies.length;

    return {
      success: averageOverhead <= 100, // Average encryption overhead under 100ms
      metrics: {
        performanceTests: results.length,
        averageOverhead: averageOverhead,
        maxOverhead: Math.max(...baselineLatencies),
        minOverhead: Math.min(...baselineLatencies),
        average: averageOverhead
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testKeyRotation() {
  try {
    // Test automatic key rotation
    const rotationTests = [
      { keyType: 'data_encryption', rotationInterval: '30_days' },
      { keyType: 'session_keys', rotationInterval: '24_hours' },
      { keyType: 'api_keys', rotationInterval: '90_days' }
    ];

    const results = [];

    for (const test of rotationTests) {
      // Trigger key rotation
      const rotationResponse = await fetch('http://localhost:5002/crypto/keys/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyType: test.keyType,
          reason: 'security_test'
        })
      });

      if (rotationResponse.ok) {
        const rotationData = await rotationResponse.json();

        // Test that old data can still be decrypted
        const backwardCompatibility = await testBackwardCompatibility(rotationData.oldKeyId, rotationData.newKeyId);

        // Test that new data uses new key
        const forwardCompatibility = await testForwardCompatibility(rotationData.newKeyId);

        results.push({
          keyType: test.keyType,
          rotationSuccessful: true,
          backwardCompatible: backwardCompatibility,
          forwardCompatible: forwardCompatibility
        });
      } else {
        results.push({
          keyType: test.keyType,
          rotationSuccessful: false,
          backwardCompatible: false,
          forwardCompatible: false
        });
      }
    }

    // Test emergency key rotation
    const emergencyRotation = await testEmergencyKeyRotation();

    const successfulRotations = results.filter(r => r.rotationSuccessful && r.backwardCompatible && r.forwardCompatible).length;
    const rotationSuccess = successfulRotations / results.length;

    return {
      success: rotationSuccess >= 0.90 && emergencyRotation.successful, // 90% successful rotations and emergency rotation works
      metrics: {
        rotationTests: results.length,
        successfulRotations: successfulRotations,
        rotationSuccess: rotationSuccess,
        emergencyRotation: emergencyRotation.successful,
        average: rotationSuccess
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper functions
function checkDataEncryption(retrievedData, originalData) {
  // Check if sensitive data appears to be encrypted
  const sensitiveFields = ['ssn', 'email', 'account', 'balance', 'medicalId', 'diagnosis'];

  for (const field of sensitiveFields) {
    if (originalData[field] && retrievedData[field]) {
      // If the retrieved data looks like encrypted data (not plain text)
      if (retrievedData[field] !== originalData[field] &&
          retrievedData[field].length > originalData[field].length &&
          /^[A-Za-z0-9+/=]+$/.test(retrievedData[field])) { // Base64-like
        return true;
      }
    }
  }
  return false;
}

async function testRawDatabaseAccess() {
  try {
    // Attempt to access database directly (should be blocked or encrypted)
    const response = await fetch('http://localhost:5002/data/mongodb/encrypted_data/raw');
    return { secure: !response.ok }; // Raw access should be blocked
  } catch (error) {
    return { secure: true }; // Error means access is blocked
  }
}

async function testCertificateValidity() {
  try {
    // Check certificate validity for main services
    const certCheck = await fetch('https://localhost:3000/api/certificates/status', {
      agent: new (require('https').Agent)({ rejectUnauthorized: false })
    });

    if (certCheck.ok) {
      const certData = await certCheck.json();
      return { valid: certData.valid && !certData.expired };
    }
    return { valid: false };
  } catch (error) {
    return { valid: false };
  }
}

async function performKeyOperation(test) {
  try {
    let url, method = 'POST', body = {};

    switch (test.operation) {
      case 'generate_key':
        url = 'http://localhost:5002/crypto/keys/generate';
        body = { algorithm: test.algorithm, usage: test.usage };
        break;
      case 'store_key':
        url = 'http://localhost:5002/crypto/keys/store';
        body = { keyId: test.keyId, secure: test.secure };
        break;
      case 'access_key':
        url = `http://localhost:5002/crypto/keys/${test.keyId}/access`;
        body = { user: test.user };
        method = 'GET';
        break;
      case 'backup_key':
        url = `http://localhost:5002/crypto/keys/${test.keyId}/backup`;
        break;
      case 'recover_key':
        url = `http://localhost:5002/crypto/keys/${test.keyId}/recover`;
        break;
    }

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (test.shouldAllow !== undefined) {
      return { allowed: response.ok };
    }

    return { success: response.ok };
  } catch (error) {
    return { success: false };
  }
}

async function testKeyLifecycle() {
  try {
    // Create a key
    const createResponse = await fetch('http://localhost:5002/crypto/keys/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm: 'AES-256', usage: 'test' })
    });

    if (!createResponse.ok) return { secure: false };

    const keyData = await createResponse.json();
    const keyId = keyData.keyId;

    // Use the key
    const useResponse = await fetch('http://localhost:5002/crypto/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'test data', keyId: keyId })
    });

    // Revoke the key
    const revokeResponse = await fetch(`http://localhost:5002/crypto/keys/${keyId}/revoke`, {
      method: 'POST'
    });

    // Try to use revoked key (should fail)
    const useRevokedResponse = await fetch('http://localhost:5002/crypto/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'test data', keyId: keyId })
    });

    return {
      secure: useResponse.ok && revokeResponse.ok && !useRevokedResponse.ok
    };
  } catch (error) {
    return { secure: false };
  }
}

async function testDataIntegrityCheck(test) {
  try {
    const response = await fetch('http://localhost:5002/crypto/integrity/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test)
    });

    if (response.ok) {
      const result = await response.json();
      return {
        integrity: result.integrity,
        tamperingDetected: result.tamperingDetected
      };
    }

    return { integrity: false, tamperingDetected: false };
  } catch (error) {
    return { integrity: false, tamperingDetected: false };
  }
}

async function testDataCorruptionScenarios() {
  try {
    // Test various corruption scenarios
    const scenarios = [
      { type: 'bit_flip', data: 'test data', corruption: 'flip random bit' },
      { type: 'truncation', data: 'test data', corruption: 'truncate end' },
      { type: 'insertion', data: 'test data', corruption: 'insert bytes' }
    ];

    let resilientCount = 0;

    for (const scenario of scenarios) {
      const response = await fetch('http://localhost:5002/crypto/integrity/corruption-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.corruptionDetected) {
          resilientCount++;
        }
      }
    }

    return { resilient: resilientCount === scenarios.length };
  } catch (error) {
    return { resilient: false };
  }
}

function generateTestData(size) {
  const sizes = {
    '1KB': 1024,
    '10KB': 10240,
    '100KB': 102400,
    '1MB': 1048576
  };

  const length = sizes[size] || 1024;
  return 'x'.repeat(length);
}

async function testBackwardCompatibility(oldKeyId, newKeyId) {
  try {
    // Test that data encrypted with old key can still be decrypted
    const response = await fetch('http://localhost:5002/crypto/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encryptedData: 'test-encrypted-data',
        keyId: oldKeyId
      })
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

async function testForwardCompatibility(newKeyId) {
  try {
    // Test that new key works for encryption
    const response = await fetch('http://localhost:5002/crypto/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: 'test data',
        keyId: newKeyId
      })
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

async function testEmergencyKeyRotation() {
  try {
    // Test emergency key rotation (should work without normal delays)
    const response = await fetch('http://localhost:5002/crypto/keys/emergency-rotate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'security_breach',
        immediate: true
      })
    });

    return { successful: response.ok };
  } catch (error) {
    return { successful: false };
  }
}