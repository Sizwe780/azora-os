const express = require('express');
const ethers = require('ethers');
const app = express();
app.use(express.json());

const provider = new ethers.JsonRpcProvider('https://optimism-mainnet.infura.io/v3/YOUR_KEY');

app.post('/api/layer2/transfer', async (req, res) => {
  // L2 transfer logic
  const tx = { hash: '0x...', status: 'confirmed' };
  res.json(tx);
});

app.listen(3008, () => console.log('Layer-2 Blockchain running on port 3008'));
