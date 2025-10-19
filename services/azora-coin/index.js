const express = require('express');
const app = express();
app.use(express.json());

const MAIN_FOUNDER_EMAIL = "your.email@azora.world"; // Set your main founder email here
let balances = {};
let founders = {};

// Onboard founder with correct coin allocation
app.post('/api/azora-coin/onboard', (req, res) => {
  const { email, fullName } = req.body;
  if (!email.endsWith('@azora.world')) return res.status(403).json({ error: "Unauthorized email" });
  if (balances[email]) return res.json({ balance: balances[email], privilege: founders[email] });

  if (email === MAIN_FOUNDER_EMAIL) {
    balances[email] = 100000;
    founders[email] = "main";
  } else {
    balances[email] = 1000;
    founders[email] = "regular";
  }
  res.json({ balance: balances[email], privilege: founders[email] });
});

// Upgrade founder privilege and coins
app.post('/api/azora-coin/upgrade', (req, res) => {
  const { email, coins, privilege } = req.body;
  if (!email.endsWith('@azora.world')) return res.status(403).json({ error: "Unauthorized email" });
  if (!balances[email]) return res.status(404).json({ error: "User not found" });
  if (typeof coins === "number") balances[email] += coins;
  if (privilege) founders[email] = privilege;
  res.json({ balance: balances[email], privilege: founders[email] });
});

// Withdraw coins instantly
app.post('/api/azora-coin/withdraw', (req, res) => {
  const { email, amount, wallet } = req.body;
  if (!balances[email] || balances[email] < amount) return res.status(400).json({ error: "Insufficient balance" });
  balances[email] -= amount;
  // TODO: Integrate with blockchain for real transfer!
  res.json({ withdrawn: amount, wallet });
});

app.get('/api/azora-coin/balance/:email', (req, res) => {
  res.json({ balance: balances[req.params.email] || 0, privilege: founders[req.params.email] || "none" });
});

app.listen(6700, () => console.log("[azora-coin] running on 6700"));