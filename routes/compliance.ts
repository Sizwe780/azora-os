/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { Request, Response } from 'express';
import ProofOfComplianceService from '../services/proofOfComplianceService';
const router = express.Router();

router.post('/poc/reward', async (req: Request, res: Response) => {
  const { clientWalletId, amount, notes } = req.body;
  try {
    const result = await ProofOfComplianceService.rewardCompliance(clientWalletId, amount, notes);
    res.json({ success: true, ...result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;