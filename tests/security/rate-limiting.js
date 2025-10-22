/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Rate Limiting Security Test
 *
 * Tests rate limiting mechanisms and DoS protection
 * Validates request throttling and abuse prevention
 */

const fetch = require('node-fetch');
const { setTimeout } = require('timers');
const { Buffer } = require('buffer');
const FormData = require('form-data');

async function run() {
  const results = {
    passed: false,
    details: {},
    metrics: {},
    error: null
  };

  try {
    console.log('  🛑 Testing rate limiting...');

    // Test 1: API rate limiting
    const apiTest = await testAPIRateLimiting();
    results.details.apiRateLimiting = apiTest.success;
    results.metrics.apiRateLimiting = apiTest.metrics;

    // Test 2: Authentication rate limiting
    const authTest = await testAuthenticationRateLimiting();
    results.details.authenticationRateLimiting = authTest.success;
    results.metrics.authenticationRateLimiting = authTest.metrics;

    // Test 3: File upload rate limiting
    const uploadTest = await testFileUploadRateLimiting();
    results.details.fileUploadRateLimiting = uploadTest.success;
    results.metrics.fileUploadRateLimiting = uploadTest.metrics;

    // Test 4: IP-based rate limiting
    const ipTest = await testIPBasedRateLimiting();
    results.details.ipBasedRateLimiting = ipTest.success;
    results.metrics.ipBasedRateLimiting = ipTest.metrics;

    // Test 5: Burst handling
    const burstTest = await testBurstHandling();
    results.details.burstHandling = burstTest.success;
    results.metrics.burstHandling = burstTest.metrics;

    // Test 6: Rate limit recovery
    const recoveryTest = await testRateLimitRecovery();
    results.details.rateLimitRecovery = recoveryTest.success;
    results.metrics.rateLimitRecovery = recoveryTest.metrics;

    // Security thresholds
    const thresholds = {
      apiRateLimiting: { min: 0.95, unit: 'enforcement_rate' },
      authenticationRateLimiting: { min: 0.98, unit: 'enforcement_rate' },
      fileUploadRateLimiting: { min: 0.90, unit: 'enforcement_rate' },
      ipBasedRateLimiting: { min: 0.95, unit: 'enforcement_rate' },
      burstHandling: { min: 0.85, unit: 'handling_rate' },
      rateLimitRecovery: { min: 0.90, unit: 'recovery_rate' }
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
      results.details.summary = 'All rate limiting tests passed security thresholds';
    } else {
      const failedTests = Object.entries(validations).filter(([, v]) => !v).map(([k]) => k);
      results.details.summary = `Failed security thresholds: ${failedTests.join(', ')}`;
    }

  } catch (error) {
    results.error = error.message;
    results.details.error = error.stack;
  }

  return results;
}

module.exports = { run };

