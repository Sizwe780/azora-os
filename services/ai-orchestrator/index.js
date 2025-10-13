const axios = require('axios');

const UNIFIED_AI_URL = process.env.UNIFIED_AI_URL || 'http://localhost:4002';

async function runAllAIs(context) {
  try {
    // Use unified AI service for all AI tasks with appropriate models
    const tasks = [
      { task: 'analysis', content: `Analyze this context: ${JSON.stringify(context)}`, model: 'mistral-7b' },
      { task: 'prediction', content: `Predict outcomes for: ${JSON.stringify(context)}`, model: 'quantum-deep-mind' },
      { task: 'text-generation', content: `Generate insights for: ${JSON.stringify(context)}`, model: 'llama-2-70b' }
    ];

    const results = await Promise.all(
      tasks.map(task =>
        axios.post(`${UNIFIED_AI_URL}/execute`, task)
          .then(res => res.data)
          .catch(err => ({ success: false, error: err.message }))
      )
    );

    // Structure response similar to original format
    return {
      intent: results[0].success ? results[0].response : 'Analysis failed',
      anomaly: results[1].success ? results[1].response : 'Prediction failed',
      quantum: results[2].success ? results[2].response : 'Generation failed',
      insight: `Unified AI Analysis: ${results.map(r => r.success ? r.response.substring(0, 100) : 'Error').join(' | ')}`,
      unified_results: results
    };
  } catch (error) {
    console.error('Unified AI orchestration error:', error);
    return {
      intent: 'Error',
      anomaly: 'Error',
      quantum: 'Error',
      insight: 'AI orchestration failed',
      error: error.message
    };
  }
}

module.exports = { runAllAIs };
