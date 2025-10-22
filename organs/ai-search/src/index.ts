/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';
import aiSearchApi from './aiSearchApi.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ai-search', aiSearchApi);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-search' });
});

const PORT = process.env.PORT || 4890; // Unique port
app.listen(PORT, () => {
  console.log(`🔍 AI Search Service is online on port ${PORT}, indexing and searching with AI.`);
});