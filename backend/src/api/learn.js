/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Learning and Earning API Route// Compliance and Safety Reporting API Route

// Provides REST endpoints for courses, progress, and earnings// Provides REST endpoints for incident reporting, training, and audit logs



const express = require('express');const express = require('express');

const router = express.Router();const router = express.Router();

const complianceService = require('../services/compliance/complianceService');

// Mock data for now

const mockCourses = [// POST /api/compliance/report-incident

  { id: '1', title: 'Introduction to Azora', progress: 100, status: 'completed', earnings: 10 },router.post('/report-incident', async (req, res) => {

  { id: '2', title: 'Blockchain Basics', progress: 75, status: 'in-progress', earnings: 7.5 },  try {

  { id: '3', title: 'AI Fundamentals', progress: 0, status: 'not-started', earnings: 0 }    const { reporter, type, description, corridor } = req.body;

];    const incident = await complianceService.reportIncident({ reporter, type, description, corridor });

    res.json(incident);

const mockProgress = {  } catch (err) {

  overallProgress: 58,    res.status(500).json({ error: err.message });

  weeklyProgress: 15,  }

  monthlyProgress: 45});

};

// GET /api/compliance/incidents/:corridor

const mockEarnings = {router.get('/incidents/:corridor', async (req, res) => {

  total: 17.5,  try {

  thisWeek: 7.5,    const corridor = req.params.corridor;

  thisMonth: 17.5,    const incidents = await complianceService.getIncidents(corridor);

  history: [    res.json(incidents);

    { date: '2025-10-20', amount: 10, source: 'Course completion' },  } catch (err) {

    { date: '2025-10-21', amount: 7.5, source: 'Course progress' }    res.status(500).json({ error: err.message });

  ]  }

};});



const mockAchievements = [// POST /api/compliance/record-training

  { id: '1', title: 'First Course', description: 'Complete your first course', earned: true, date: '2025-10-20' },router.post('/record-training', async (req, res) => {

  { id: '2', title: 'Streak Master', description: 'Learn for 7 days straight', earned: false }  try {

];    const { user, module, status, corridor } = req.body;

    const record = await complianceService.recordTraining({ user, module, status, corridor });

// GET /api/learn/dashboard    res.json(record);

router.get('/dashboard', async (req, res) => {  } catch (err) {

  try {    res.status(500).json({ error: err.message });

    const data = {  }

      totalCourses: mockCourses.length,});

      completedCourses: mockCourses.filter(c => c.status === 'completed').length,

      inProgressCourses: mockCourses.filter(c => c.status === 'in-progress').length,// GET /api/compliance/training/:user

      totalEarnings: mockEarnings.total,router.get('/training/:user', async (req, res) => {

      currentStreak: 5,  try {

      lastUpdated: new Date().toISOString(),    const user = req.params.user;

      courses: mockCourses,    const records = await complianceService.getTrainingRecords(user);

      progress: mockProgress,    res.json(records);

      earnings: mockEarnings,  } catch (err) {

      achievements: mockAchievements    res.status(500).json({ error: err.message });

    };  }

});

    res.json({ data });

  } catch (err) {// GET /api/compliance/dashboard

    res.status(500).json({ error: err.message });router.get('/dashboard', async (req, res) => {

  }  try {

});    const totalIncidents = await Incident.countDocuments();

    const pendingIncidents = await Incident.countDocuments({ status: 'reported' });

// GET /api/learn/courses    const totalTraining = await TrainingRecord.countDocuments();

router.get('/courses', async (req, res) => {    const completedTraining = await TrainingRecord.countDocuments({ status: 'completed' });

  try {    const recentAudits = await AuditLog.find().sort({ timestamp: -1 }).limit(10).lean();

    res.json(mockCourses);

  } catch (err) {    const data = {

    res.status(500).json({ error: err.message });      overview: {

  }        totalIncidents,

});        pendingIncidents,

        totalTraining,

module.exports = router;        completedTraining,
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
