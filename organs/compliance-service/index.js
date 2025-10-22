/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Compliance Service
 * Enforces constitutional rules across the Azora OS ecosystem
 * Port: 4081onstitutional rules across the Azora OS ecosystem
 */Port: 4081
 */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4081;
const complianceLogs = [];
const nudgeAudit = [];

// Health check endpointalth', (req, res) => {
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',ervice: 'compliance-service'
    service: 'compliance-service');
  });});
});

// Verify compliance (req, res) => {
app.post('/api/verify-compliance', (req, res) => {const { type, data } = req.body;
  const { type, data } = req.body;
  
  if (!type || !data) { return res.status(400).json({ error: 'Type and data are required' });
    return res.status(400).json({ error: 'Type and data are required' });}
  }
  alse;
  let compliant = false;let details = '';
  let details = '';
  
  switch (type) {
    case 'max_supply':
      compliant = data.maxSupply === 1000000;s = compliant ? 'Max supply is valid' : 'Max supply must be 1 million';
      details = compliant ? 'Max supply is valid' : 'Max supply must be 1 million';break;
      break;
      
    case 'founder_email':+@azora\.world$/;
      const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@azora\.world$/;
      compliant = emailRegex.test(data.email);s = compliant ? 'Email format is valid' : 'Email must be in format full.name@azora.world';
      details = compliant ? 'Email format is valid' : 'Email must be in format full.name@azora.world';break;
      break;
      
    default:   return res.status(400).json({ error: 'Unknown compliance type' });
      return res.status(400).json({ error: 'Unknown compliance type' });}
  }
  
  // Log the checknceLogs.push({
  complianceLogs.push({
    type,
    data,
    compliant,imestamp: new Date().toISOString()
    timestamp: new Date().toISOString()});
  });
  es.json({ compliant, details });
  res.json({ compliant, details });});
});

// Get compliance logsres) => {
app.get('/api/logs', (req, res) => {es.json(complianceLogs);
  res.json(complianceLogs);});
});

// Nudge audit endpointonsole.log(`Compliance Service running on port ${PORT}`);
app.post('/api/nudge/audit', (req, res) => {});

app.get('/api/policy/za', (_req, res) => {
  res.json({
    country: 'ZA',
    vatRate: 0.15,
    laws: ['POPIA', 'Consumer Protection Act (CPA)'],
    termsUrl: process.env.TERMS_URL_ZA || 'https://example.com/terms/za',
    privacyUrl: process.env.PRIVACY_URL_ZA || 'https://example.com/privacy/za',
    disclaimer: 'Informational only. Not legal advice. Consult qualified counsel for compliance.'
  });
});




















});  console.log(`Compliance Service running on port ${PORT}`);app.listen(PORT, () => {});  res.json({ count: nudgeAudit.length, sample: nudgeAudit.slice(-20) });app.get('/api/nudge/audit', (_req, res) => {});  res.json({ ok: true });  nudgeAudit.push(rec);  };    timestamp: timestamp || new Date().toISOString()    anonSessionId: String(anonSessionId || ''),    meta: meta || {},    type, nudgeId,    id: crypto.randomUUID(),  const rec = {  if (!type || !nudgeId) return res.status(400).json({ error: 'type and nudgeId required' });  const { type, nudgeId, meta, anonSessionId, timestamp } = req.body || {};