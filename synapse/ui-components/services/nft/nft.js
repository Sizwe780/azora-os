/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let nfts = [];

app.post('/api/nft/mint', (req, res) => {
  const { owner, metadata } = req.body;
  const id = nfts.length + 1;
  nfts.push({ id, owner, metadata, value: 100 });
  res.json({ nftId: id, estimatedValue: 100 });
});

const PORT = 4118;
app.listen(PORT, () => console.log(`🎨 NFT Service running on port ${PORT}`));
