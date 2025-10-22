/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { WalletService } from './walletService.js';

const router = express.Router();
const walletService = new WalletService();

router.post('/create', async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await walletService.createWallet(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const result = await walletService.sendTransaction(from, to, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/analyze/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await walletService.analyzeTransactions(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;