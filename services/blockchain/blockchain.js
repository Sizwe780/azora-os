const express = require('express');
const app = express();
app.use(express.json());

/**
 * Advanced Blockchain Service.
 * Simulates mining, transactions, and state management.
 */
let blocks = [];

app.post('/api/blockchain/mine', (req, res) => {
  const { blockData } = req.body;
  const block = { id: blocks.length + 1, data: blockData, timestamp: new Date() };
  blocks.push(block);
  res.json({ mined: true, block, reward: 1000, valueIncrease: 100000 });
});

app.get('/api/blockchain/chain', (req, res) => {
  res.json({ chain: blocks });
});

const PORT = 4123;
app.listen(PORT, () => console.log(`⛓️ Advanced Blockchain Service running on port ${PORT}`));
