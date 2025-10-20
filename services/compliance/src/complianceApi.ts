import express from 'express';
import { ComplianceService } from './complianceService';

const router = express.Router();

router.post('/check', async (req, res) => {
  const { userId, action } = req.body;
  if (!userId || !action) return res.status(400).json({ error: 'Missing userId or action' });
  try {
    const result = await ComplianceService.checkCompliance(userId, action);
    res.json({ ...result, action });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check compliance', details: err });
  }
});

router.get('/record/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const records = await ComplianceService.getComplianceRecords(userId);
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get records', details: err });
  }
});

export default router;