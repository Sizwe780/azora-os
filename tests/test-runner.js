/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * Azora OS - Comprehensive Testing Suite
 *
 * Runs all tests across services, integrations, and performance
 * Provides detailed reporting and certification readiness
 */

//import { execSync, spawn } from 'child_process';
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const TEST_RESULTS = {
  services: {},
  integrations: {},
  performance: {},
  security: {},
  overall: {
    passed: 0,
    failed: 0,
    total: 0,
    startTime: new Date(),
    endTime: null
  }
};

const SERVICES = [
  'database-integration',
  'real-time',
  'security-core',
  'ai-orchestrator',
  'blockchain-verification'
];

const INTEGRATION_TESTS = [
  'database-realtime-sync',
  'ai-security-integration',
  'blockchain-database-sync',
  'multi-service-communication',
  'gdpr-compliance-test',
  'hipaa-compliance-test'
];

// ============================================================================
// SERVICE HEALTH TESTS
// ============================================================================

async function testServiceHealth(serviceName) {
  console.log(`\n🔍 Testing ${serviceName} service health...`);

  const results = {
    name: serviceName,
    health: false,
    endpoints: {},
    errors: []
  };

  try {
    // Import service configuration
    const serviceConfig = await getServiceConfig(serviceName);
    if (!serviceConfig) {
      results.errors.push('Service configuration not found');
      return results;
    }

    const { port, endpoints } = serviceConfig;

    // Test health endpoint
    const healthResponse = await testEndpoint(`http://localhost:${port}/health`);
    if (healthResponse.success) {
      results.health = true;
      results.endpoints.health = healthResponse.data;
    } else {
      results.errors.push(`Health check failed: ${healthResponse.error}`);
    }

    // Test additional endpoints
    for (const [endpointName, endpointPath] of Object.entries(endpoints || {})) {
      const endpointResponse = await testEndpoint(`http://localhost:${port}${endpointPath}`);
      results.endpoints[endpointName] = endpointResponse.success ? '✅' : '❌';
      if (!endpointResponse.success) {
        results.errors.push(`${endpointName} endpoint failed: ${endpointResponse.error}`);
      }
    }

  } catch (error) {
    results.errors.push(`Service test error: ${error.message}`);
  }

  TEST_RESULTS.services[serviceName] = results;
  return results;
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

async function runIntegrationTests() {
  console.log('\n🔗 Running integration tests...');

  for (const testName of INTEGRATION_TESTS) {
    console.log(`\n📋 Running ${testName} integration test...`);

    const result = await runIntegrationTest(testName);
    TEST_RESULTS.integrations[testName] = result;

    if (result.passed) {
      TEST_RESULTS.overall.passed++;
    } else {
      TEST_RESULTS.overall.failed++;
    }
    TEST_RESULTS.overall.total++;
  }
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

async function runPerformanceTests() {
  console.log('\n⚡ Running performance tests...');

  const performanceTests = [
    'database-throughput',
    'realtime-connections',
    'ai-response-time',
    'concurrent-users'
  ];

  for (const testName of performanceTests) {
    console.log(`\n🏃 Running ${testName} performance test...`);

    const result = await runPerformanceTest(testName);
    TEST_RESULTS.performance[testName] = result;

    if (result.passed) {
      TEST_RESULTS.overall.passed++;
    } else {
      TEST_RESULTS.overall.failed++;
    }
    TEST_RESULTS.overall.total++;
  }
}

// ============================================================================
// SECURITY TESTS
// ============================================================================

async function runSecurityTests() {
  console.log('\n🔒 Running security tests...');

  const securityTests = [
    'authentication-validation',
    'authorization-checks',
    'data-encryption',
    'input-validation',
    'rate-limiting'
  ];

  for (const testName of securityTests) {
    console.log(`\n🛡️  Running ${testName} security test...`);

    const result = await runSecurityTest(testName);
    TEST_RESULTS.security[testName] = result;

    if (result.passed) {
      TEST_RESULTS.overall.passed++;
    } else {
      TEST_RESULTS.overall.failed++;
    }
    TEST_RESULTS.overall.total++;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function getServiceConfig(serviceName) {
  const configPath = path.join(process.cwd(), 'services', serviceName, 'test-config.json');

  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config;
    }
  } catch (error) {
    console.warn(`Could not load config for ${serviceName}:`, error.message);
  }

  // Default configurations
  const defaultConfigs = {
    'database-integration': {
      port: 5002,
      endpoints: {
        metrics: '/analytics/metrics/test-company',
        dashboard: '/analytics/dashboard/test-company'
      }
    },
    'real-time': {
      port: 4000,
      endpoints: {
        users: '/users/active',
        rooms: '/rooms/active'
      }
    },
    'security-core': {
      port: 4022,
      endpoints: {
        status: '/status'
      }
    },
    'ai-orchestrator': {
      port: 4001,
      endpoints: {
        models: '/models'
      }
    },
    'blockchain-verification': {
      port: 3001,
      endpoints: {
        verify: '/verify'
      }
    }
  };

  return defaultConfigs[serviceName];
}

async function testEndpoint(url, options = {}) {
  try {
    const response = await fetch(url, {
      timeout: 5000,
      ...options
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runIntegrationTest(testName) {
  const testFile = path.join(process.cwd(), 'tests', 'integration', `${testName}.js`);

  try {
    if (fs.existsSync(testFile)) {
      const testModule = await import(testFile);
      const result = await testModule.run();
      return result;
    } else {
      return {
        passed: false,
        error: 'Test file not found',
        details: `Missing ${testFile}`
      };
    }
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      details: error.stack
    };
  }
}

async function runPerformanceTest(testName) {
  const testFile = path.join(process.cwd(), 'tests', 'performance', `${testName}.js`);

  try {
    if (fs.existsSync(testFile)) {
      const testModule = await import(testFile);
      const result = await testModule.run();
      return result;
    } else {
      return {
        passed: false,
        error: 'Test file not found',
        details: `Missing ${testFile}`
      };
    }
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      details: error.stack
    };
  }
}

async function runSecurityTest(testName) {
  const testFile = path.join(process.cwd(), 'tests', 'security', `${testName}.js`);

  try {
    if (fs.existsSync(testFile)) {
      const testModule = await import(testFile);
      const result = await testModule.run();
      return result;
    } else {
      return {
        passed: false,
        error: 'Test file not found',
        details: `Missing ${testFile}`
      };
    }
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      details: error.stack
    };
  }
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport() {
  TEST_RESULTS.overall.endTime = new Date();
  const duration = TEST_RESULTS.overall.endTime - TEST_RESULTS.overall.startTime;

  console.log('\n' + '='.repeat(80));
  console.log('🧪 AZORA OS TESTING REPORT');
  console.log('='.repeat(80));

  console.log(`\n⏱️  Test Duration: ${Math.round(duration / 1000)}s`);
  console.log(`📊 Overall Results: ${TEST_RESULTS.overall.passed}/${TEST_RESULTS.overall.total} tests passed`);

  const successRate = TEST_RESULTS.overall.total > 0 ?
    Math.round((TEST_RESULTS.overall.passed / TEST_RESULTS.overall.total) * 100) : 0;

  console.log(`✅ Success Rate: ${successRate}%`);

  // Service Health Results
  console.log('\n🏥 SERVICE HEALTH:');
  Object.entries(TEST_RESULTS.services).forEach(([service, result]) => {
    const status = result.health ? '✅' : '❌';
    console.log(`  ${status} ${service}: ${result.errors.length} errors`);
    if (result.errors.length > 0) {
      result.errors.forEach(error => console.log(`    - ${error}`));
    }
  });

  // Integration Results
  console.log('\n🔗 INTEGRATION TESTS:');
  Object.entries(TEST_RESULTS.integrations).forEach(([test, result]) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${test}`);
    if (!result.passed && result.error) {
      console.log(`    - ${result.error}`);
    }
  });

  // Performance Results
  console.log('\n⚡ PERFORMANCE TESTS:');
  Object.entries(TEST_RESULTS.performance).forEach(([test, result]) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${test}`);
    if (result.metrics) {
      Object.entries(result.metrics).forEach(([metric, value]) => {
        console.log(`    - ${metric}: ${value}`);
      });
    }
  });

  // Security Results
  console.log('\n🔒 SECURITY TESTS:');
  Object.entries(TEST_RESULTS.security).forEach(([test, result]) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${test}`);
    if (!result.passed && result.details) {
      console.log(`    - ${result.details}`);
    }
  });

  // Certification Status
  console.log('\n🏆 CERTIFICATION STATUS:');
  const certificationThreshold = 95;
  if (successRate >= certificationThreshold) {
    console.log(`🎉 PRODUCTION READY: ${successRate}% success rate meets certification requirements`);
  } else {
    console.log(`⚠️  REQUIRES ATTENTION: ${successRate}% success rate below ${certificationThreshold}% threshold`);
  }

  console.log('='.repeat(80));

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'tests', 'reports', `test-report-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(TEST_RESULTS, null, 2));

  console.log(`📄 Detailed report saved to: ${reportPath}`);
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('🚀 Starting Azora OS Comprehensive Testing Suite...\n');

  try {
    // Test service health
    console.log('🏥 PHASE 1: Service Health Tests');
    for (const service of SERVICES) {
      await testServiceHealth(service);
    }

    // Run integration tests
    console.log('\n🔗 PHASE 2: Integration Tests');
    await runIntegrationTests();

    // Run performance tests
    console.log('\n⚡ PHASE 3: Performance Tests');
    await runPerformanceTests();

    // Run security tests
    console.log('\n🔒 PHASE 4: Security Tests');
    await runSecurityTests();

    // Generate final report
    generateReport();

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, TEST_RESULTS };