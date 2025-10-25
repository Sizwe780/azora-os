/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { KycAmlService } from './kycAmlService';

const router = express.Router();

router.post('/kyc', async (req, res) => {
  const { userId, userData } = req.body;
  if (!userId || !userData) return res.status(400).json({ error: 'Missing userId or userData' });
  try {
    const result = await KycAmlService.checkUser(userId, userData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check KYC', details: err });
  }
});

router.post('/aml', async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || amount === undefined) return res.status(400).json({ error: 'Missing userId or amount' });
  try {
    const result = await KycAmlService.checkTransaction(userId, amount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check AML', details: err });
  }
});

export default router;