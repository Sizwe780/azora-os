const express = require('express');
const app = express();
app.use(express.json());

let wallets = {};

app.post('/api/blockchain/wallet', (req, res) => {
  // Return a random wallet address
  const wallet = "0x" + Math.random().toString(16).substr(2, 40);
  wallets[wallet] = [];
  res.json({ wallet });
});

app.post('/api/blockchain/tx', (req, res) => {
  const { from, to, amount } = req.body;
  // TODO: Integrate with real blockchain!
  wallets[from] = wallets[from] || [];
  wallets[from].push({ to, amount, ts: Date.now() });
  res.json({ tx: "0x" + Math.random().toString(16).substr(2, 64) });
});

app.post('/api/blockchain/nft', (req, res) => {
  const { wallet, meta } = req.body;
  // Mint a mock NFT
  const nft = { tokenId: Math.floor(Math.random()*100000), meta };
  wallets[wallet] = wallets[wallet] || [];
  wallets[wallet].push({ nft });
  res.json({ nft });
});

app.listen(4800, () => console.log("[blockchain] running on 4800"));
