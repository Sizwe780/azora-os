/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let totalRevenue = 250000; // $250,000 in revenue

app.post('/api/revenue/add', (req, res) => {
  const { amount } = req.body;
  totalRevenue += Number(amount);
  res.json({ totalRevenue });
});

app.get('/api/revenue/total', (req, res) => {
  res.json({ totalRevenue });
});

const PORT = 4126;
app.listen(PORT, () => console.log(`💵 Revenue Service running on port ${PORT}`));