/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import aiSearchService from './aiSearchService.js';

const router = express.Router();

// POST /api/ai-search/search
router.post('/search', async (req, res) => {
  try {
    const { query, userId } = req.body;
    const result = await aiSearchService.performSearch(query, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// GET /api/ai-search/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await aiSearchService.getSearchHistory(req.params.userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get search history' });
  }
});

export default router;