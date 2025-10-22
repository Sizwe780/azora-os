/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import aiTradingApi from './aiTradingApi.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ai-trading', aiTradingApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-trading' });
});

const PORT = process.env.PORT || 4900; // Unique port
app.listen(PORT, () => {
  console.log(`📈 AI Trading Service is online on port ${PORT}, executing trades with AI strategies.`);
});