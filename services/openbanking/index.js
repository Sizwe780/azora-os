const express = require('express');
const app = express();
app.use(express.json());

let accounts = {
  "user1": { balance: 1000.00, history: [] },
  "user2": { balance: 500.00, history: [] }
};

app.get('/api/openbanking/account/:user', (req, res) => {
  const acct = accounts[req.params.user];
  if (!acct) return res.status(404).json({error:"not found"});
  res.json({ balance: acct.balance, history: acct.history });
});

app.post('/api/openbanking/transfer', (req, res) => {
  const { from, to, amount } = req.body;
  if (!accounts[from] || !accounts[to]) return res.status(404).json({error:"not found"});
  if (accounts[from].balance < amount) return res.status(400).json({error:"insufficient"});
  accounts[from].balance -= amount;
  accounts[to].balance += amount;
  accounts[from].history.push({ to, amount, ts: Date.now() });
  accounts[to].history.push({ from, amount, ts: Date.now() });
  res.json({ success: true });
});

app.listen(5200, () => console.log("[openbanking] running on 5200"));
