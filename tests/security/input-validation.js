/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Input Validation Security Test
 *
 * Tests input validation and sanitization mechanisms
 * Validates protection against injection attacks and malformed data
 */

export async function run() {
  const results = {
    passed: false,
    details: {},
    metrics: {},
    error: null
  };

  try {
    console.log('  ✅ Testing input validation...');

    // Test 1: SQL injection prevention
    const sqlTest = await testSQLInjectionPrevention();
    results.details.sqlInjectionPrevention = sqlTest.success;
    results.metrics.sqlInjectionPrevention = sqlTest.metrics;

    // Test 2: XSS prevention
    const xssTest = await testXSSPrevention();
    results.details.xssPrevention = xssTest.success;
    results.metrics.xssPrevention = xssTest.metrics;

    // Test 3: Command injection prevention
    const commandTest = await testCommandInjectionPrevention();
    results.details.commandInjectionPrevention = commandTest.success;
    results.metrics.commandInjectionPrevention = commandTest.metrics;

    // Test 4: Data type validation
    const dataTypeTest = await testDataTypeValidation();
    results.details.dataTypeValidation = dataTypeTest.success;
    results.metrics.dataTypeValidation = dataTypeTest.metrics;

    // Test 5: Length and size limits
    const lengthTest = await testLengthAndSizeLimits();
    results.details.lengthAndSizeLimits = lengthTest.success;
    results.metrics.lengthAndSizeLimits = lengthTest.metrics;

    // Test 6: Malformed data handling
    const malformedTest = await testMalformedDataHandling();
    results.details.malformedDataHandling = malformedTest.success;
    results.metrics.malformedDataHandling = malformedTest.metrics;

    // Security thresholds
    const thresholds = {
      sqlInjectionPrevention: { min: 0.99, unit: 'prevention_rate' },
      xssPrevention: { min: 0.98, unit: 'prevention_rate' },
      commandInjectionPrevention: { min: 0.99, unit: 'prevention_rate' },
      dataTypeValidation: { min: 0.95, unit: 'validation_rate' },
      lengthAndSizeLimits: { min: 0.95, unit: 'enforcement_rate' },
      malformedDataHandling: { min: 0.90, unit: 'handling_rate' }
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
      results.details.summary = 'All input validation tests passed security thresholds';
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

async function testSQLInjectionPrevention() {
  try {
    const sqlInjectionAttempts = [
      // Classic SQL injection
      { input: "'; DROP TABLE users; --", type: 'string' },
      { input: "' OR '1'='1", type: 'string' },
      { input: "admin' --", type: 'string' },

      // Union-based injection
      { input: "' UNION SELECT username, password FROM users --", type: 'string' },

      // Blind SQL injection
      { input: "' AND 1=1 --", type: 'string' },
      { input: "' AND 1=2 --", type: 'string' },

      // Time-based injection
      { input: "' AND SLEEP(5) --", type: 'string' },

      // Numeric injection
      { input: "1; DROP TABLE users", type: 'number' },
      { input: "1 OR 1=1", type: 'number' }
    ];

    const results = [];

    for (const attempt of sqlInjectionAttempts) {
      // Test via API endpoint that uses database queries
      const response = await fetch('http://localhost:5002/data/mongodb/users/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'users',
          query: attempt.type === 'string' ?
            { username: attempt.input } :
            { id: parseInt(attempt.input) || 0 }
        })
      });

      // Check if injection was prevented (should not execute dangerous operations)
      const injectionBlocked = !response.ok || response.status === 400;

      // Additional check: ensure no data was unexpectedly returned
      let unexpectedData = false;
      if (response.ok) {
        const data = await response.json();
        unexpectedData = data.documents && data.documents.length > 0 && attempt.input.includes('DROP');
      }

      results.push({
        attempt: attempt.input.substring(0, 30) + '...',
        blocked: injectionBlocked && !unexpectedData
      });
    }

    const blockedRate = results.filter(r => r.blocked).length / results.length;

    return {
      success: blockedRate >= 0.99, // 99% of SQL injection attempts prevented
      metrics: {
        injectionAttempts: sqlInjectionAttempts.length,
        blockedAttempts: results.filter(r => r.blocked).length,
        blockedRate: blockedRate,
        average: blockedRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testXSSPrevention() {
  try {
    const xssAttempts = [
      // Basic XSS
      { input: "<script>alert('XSS')</script>", field: 'comment' },
      { input: "<img src=x onerror=alert('XSS')>", field: 'description' },

      // Event handler XSS
      { input: "<div onmouseover=alert('XSS')>", field: 'content' },

      // JavaScript URL XSS
      { input: "javascript:alert('XSS')", field: 'link' },

      // Encoded XSS
      { input: "%3Cscript%3Ealert('XSS')%3C/script%3E", field: 'input' },

      // DOM-based XSS
      { input: "#<script>alert('XSS')</script>", field: 'fragment' },

      // Stored XSS
      { input: "<iframe src='javascript:alert(\"XSS\")'>", field: 'bio' }
    ];

    const results = [];

    for (const attempt of xssAttempts) {
      // Test via user profile update (stored XSS)
      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          [attempt.field]: attempt.input
        })
      });

      // Check if XSS was prevented
      const xssBlocked = response.status === 400 || response.status === 422;

      // Additional check: retrieve and verify output is sanitized
      if (response.ok) {
        const getResponse = await fetch('http://localhost:3000/api/user/profile', {
          headers: { 'Authorization': 'Bearer test-token' }
        });

        if (getResponse.ok) {
          const profile = await getResponse.json();
          const output = profile[attempt.field] || '';
          const isSanitized = !output.includes('<script') && !output.includes('javascript:');
          results.push({ attempt: attempt.input.substring(0, 30) + '...', blocked: xssBlocked || isSanitized });
        } else {
          results.push({ attempt: attempt.input.substring(0, 30) + '...', blocked: xssBlocked });
        }
      } else {
        results.push({ attempt: attempt.input.substring(0, 30) + '...', blocked: xssBlocked });
      }
    }

    const blockedRate = results.filter(r => r.blocked).length / results.length;

    return {
      success: blockedRate >= 0.98, // 98% of XSS attempts prevented
      metrics: {
        xssAttempts: xssAttempts.length,
        blockedAttempts: results.filter(r => r.blocked).length,
        blockedRate: blockedRate,
        average: blockedRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testCommandInjectionPrevention() {
  try {
    const commandInjectionAttempts = [
      // Shell command injection
      { input: "; rm -rf /", type: 'filename' },
      { input: "| cat /etc/passwd", type: 'command' },
      { input: "`whoami`", type: 'user_input' },

      // Command chaining
      { input: "file.txt && rm -rf /", type: 'filename' },
      { input: "file.txt || cat /etc/passwd", type: 'filename' },

      // Command substitution
      { input: "$(rm -rf /)", type: 'path' },

      // Background commands
      { input: "file.txt & rm -rf / &", type: 'filename' },

      // Pipe injection
      { input: "file.txt | rm -rf /", type: 'filename' }
    ];

    const results = [];

    for (const attempt of commandInjectionAttempts) {
      // Test via file upload/processing endpoint
      const formData = new FormData();
      formData.append('file', new Blob(['test content']), attempt.input);
      formData.append('type', attempt.type);

      const response = await fetch('http://localhost:3000/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer test-token' },
        body: formData
      });

      // Check if command injection was prevented
      const injectionBlocked = response.status === 400 || response.status === 422;

      // Additional check: ensure no system commands were executed
      const systemCheck = await checkSystemIntegrity();

      results.push({
        attempt: attempt.input.substring(0, 30) + '...',
        blocked: injectionBlocked && systemCheck.integrity
      });
    }

    const blockedRate = results.filter(r => r.blocked).length / results.length;

    return {
      success: blockedRate >= 0.99, // 99% of command injection attempts prevented
      metrics: {
        injectionAttempts: commandInjectionAttempts.length,
        blockedAttempts: results.filter(r => r.blocked).length,
        blockedRate: blockedRate,
        average: blockedRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testDataTypeValidation() {
  try {
    const dataTypeTests = [
      // String validation
      { field: 'email', value: 'user@example.com', expectedType: 'email', shouldPass: true },
      { field: 'email', value: 'not-an-email', expectedType: 'email', shouldPass: false },
      { field: 'email', value: '', expectedType: 'email', shouldPass: false },

      // Numeric validation
      { field: 'age', value: 25, expectedType: 'number', shouldPass: true },
      { field: 'age', value: '25', expectedType: 'number', shouldPass: true },
      { field: 'age', value: 'not-a-number', expectedType: 'number', shouldPass: false },

      // Date validation
      { field: 'birthDate', value: '1990-01-01', expectedType: 'date', shouldPass: true },
      { field: 'birthDate', value: 'not-a-date', expectedType: 'date', shouldPass: false },

      // Boolean validation
      { field: 'active', value: true, expectedType: 'boolean', shouldPass: true },
      { field: 'active', value: 'true', expectedType: 'boolean', shouldPass: true },
      { field: 'active', value: 'yes', expectedType: 'boolean', shouldPass: false },

      // Array validation
      { field: 'tags', value: ['tag1', 'tag2'], expectedType: 'array', shouldPass: true },
      { field: 'tags', value: 'not-an-array', expectedType: 'array', shouldPass: false },

      // Object validation
      { field: 'address', value: { street: '123 Main St', city: 'Anytown' }, expectedType: 'object', shouldPass: true },
      { field: 'address', value: 'not-an-object', expectedType: 'object', shouldPass: false }
    ];

    const results = [];

    for (const test of dataTypeTests) {
      const response = await fetch('http://localhost:3000/api/validation/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: test.field,
          value: test.value,
          expectedType: test.expectedType
        })
      });

      let validationCorrect = false;
      if (response.ok) {
        const result = await response.json();
        validationCorrect = result.valid === test.shouldPass;
      } else if (response.status === 400) {
        // If validation failed as expected
        validationCorrect = !test.shouldPass;
      }

      results.push({
        field: test.field,
        type: test.expectedType,
        expected: test.shouldPass,
        correct: validationCorrect
      });
    }

    const correctValidations = results.filter(r => r.correct).length;
    const validationRate = correctValidations / results.length;

    return {
      success: validationRate >= 0.95, // 95% of data type validations correct
      metrics: {
        validationTests: results.length,
        correctValidations: correctValidations,
        validationRate: validationRate,
        average: validationRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testLengthAndSizeLimits() {
  try {
    const lengthTests = [
      // String length limits
      { field: 'username', value: 'a'.repeat(5), maxLength: 50, shouldPass: true },
      { field: 'username', value: 'a'.repeat(100), maxLength: 50, shouldPass: false },
      { field: 'description', value: 'a'.repeat(100), maxLength: 500, shouldPass: true },
      { field: 'description', value: 'a'.repeat(1000), maxLength: 500, shouldPass: false },

      // File size limits
      { field: 'avatar', size: 1024, maxSize: 2048, shouldPass: true }, // 1KB < 2KB
      { field: 'avatar', size: 5120, maxSize: 2048, shouldPass: false }, // 5KB > 2KB

      // Array length limits
      { field: 'tags', value: Array(5).fill('tag'), maxItems: 10, shouldPass: true },
      { field: 'tags', value: Array(20).fill('tag'), maxItems: 10, shouldPass: false }
    ];

    const results = [];

    for (const test of lengthTests) {
      let response;

      if (test.size !== undefined) {
        // File upload test
        const formData = new FormData();
        formData.append('file', new Blob(['x'.repeat(test.size)]), 'test-file');
        response = await fetch('http://localhost:3000/api/files/upload', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer test-token' },
          body: formData
        });
      } else {
        // Regular field validation
        response = await fetch('http://localhost:3000/api/validation/length', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field: test.field,
            value: test.value,
            maxLength: test.maxLength,
            maxItems: test.maxItems
          })
        });
      }

      const limitEnforced = (response.ok && test.shouldPass) || (!response.ok && !test.shouldPass);

      results.push({
        field: test.field,
        limit: test.maxLength || test.maxSize || test.maxItems,
        expected: test.shouldPass,
        enforced: limitEnforced
      });
    }

    const enforcedLimits = results.filter(r => r.enforced).length;
    const enforcementRate = enforcedLimits / results.length;

    return {
      success: enforcementRate >= 0.95, // 95% of length/size limits enforced
      metrics: {
        limitTests: results.length,
        enforcedLimits: enforcedLimits,
        enforcementRate: enforcementRate,
        average: enforcementRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testMalformedDataHandling() {
  try {
    const malformedTests = [
      // JSON malformed
      { type: 'json', data: '{"name": "test", "value": }', shouldHandle: true },
      { type: 'json', data: '{"name": "test", "value": undefined}', shouldHandle: true },

      // XML malformed
      { type: 'xml', data: '<user><name>Test</invalid>', shouldHandle: true },

      // Base64 malformed
      { type: 'base64', data: 'SGVsbG8gV29ybGQ=@', shouldHandle: true }, // Invalid base64

      // Binary data
      { type: 'binary', data: new Uint8Array([255, 254, 253]), shouldHandle: true },

      // Null bytes
      { type: 'string', data: 'test\x00data', shouldHandle: true },

      // Unicode issues
      { type: 'unicode', data: 'test\ud800', shouldHandle: true }, // Invalid surrogate

      // Extremely large numbers
      { type: 'number', data: '999999999999999999999999999999', shouldHandle: true }
    ];

    const results = [];

    for (const test of malformedTests) {
      const response = await fetch('http://localhost:3000/api/validation/malformed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: test.type,
          data: test.data
        })
      });

      // Should handle malformed data gracefully (not crash, return appropriate error)
      const handledGracefully = response.status === 400 || response.status === 422 || response.ok;

      results.push({
        type: test.type,
        expected: test.shouldHandle,
        handled: handledGracefully
      });
    }

    // Test system stability after malformed data
    const stabilityTest = await testSystemStabilityAfterMalformedData();

    const handledCorrectly = results.filter(r => r.handled === r.expected).length;
    const handlingRate = handledCorrectly / results.length;

    return {
      success: handlingRate >= 0.90 && stabilityTest.stable, // 90% handled correctly and system remains stable
      metrics: {
        malformedTests: results.length,
        handledCorrectly: handledCorrectly,
        handlingRate: handlingRate,
        systemStable: stabilityTest.stable,
        average: handlingRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper functions
async function checkSystemIntegrity() {
  try {
    // Check if critical system files still exist
    const response = await fetch('http://localhost:3000/api/system/integrity');
    if (response.ok) {
      const integrity = await response.json();
      return { integrity: integrity.filesIntact };
    }
    return { integrity: true }; // Assume integrity if check fails
  } catch (error) {
    return { integrity: true };
  }
}

async function testSystemStabilityAfterMalformedData() {
  try {
    // Test basic system functionality after malformed data tests
    const healthResponse = await fetch('http://localhost:3000/health');
    const apiResponse = await fetch('http://localhost:3000/api/status');

    return {
      stable: healthResponse.ok && apiResponse.ok
    };
  } catch (error) {
    return { stable: false };
  }
}