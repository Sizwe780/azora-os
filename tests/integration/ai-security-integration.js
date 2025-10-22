/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AI-Security Integration Test
 *
 * Tests the integration between AI orchestrator and security services
 * Validates AI-driven security analysis, threat detection, and automated responses
 */

export async function run() {
  const results = {
    passed: false,
    details: {},
    error: null
  };

  try {
    console.log('  🤖 Testing AI-security integration...');

    // Test 1: AI Orchestrator health
    const aiHealth = await testEndpoint('http://localhost:4001/health');
    results.details.aiHealth = aiHealth.success;

    // Test 2: Security Core health
    const securityHealth = await testEndpoint('http://localhost:4022/health');
    results.details.securityHealth = securityHealth.success;

    // Test 3: AI model availability
    const modelsResponse = await testEndpoint('http://localhost:4001/models');
    results.details.aiModels = modelsResponse.success;

    // Test 4: Security status endpoint
    const securityStatus = await testEndpoint('http://localhost:4022/status');
    results.details.securityStatus = securityStatus.success;

    // Test 5: AI threat analysis simulation
    const threatAnalysis = await testThreatAnalysis();
    results.details.threatAnalysis = threatAnalysis.success;

    // Test 6: Automated security response
    const autoResponse = await testAutomatedResponse();
    results.details.automatedResponse = autoResponse.success;

    // Test 7: AI security insights integration
    const insightsIntegration = await testInsightsIntegration();
    results.details.insightsIntegration = insightsIntegration.success;

    // Determine overall pass/fail
    const allTests = Object.values(results.details);
    results.passed = allTests.every(test => test === true);

    if (results.passed) {
      results.details.summary = 'All AI-security integration tests passed';
    } else {
      results.details.summary = `Failed tests: ${allTests.filter(t => !t).length}/${allTests.length}`;
    }

  } catch (error) {
    results.error = error.message;
    results.details.error = error.stack;
  }

  return results;
}

async function testEndpoint(url) {
  try {
    const response = await fetch(url, { timeout: 5000 });
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testThreatAnalysis() {
  try {
    // Simulate threat analysis request to AI service
    const threatData = {
      type: 'network_traffic',
      data: {
        source: '192.168.1.100',
        destination: '10.0.0.1',
        protocol: 'TCP',
        port: 443,
        packetCount: 15000,
        timeWindow: '5m'
      },
      context: {
        userId: 'test-user',
        companyId: 'test-company',
        riskLevel: 'medium'
      }
    };

    // Test AI analysis endpoint (would normally analyze the threat)
    const analysisResponse = await fetch('http://localhost:4001/analyze/threat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threatData)
    });

    // Test security service threat reporting
    const securityResponse = await fetch('http://localhost:4022/threats/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threat: threatData,
        aiAnalysis: analysisResponse.ok ? 'analyzed' : 'failed'
      })
    });

    return {
      success: analysisResponse.ok && securityResponse.ok,
      aiResponse: analysisResponse.status,
      securityResponse: securityResponse.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testAutomatedResponse() {
  try {
    // Test automated security response triggered by AI
    const responseData = {
      action: 'block_ip',
      target: '192.168.1.100',
      reason: 'AI detected suspicious activity',
      confidence: 0.95,
      aiModel: 'threat-detector-v2'
    };

    const response = await fetch('http://localhost:4022/responses/automated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    });

    return {
      success: response.ok,
      status: response.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testInsightsIntegration() {
  try {
    // Test AI-generated security insights integration
    const insightsData = {
      type: 'predictive_threat',
      insights: [
        {
          prediction: 'Potential DDoS attack in next 24 hours',
          confidence: 0.87,
          timeframe: '24h',
          recommendedActions: ['increase_monitoring', 'prepare_mitigation']
        }
      ],
      generatedAt: new Date().toISOString()
    };

    // Send insights to security service
    const insightsResponse = await fetch('http://localhost:4022/insights/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insightsData)
    });

    // Verify insights are stored and retrievable
    const retrieveResponse = await fetch('http://localhost:4022/insights?type=predictive_threat');

    return {
      success: insightsResponse.ok && retrieveResponse.ok,
      storeStatus: insightsResponse.status,
      retrieveStatus: retrieveResponse.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}