/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let stakes = {};

app.post('/api/staking/stake', (req, res) => {
  const { userId, amount } = req.body;
  stakes[userId] = (stakes[userId] || 0) + amount;
  res.json({ staked: stakes[userId], reward: amount * 0.01 });
});

app.get('/api/staking/balance/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({ staked: stakes[userId] || 0 });
});

const PORT = 4116;
app.listen(PORT, () => console.log(`🔒 Staking Service running on port ${PORT}`));
