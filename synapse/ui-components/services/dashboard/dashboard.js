/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/dashboard/realtime-value', (req, res) => {
  const value = { current: 1, projected: 1000000 };
  res.json({ azrValue: value, bonusAvailable: 1000 });
});

app.get('/api/dashboard/money-view', (req, res) => {
  res.json({
    totalValue: 10000000,
    azrPrice: 100,
    ecosystemGrowth: 'Exponential',
    bonusEarnings: 100000
  });
});

const PORT = 4121;
app.listen(PORT, () => console.log(`📊 Dashboard Service running on port ${PORT}`));
