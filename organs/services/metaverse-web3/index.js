/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const { ThirdwebSDK } = require('@thirdweb-dev/sdk');
const app = express();
app.use(express.json());

const sdk = new ThirdwebSDK('polygon');

app.post('/api/metaverse/nft', async (req, res) => {
  const nft = await sdk.getNFTCollection('0x...').mint({ name: 'Azora Reward', to: req.body.address });
  res.json(nft);
});

app.listen(3009, () => console.log('Metaverse Web3 running on port 3009'));
