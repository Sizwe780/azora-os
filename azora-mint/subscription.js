/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let subscriptions = {};

app.post('/api/subscription/subscribe', (req, res) => {
  const { userId, plan } = req.body;
  const plans = { basic: 10, premium: 50, enterprise: 200 };
  if (!plans[plan]) return res.status(400).json({ error: 'Invalid plan' });
  subscriptions[userId] = { plan, price: plans[plan], active: true };
  res.json({ subscription: subscriptions[userId] });
});

app.get('/api/subscription/status/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({ subscription: subscriptions[userId] || { active: false } });
});

const PORT = 4129;
app.listen(PORT, () => console.log(`💳 Subscription Service running on port ${PORT}`));