async function testAPIRateLimiting() {
  try {
    const endpoint = 'http://localhost:3000/api/data/status';
    const requestsPerMinute = 100; // Assuming 100 req/min limit
    const testRequests = requestsPerMinute * 2; // Try to exceed limit

    const results = [];
    const startTime = Date.now();

    // Send requests as fast as possible
    for (let i = 0; i < testRequests; i++) {
      const response = await fetch(endpoint);
      results.push({
        request: i + 1,
        status: response.status,
        limited: response.status === 429,
        timestamp: Date.now()
      });

      // Small delay to avoid overwhelming the test itself
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // seconds

    // Check if rate limiting kicked in
    const limitedRequests = results.filter(r => r.limited).length;
    const enforcementRate = limitedRequests > 0 ? 1 : 0;

    // Check timing distribution
    const limitedTimestamps = results.filter(r => r.limited).map(r => r.timestamp);
    const firstLimit = limitedTimestamps.length > 0 ? Math.min(...limitedTimestamps) : endTime;
    const timeToLimit = (firstLimit - startTime) / 1000;

    return {
      success: enforcementRate >= 0.95, // Rate limiting should be enforced
      metrics: {
        totalRequests: testRequests,
        limitedRequests: limitedRequests,
        enforcementRate: enforcementRate,
        timeToLimit: timeToLimit,
        duration: duration,
        average: enforcementRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testAuthenticationRateLimiting() {
  try {
    const loginAttempts = 50; // Exceed typical login rate limits
    const results = [];

    for (let i = 0; i < loginAttempts; i++) {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `test-user-${i}`,
          password: 'wrong-password',
          clientType: 'rate-limit-test'
        })
      });

      results.push({
        attempt: i + 1,
        status: response.status,
        limited: response.status === 429,
        blocked: response.status === 429 || response.status === 403
      });

      // Progressive delay to test different rate limit windows
      await new Promise(resolve => setTimeout(resolve, 100 + (i * 10)));
    }

    const limitedAttempts = results.filter(r => r.limited).length;
    const blockedAttempts = results.filter(r => r.blocked).length;
    const enforcementRate = blockedAttempts / loginAttempts;

    return {
      success: enforcementRate >= 0.98, // 98% of excessive login attempts should be blocked
      metrics: {
        loginAttempts: loginAttempts,
        limitedAttempts: limitedAttempts,
        blockedAttempts: blockedAttempts,
        enforcementRate: enforcementRate,
        average: enforcementRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testFileUploadRateLimiting() {
  try {
    const uploadAttempts = 20; // Exceed typical upload rate limits
    const testFile = Buffer.from('test content', 'utf-8');
    const results = [];

    for (let i = 0; i < uploadAttempts; i++) {
      const formData = new FormData();
      formData.append('file', testFile, `test-file-${i}.txt`);

      const response = await fetch('http://localhost:3000/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer test-token' },
        body: formData
      });

      results.push({
        attempt: i + 1,
        status: response.status,
        limited: response.status === 429,
        allowed: response.ok
      });

      // Delay between uploads
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const limitedUploads = results.filter(r => r.limited).length;
    const allowedUploads = results.filter(r => r.allowed).length;
    const enforcementRate = limitedUploads > 0 ? 1 : 0;

    return {
      success: enforcementRate >= 0.90, // Upload rate limiting should be enforced
      metrics: {
        uploadAttempts: uploadAttempts,
        limitedUploads: limitedUploads,
        allowedUploads: allowedUploads,
        enforcementRate: enforcementRate,
        average: enforcementRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testIPBasedRateLimiting() {
  try {
    const endpoint = 'http://localhost:3000/api/public/status';
    const requestsPerIP = 200; // Exceed per-IP rate limits
    const results = [];

    // Simulate requests from same IP (using same connection)
    for (let i = 0; i < requestsPerIP; i++) {
      const response = await fetch(endpoint, {
        headers: {
          'X-Forwarded-For': '192.168.1.100', // Simulate same IP
          'User-Agent': 'RateLimit-Test/1.0'
        }
      });

      results.push({
        request: i + 1,
        status: response.status,
        limited: response.status === 429,
        ip: '192.168.1.100'
      });

      // Small delay
      if (i % 20 === 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    const limitedRequests = results.filter(r => r.limited).length;
    const enforcementRate = limitedRequests > 0 ? 1 : 0;

    // Test different IP (should not be limited)
    const differentIPResponse = await fetch(endpoint, {
      headers: {
        'X-Forwarded-For': '192.168.1.101', // Different IP
        'User-Agent': 'RateLimit-Test/1.0'
      }
    });

    const differentIPLimited = differentIPResponse.status === 429;

    return {
      success: enforcementRate >= 0.95 && !differentIPLimited, // Same IP limited, different IP not limited
      metrics: {
        requestsPerIP: requestsPerIP,
        limitedRequests: limitedRequests,
        enforcementRate: enforcementRate,
        differentIPLimited: differentIPLimited,
        average: enforcementRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testBurstHandling() {
  try {
    const endpoint = 'http://localhost:3000/api/data/status';
    const burstSize = 50; // Large burst of requests
    const results = [];

    // Send burst of requests simultaneously
    const burstPromises = [];
    for (let i = 0; i < burstSize; i++) {
      burstPromises.push(
        fetch(endpoint).then(response => ({
          request: i + 1,
          status: response.status,
          limited: response.status === 429,
          timestamp: Date.now()
        }))
      );
    }

    const burstResults = await Promise.all(burstPromises);
    results.push(...burstResults);

    // Wait and test sustained requests
    await new Promise(resolve => setTimeout(resolve, 1000));

    const sustainedRequests = 20;
    for (let i = 0; i < sustainedRequests; i++) {
      const response = await fetch(endpoint);
      results.push({
        request: burstSize + i + 1,
        status: response.status,
        limited: response.status === 429,
        timestamp: Date.now(),
        type: 'sustained'
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const burstLimited = burstResults.filter(r => r.limited).length;
    const sustainedLimited = results.slice(burstSize).filter(r => r.limited).length;
    const burstHandlingRate = burstLimited / burstSize;
    const sustainedHandlingRate = sustainedLimited / sustainedRequests;

    // Good burst handling means some burst requests are limited but sustained requests work
    const overallHandlingRate = (burstHandlingRate * 0.7) + (sustainedHandlingRate * 0.3);

    return {
      success: overallHandlingRate >= 0.85, // Good balance of burst protection and sustained availability
      metrics: {
        burstSize: burstSize,
        burstLimited: burstLimited,
        sustainedRequests: sustainedRequests,
        sustainedLimited: sustainedLimited,
        burstHandlingRate: burstHandlingRate,
        sustainedHandlingRate: sustainedHandlingRate,
        overallHandlingRate: overallHandlingRate,
        average: overallHandlingRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testRateLimitRecovery() {
  try {
    const endpoint = 'http://localhost:3000/api/data/status';
    const excessiveRequests = 100;
    const recoveryRequests = 10;

    // First, trigger rate limiting
    console.log('  Triggering rate limit...');
    for (let i = 0; i < excessiveRequests; i++) {
      await fetch(endpoint);
      if (i % 20 === 0) await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Wait for rate limit to be triggered
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test recovery - requests should eventually succeed again
    const recoveryResults = [];
    const recoveryStart = Date.now();

    for (let i = 0; i < recoveryRequests; i++) {
      const response = await fetch(endpoint);
      recoveryResults.push({
        attempt: i + 1,
        status: response.status,
        success: response.ok,
        timestamp: Date.now()
      });

      // Wait for rate limit window to potentially reset
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const recoveryEnd = Date.now();
    const recoveryTime = (recoveryEnd - recoveryStart) / 1000;

    // Check if system recovered (some requests succeeded)
    const successfulRecoveries = recoveryResults.filter(r => r.success).length;
    const recoveryRate = successfulRecoveries / recoveryRequests;

    // Recovery should happen within reasonable time (not too fast, not too slow)
    const reasonableRecovery = recoveryTime >= 5 && recoveryTime <= 300; // 5 seconds to 5 minutes

    return {
      success: recoveryRate >= 0.90 && reasonableRecovery, // 90% recovery rate within reasonable time
      metrics: {
        excessiveRequests: excessiveRequests,
        recoveryRequests: recoveryRequests,
        successfulRecoveries: successfulRecoveries,
        recoveryRate: recoveryRate,
        recoveryTimeSeconds: recoveryTime,
        reasonableRecovery: reasonableRecovery,
        average: recoveryRate
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}