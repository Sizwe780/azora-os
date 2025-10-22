/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const router = express.Router();
const Reputation = require('../models/Reputation');
const User = require('../models/User');

router.get('/leaderboard', async (_req, res) => {
  try {
    const leaders = await Reputation.find()
      .sort({ score: -1 })
      .limit(10)
      .lean();

    const enriched = await Promise.all(
      leaders.map(async leader => {
        const user = await User.findById(leader.userId).lean();
        return {
          id: leader._id.toString(),
          userId: leader.userId?.toString() ?? null,
          score: leader.score ?? 0,
          history: leader.history ?? [],
          name: user?.name ?? 'Unknown delegate',
          email: user?.email ?? null,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/delegates/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const delegates = await Reputation.find({ 'history.delegateOf': userId }).lean();

    const formatted = delegates.map(delegate => ({
      id: delegate._id.toString(),
      userId: delegate.userId?.toString() ?? null,
      score: delegate.score ?? 0,
      recentActivity: delegate.history?.slice(-5) ?? [],
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
