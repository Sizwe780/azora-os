/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Compliance and Safety Reporting API Route
// Provides REST endpoints for incident reporting, training, and audit logs

const express = require('express');
const router = express.Router();
const complianceService = require('../services/compliance/complianceService');

// POST /api/compliance/report-incident
router.post('/report-incident', async (req, res) => {
  try {
    const { reporter, type, description, corridor } = req.body;
    const incident = await complianceService.reportIncident({ reporter, type, description, corridor });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compliance/incidents/:corridor
router.get('/incidents/:corridor', async (req, res) => {
  try {
    const corridor = req.params.corridor;
    const incidents = await complianceService.getIncidents(corridor);
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/compliance/record-training
router.post('/record-training', async (req, res) => {
  try {
    const { user, module, status, corridor } = req.body;
    const record = await complianceService.recordTraining({ user, module, status, corridor });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compliance/training/:user
router.get('/training/:user', async (req, res) => {
  try {
    const user = req.params.user;
    const records = await complianceService.getTrainingRecords(user);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compliance/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();
    const pendingIncidents = await Incident.countDocuments({ status: 'reported' });
    const totalTraining = await TrainingRecord.countDocuments();
    const completedTraining = await TrainingRecord.countDocuments({ status: 'completed' });
    const recentAudits = await AuditLog.find().sort({ timestamp: -1 }).limit(10).lean();

    const data = {
      overview: {
        totalIncidents,
        pendingIncidents,
        totalTraining,
        completedTraining,
        complianceRate: totalTraining > 0 ? (completedTraining / totalTraining * 100).toFixed(1) : 0
      },
      recentAudits
    };

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compliance/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await complianceService.getAuditLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
