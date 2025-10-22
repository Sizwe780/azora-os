/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { ABTestService } from './abTestService';

const router = express.Router();

router.post('/assign', async (req: express.Request, res: express.Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const variant = await ABTestService.assignVariant(userId);
    res.json({ userId, variant });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign variant', details: err });
  }
});

router.post('/result', async (req: express.Request, res: express.Response) => {
  const { userId, result, metadata } = req.body;
  if (!userId || !result) return res.status(400).json({ error: 'Missing userId or result' });
  try {
    await ABTestService.recordResult(userId, result, metadata);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record result', details: err });
  }
});

export default router;
