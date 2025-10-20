import express from 'express';
import { aiValuationService } from './aiValuationService';

const router = express.Router();

// Onboard a new user
router.post('/user-growth/onboard', async (req, res) => {
  try {
    const { source, metadata } = req.body;

    const result = await aiValuationService.onboardUser(source, metadata);

    res.json(result);
  } catch (error) {
    console.error('Error onboarding user:', error);
    res.status(500).json({ error: 'Failed to onboard user' });
  }
});

// Get total user count
router.get('/user-growth/total', async (req, res) => {
  try {
    const result = await aiValuationService.getTotalUsers();

    res.json(result);
  } catch (error) {
    console.error('Error getting total users:', error);
    res.status(500).json({ error: 'Failed to get total users' });
  }
});

// Get valuation metrics
router.get('/valuation/metrics', async (req, res) => {
  try {
    const { limit } = req.query;

    const metrics = await aiValuationService.getValuationMetrics(
      limit ? parseInt(limit as string) : 10
    );

    res.json({ metrics });
  } catch (error) {
    console.error('Error getting valuation metrics:', error);
    res.status(500).json({ error: 'Failed to get valuation metrics' });
  }
});

// Get growth metrics
router.get('/user-growth/metrics', async (req, res) => {
  try {
    const { period, limit } = req.query;

    const metrics = await aiValuationService.getGrowthMetrics(
      period as string,
      limit ? parseInt(limit as string) : 50
    );

    res.json({ metrics });
  } catch (error) {
    console.error('Error getting growth metrics:', error);
    res.status(500).json({ error: 'Failed to get growth metrics' });
  }
});

// Get audit logs
router.get('/audit', async (req, res) => {
  try {
    const { entityId, entityType, limit } = req.query;

    const logs = await aiValuationService.getAuditLogs(
      entityId as string,
      entityType as string,
      limit ? parseInt(limit as string) : 50
    );

    res.json({ logs });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

export { router as aiValuationApi };