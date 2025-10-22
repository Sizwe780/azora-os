/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AI Response Time Performance Test
 *
 * Tests AI service response times under various load conditions
 * Measures processing latency, concurrent requests, and throughput
 */

export async function run() {
  const results = {
    passed: false,
    details: {},
    metrics: {},
    error: null
  };

  try {
    console.log('  🤖 Testing AI response time performance...');

    // Test 1: Single request latency
    const singleTest = await testSingleRequestLatency();
    results.details.singleRequestLatency = singleTest.success;
    results.metrics.singleRequestLatency = singleTest.metrics;

    // Test 2: Concurrent AI requests
    const concurrentTest = await testConcurrentAIRequests();
    results.details.concurrentAIRequests = concurrentTest.success;
    results.metrics.concurrentAIRequests = concurrentTest.metrics;

    // Test 3: AI throughput
    const throughputTest = await testAIThroughput();
    results.details.aiThroughput = throughputTest.success;
    results.metrics.aiThroughput = throughputTest.metrics;

    // Test 4: Complex query processing
    const complexTest = await testComplexQueryProcessing();
    results.details.complexQueryProcessing = complexTest.success;
    results.metrics.complexQueryProcessing = complexTest.metrics;

    // Test 5: AI model switching latency
    const switchingTest = await testAIModelSwitching();
    results.details.aiModelSwitching = switchingTest.success;
    results.metrics.aiModelSwitching = switchingTest.metrics;

    // Test 6: Batch processing performance
    const batchTest = await testBatchProcessing();
    results.details.batchProcessing = batchTest.success;
    results.metrics.batchProcessing = batchTest.metrics;

    // Performance thresholds
    const thresholds = {
      singleRequestLatency: { max: 200, unit: 'ms' },
      concurrentAIRequests: { min: 50, unit: 'concurrent' },
      aiThroughput: { min: 100, unit: 'requests/min' },
      complexQueryProcessing: { max: 1000, unit: 'ms' },
      aiModelSwitching: { max: 500, unit: 'ms' },
      batchProcessing: { min: 20, unit: 'items/sec' }
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
      results.details.summary = 'All AI response time tests passed performance thresholds';
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

async function testSingleRequestLatency() {
  try {
    const testRequests = 50;
    const latencies = [];

    for (let i = 0; i < testRequests; i++) {
      const startTime = Date.now();

      const response = await fetch('http://localhost:4001/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Analyze this sample text for sentiment and key topics: ${generateSampleText()}`,
          analysis: ['sentiment', 'topics', 'entities']
        })
      });

      const endTime = Date.now();
      latencies.push(endTime - startTime);

      if (!response.ok) {
        return { success: false, error: `Request ${i} failed with status ${response.status}` };
      }
    }

    const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

    return {
      success: averageLatency < 500, // Average latency under 500ms
      metrics: {
        testRequests: testRequests,
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

async function testConcurrentAIRequests() {
  try {
    const concurrentRequests = 100;
    const requests = [];

    // Generate concurrent requests
    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(
        fetch('http://localhost:4001/analyze/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `Concurrent analysis request ${i}: ${generateSampleText()}`,
            analysis: ['sentiment']
          })
        })
      );
    }

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    const successful = responses.filter(r => r.ok).length;
    const total = responses.length;
    const duration = (endTime - startTime) / 1000;
    const throughput = total / duration;

    return {
      success: successful >= total * 0.95, // 95% success rate
      metrics: {
        concurrentRequests: concurrentRequests,
        successfulRequests: successful,
        totalRequests: total,
        successRate: successful / total,
        duration: duration,
        throughput: throughput,
        average: successful
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testAIThroughput() {
  try {
    const testDuration = 60000; // 60 seconds
    const requests = [];
    const startTime = Date.now();

    // Generate requests for the duration
    while (Date.now() - startTime < testDuration) {
      requests.push(
        fetch('http://localhost:4001/analyze/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `Throughput test: ${generateSampleText()}`,
            analysis: ['sentiment']
          })
        })
      );
    }

    const responses = await Promise.all(requests);
    const endTime = Date.now();

    const successful = responses.filter(r => r.ok).length;
    const total = responses.length;
    const duration = (endTime - startTime) / 1000 / 60; // minutes
    const throughput = total / duration;

    return {
      success: successful === total,
      metrics: {
        totalRequests: total,
        successfulRequests: successful,
        durationMinutes: duration,
        throughputPerMinute: throughput,
        average: throughput
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testComplexQueryProcessing() {
  try {
    const complexQueries = [
      {
        text: generateComplexText(),
        analysis: ['sentiment', 'topics', 'entities', 'summary', 'keywords']
      },
      {
        text: generateLongText(),
        analysis: ['sentiment', 'topics', 'entities', 'summary', 'keywords', 'language']
      },
      {
        text: generateMultilingualText(),
        analysis: ['sentiment', 'topics', 'entities', 'language', 'translation']
      }
    ];

    const latencies = [];

    for (const query of complexQueries) {
      const startTime = Date.now();

      const response = await fetch('http://localhost:4001/analyze/complex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });

      const endTime = Date.now();
      latencies.push(endTime - startTime);

      if (!response.ok) {
        return { success: false, error: `Complex query failed with status ${response.status}` };
      }
    }

    const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;

    return {
      success: averageLatency < 2000, // Average latency under 2 seconds for complex queries
      metrics: {
        complexQueries: complexQueries.length,
        averageLatency: averageLatency,
        minLatency: Math.min(...latencies),
        maxLatency: Math.max(...latencies),
        average: averageLatency
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testAIModelSwitching() {
  try {
    const models = ['gpt-4', 'claude-3', 'gemini-pro', 'llama-2'];
    const latencies = [];

    for (const model of models) {
      const startTime = Date.now();

      const response = await fetch('http://localhost:4001/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Model switching test with ${model}: ${generateSampleText()}`,
          model: model,
          analysis: ['sentiment']
        })
      });

      const endTime = Date.now();
      latencies.push(endTime - startTime);

      if (!response.ok) {
        return { success: false, error: `Model ${model} request failed with status ${response.status}` };
      }
    }

    const averageLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;

    return {
      success: averageLatency < 1000, // Average latency under 1 second for model switching
      metrics: {
        modelsTested: models.length,
        averageLatency: averageLatency,
        minLatency: Math.min(...latencies),
        maxLatency: Math.max(...latencies),
        average: averageLatency
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testBatchProcessing() {
  try {
    const batchSizes = [10, 25, 50, 100];
    const results = [];

    for (const batchSize of batchSizes) {
      const batch = [];
      for (let i = 0; i < batchSize; i++) {
        batch.push({
          id: i,
          text: `Batch item ${i}: ${generateSampleText()}`,
          analysis: ['sentiment']
        });
      }

      const startTime = Date.now();

      const response = await fetch('http://localhost:4001/analyze/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: batch,
          parallel: true
        })
      });

      const endTime = Date.now();

      if (!response.ok) {
        return { success: false, error: `Batch processing failed for size ${batchSize}` };
      }

      const duration = (endTime - startTime) / 1000; // seconds
      const throughput = batchSize / duration;

      results.push({
        batchSize: batchSize,
        duration: duration,
        throughput: throughput
      });
    }

    const averageThroughput = results.reduce((sum, r) => sum + r.throughput, 0) / results.length;

    return {
      success: averageThroughput >= 15, // At least 15 items per second
      metrics: {
        batchSizes: batchSizes,
        results: results,
        averageThroughput: averageThroughput,
        average: averageThroughput
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function generateSampleText() {
  const samples = [
    "This is a great product that I really enjoy using.",
    "The service was terrible and I had a bad experience.",
    "The weather today is sunny and beautiful.",
    "I am very disappointed with the customer support.",
    "This new feature is amazing and works perfectly.",
    "The delivery was delayed and I'm not happy about it.",
    "I love the new design and user interface.",
    "The quality could be much better for the price."
  ];
  return samples[Math.floor(Math.random() * samples.length)];
}

function generateComplexText() {
  return `In today's rapidly evolving technological landscape, artificial intelligence and machine learning are transforming industries across the globe. From healthcare to finance, autonomous vehicles to smart cities, AI systems are becoming increasingly sophisticated and capable. However, with great power comes great responsibility. The ethical implications of AI deployment, data privacy concerns, algorithmic bias, and the potential for job displacement are critical issues that must be addressed. Companies and governments alike are grappling with regulatory frameworks, transparency requirements, and the need for responsible AI development. As we stand on the brink of the fourth industrial revolution, it's crucial that we balance innovation with ethical considerations to ensure that AI serves humanity's best interests. The future of work, education, and social interaction will be profoundly shaped by these technologies, making it imperative that we approach AI development with careful consideration of its long-term societal impact.`;
}

function generateLongText() {
  const paragraphs = [];
  for (let i = 0; i < 10; i++) {
    paragraphs.push(generateComplexText());
  }
  return paragraphs.join('\n\n');
}

function generateMultilingualText() {
  return `Hello world! This is a multilingual text sample. Hola mundo, este es un ejemplo de texto multilingüe. Bonjour le monde, ceci est un exemple de texte multilingue. Hallo Welt, dies ist ein Beispiel für mehrsprachigen Text. Ciao mondo, questo è un esempio di testo multilingue. Привет мир, это пример многоязычного текста. 你好世界，这是多语言文本示例。こんにちは世界、これは多言語テキストの例です。`;
}