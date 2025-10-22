/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Quantum Predictive Analytics API Route
// Provides REST endpoints for quantum-enhanced analytics

const express = require('express');
const router = express.Router();
const predictiveAnalyticsService = require('../services/quantum/predictiveAnalyticsService');

// POST /api/quantum/loss-prevention
router.post('/loss-prevention', async (req, res) => {
  try {
    const data = req.body.data;
    const result = await predictiveAnalyticsService.lossPrevention(data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quantum/schedule-optimization
router.post('/schedule-optimization', async (req, res) => {
  try {
    const scheduleData = req.body.schedule;
    const result = await predictiveAnalyticsService.scheduleOptimization(scheduleData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quantum/logistics-optimization
router.post('/logistics-optimization', async (req, res) => {
  try {
    const logisticsData = req.body.logistics;
    const result = await predictiveAnalyticsService.logisticsOptimization(logisticsData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
