/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Automated service snapshot scheduler
 * Takes periodic snapshots for recovery
 */

const cron = require('node-cron');
const axios = require('axios');

const TRACING_SERVICE_URL = process.env.TRACING_SERVICE_URL || 'http://localhost:4998';

const SERVICES = [
  'auth', 'ai-orchestrator', 'onboarding', 'compliance',
  'hr-ai-deputy', 'azora-coin', 'conversation', 'security-core',
  'document-vault', 'analytics', 'blockchain', 'payment'
];

// Take snapshots every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('📸 Taking service snapshots...');
  
  for (const service of SERVICES) {
    try {
      await axios.post(`${TRACING_SERVICE_URL}/api/snapshot/${service}`);
      console.log(`✅ Snapshot created for ${service}`);
    } catch (error) {
      console.error(`❌ Failed to snapshot ${service}:`, error.message);
    }
  }
});

console.log('🕐 Snapshot scheduler started (every 15 minutes)');
