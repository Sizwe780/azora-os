/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import walletApi from './walletApi.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/wallet', walletApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'wallet' });
});

const PORT = process.env.PORT || 4850; // Assume a port
app.listen(PORT, () => {
  console.log(`💰 Wallet Service is online on port ${PORT}, managing Azora Coin.`);
});