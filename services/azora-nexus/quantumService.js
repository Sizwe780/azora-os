/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Quantum hybrid scoring stub
const axios = require('axios');
const QUANTUM_URL = process.env.QUANTUM_SERVICE_URL || 'http://localhost:5000';

async function hybridScore(context) {
  // Replace with real quantum microservice call
  const features = {
    classical_anomaly: context.anomalyScore || 0.5,
    quantum_signal: Math.random()
  };
  try {
    const res = await axios.post(`${QUANTUM_URL}/simulate`, { features });
    return res.data;
  } catch {
    return { error: 'quantum_service_unavailable' };
  }
}
module.exports = { hybridScore };
