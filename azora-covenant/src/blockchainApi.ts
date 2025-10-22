/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { BlockchainService } from './blockchainService.js';

const router = express.Router();
const blockchainService = new BlockchainService();

router.post('/wallet', async (req, res) => {
  try {
    const result = await blockchainService.createWallet();
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/tx', async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const result = await blockchainService.submitTransaction(from, to, amount);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/nft', async (req, res) => {
  try {
    const { wallet, meta } = req.body;
    const result = await blockchainService.mintNft(wallet, meta);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/optimize', async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await blockchainService.optimizeTransaction(amount);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;