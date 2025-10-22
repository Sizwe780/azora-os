/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { AnalyticsService } from './analyticsService';

const router = express.Router();

router.post('/event', async (req, res) => {
  const { type, data, userId } = req.body;
  if (!type) return res.status(400).json({ error: 'Missing type' });
  try {
    await AnalyticsService.trackEvent(type, data, userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track event', details: err });
  }
});

router.get('/funnel', async (req, res) => {
  try {
    const funnel = await AnalyticsService.getFunnel();
    res.json({ funnel });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get funnel', details: err });
  }
});

router.get('/heatmap', async (req, res) => {
  try {
    const heatmap = await AnalyticsService.getHeatmap();
    res.json({ heatmap });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get heatmap', details: err });
  }
});

router.post('/session', async (req, res) => {
  const { userId, path } = req.body;
  if (!userId || !path) return res.status(400).json({ error: 'Missing userId or path' });
  try {
    await AnalyticsService.startSession(userId, path);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start session', details: err });
  }
});

router.get('/session/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const journey = await AnalyticsService.getUserJourney(userId);
    res.json({ journey });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get journey', details: err });
  }
});

router.get('/dropoffs', async (req, res) => {
  try {
    const stats = await AnalyticsService.getDropoffs();
    res.json({ dropoffs: stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dropoffs', details: err });
  }
});

export default router;