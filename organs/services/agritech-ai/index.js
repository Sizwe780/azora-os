/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'agritech-ai' }));

app.post('/api/agritech-ai', (req, res) => {
  // TODO: Replace with real logic
  res.json({ service: 'agritech-ai', ok: true, received: req.body });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3057;
app.listen(PORT, () => console.log('[agritech-ai] running on port', PORT));
