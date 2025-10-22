/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

/**
 * Advanced Dashboard Service.
 * Aggregates data from all services for real-time insights.
 */
app.get('/api/dashboard/realtime-value', (req, res) => {
  const value = { current: 1, projected: 1000000 };
  res.json({ azrValue: value, bonusAvailable: 1000 });
});

app.get('/api/dashboard/money-view', (req, res) => {
  res.json({
    totalValue: 10000000,
    azrPrice: 100,
    ecosystemGrowth: 'Exponential',
    bonusEarnings: 100000
  });
});

app.get('/api/dashboard/summary', (req, res) => {
  // Mock summary
  res.json({
    users: 10000,
    revenue: 250000,
    partners: 5,
    valuation: 1000000
  });
});

const PORT = 4121;
app.listen(PORT, () => console.log(`📊 Advanced Dashboard Service running on port ${PORT}`));
app.get('/api/dashboard/full-summary', async (req, res) => {
  try {
    const [valuation, adoption, revenue] = await Promise.all([
      axios.get('http://localhost:4124/api/valuation/backed'),
      axios.get('http://localhost:4122/api/adoption/stats'),
      axios.get('http://localhost:4126/api/revenue/total')
    ]);
    res.json({
      valuation: valuation.data,
      adoption: adoption.data,
      revenue: revenue.data,
      integrated: true
    });
  } catch (e) {
    res.status(500).json({ error: 'Integration failed' });
  }
});
app.get('/api/dashboard/full-summary', async (req, res) => {
  try {
    const [valuation, adoption, revenue] = await Promise.all([
      axios.get('http://localhost:4124/api/valuation/backed'),
      axios.get('http://localhost:4122/api/adoption/stats'),
      axios.get('http://localhost:4126/api/revenue/total')
    ]);
    res.json({
      valuation: valuation.data,
      adoption: adoption.data,
      revenue: revenue.data,
      integrated: true
    });
  } catch (e) {
    res.status(500).json({ error: 'Integration failed' });
  }
});
app.get('/api/dashboard/full-summary', async (req, res) => {
  try {
    const [valuation, adoption, revenue] = await Promise.all([
      axios.get('http://localhost:4124/api/valuation/backed'),
      axios.get('http://localhost:4122/api/adoption/stats'),
      axios.get('http://localhost:4126/api/revenue/total')
    ]);
    res.json({
      valuation: valuation.data,
      adoption: adoption.data,
      revenue: revenue.data,
      integrated: true
    });
  } catch (e) {
    res.status(500).json({ error: 'Integration failed' });
  }
});
