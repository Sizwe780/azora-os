const express = require('express');
const app = express();
app.use(express.json());

let payments = [];

app.post('/api/payments/charge', (req, res) => {
  const { user, amount } = req.body;
  // TODO: Integrate with real Stripe/PayPal
  const paymentId = "pay_" + Math.random().toString(36).substr(2,8);
  payments.push({ user, amount, paymentId, ts: Date.now() });
  res.json({ paymentId, status: "succeeded" });
});

app.get('/api/payments/:user', (req, res) => {
  res.json({ payments: payments.filter(p=>p.user===req.params.user) });
});

app.listen(5000, () => console.log("[payments] running on 5000"));
