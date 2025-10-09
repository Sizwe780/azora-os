// Compliance and Safety Reporting API Route
// Provides REST endpoints for incident reporting, training, and audit logs

const express = require('express');
const router = express.Router();
const complianceService = require('../services/compliance/complianceService');

// POST /api/compliance/report-incident
router.post('/report-incident', (req, res) => {
  try {
    const { reporter, type, description, corridor } = req.body;
    const incident = complianceService.reportIncident({ reporter, type, description, corridor });
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compliance/incidents/:corridor
router.get('/incidents/:corridor', (req, res) => {
  try {
    const corridor = req.params.corridor;
    const incidents = complianceService.getIncidents(corridor);
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/compliance/record-training
router.post('/record-training', (req, res) => {
  try {
    const { user, module, status } = req.body;
    const record = complianceService.recordTraining({ user, module, status });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compliance/training/:user
router.get('/training/:user', (req, res) => {
  try {
    const user = req.params.user;
    const records = complianceService.getTrainingRecords(user);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compliance/audit-logs
router.get('/audit-logs', (req, res) => {
  try {
    const logs = complianceService.getAuditLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
