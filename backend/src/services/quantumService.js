/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const axios = require('axios');
const config = require('../config');

async function optimizeShifts(shiftsData) {
  try {
    const response = await axios.post(config.quantum.microserviceUrl, { shifts: shiftsData });
    return response.data.optimizedSchedule; // Returns optimized assignment
  } catch (error) {
    console.error('Quantum optimization error:', error);
    return null; // Fallback to classical
  }
}

module.exports = { optimizeShifts };
