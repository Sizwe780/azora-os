/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/pay', async (req, res) => {
  // Integrate Paystack/Stripe
  const payment = { status: 'success', amount: req.body.amount };
  res.json(payment);
});

app.listen(3005, () => console.log('Monetization running on port 3005'));
