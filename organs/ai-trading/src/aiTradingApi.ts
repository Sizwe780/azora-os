/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import aiTradingService from './aiTradingService.js';

const router = express.Router();

// POST /api/ai-trading/trade
router.post('/trade', async (req, res) => {
  try {
    const { symbol, type, amount, userId } = req.body;
    const trade = await aiTradingService.executeTrade(symbol, type, amount, userId);
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute trade' });
  }
});

// POST /api/ai-trading/strategy
router.post('/strategy', async (req, res) => {
  try {
    const { name, parameters } = req.body;
    const strategy = await aiTradingService.createStrategy(name, parameters);
    res.json(strategy);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create strategy' });
  }
});

// GET /api/ai-trading/trades/:userId
router.get('/trades/:userId', async (req, res) => {
  try {
    const trades = await aiTradingService.getTrades(req.params.userId);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trades' });
  }
});

export default router;