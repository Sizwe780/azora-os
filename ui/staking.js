/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

/**
 * Advanced Staking Service for AZR.
 * Supports multiple staking pools, rewards, and unstaking with penalties.
 */
let stakes = {};
let pools = { standard: { apr: 0.1 }, premium: { apr: 0.2 } };

app.post('/api/staking/stake', (req, res) => {
  const { userId, amount, pool = 'standard' } = req.body;
  if (!pools[pool]) return res.status(400).json({ error: 'Invalid pool' });
  
  stakes[userId] = stakes[userId] || {};
  stakes[userId][pool] = (stakes[userId][pool] || 0) + amount;
  
  const reward = amount * pools[pool].apr;
  res.json({ staked: stakes[userId][pool], reward, pool });
});

app.get('/api/staking/balance/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({ staked: stakes[userId] || {} });
});

app.post('/api/staking/unstake', (req, res) => {
  const { userId, pool, amount } = req.body;
  if (!stakes[userId] || !stakes[userId][pool] || stakes[userId][pool] < amount) {
    return res.status(400).json({ error: 'Insufficient stake' });
  }
  
  stakes[userId][pool] -= amount;
  const penalty = amount * 0.05; // 5% penalty
  res.json({ unstaked: amount - penalty, penalty });
});

const PORT = 4116;
app.listen(PORT, () => console.log(`🔒 Advanced Staking Service running on port ${PORT}`));
