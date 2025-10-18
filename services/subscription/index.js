/**
 * @file index.js
 * @author Sizwe Ngwenya
 * @description Manages user subscription tiers and status for Azora OS.
 */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.SUB_PORT || 4600;

// In-memory store for subscription status.
const subscriptionDB = {
  'nmu_student_1': { tier: 'free_citizen', status: 'active' },
  'sizwe_ngwenya': { tier: 'founder', status: 'active' }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));

app.get('/api/status/:userId', (req, res) => {
  const { userId } = req.params;
  const sub = subscriptionDB[userId];
  if (sub) {
    res.json(sub);
  } else {
    res.status(404).json({ tier: 'none', status: 'inactive' });
  }
});

app.listen(PORT, () => {
  console.log(`💳 Subscription Service is online on port ${PORT}`);
});
