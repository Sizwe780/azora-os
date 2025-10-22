/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const bodyParser = require('body-parser');
const { runAllAIs } = require('./index');
const weaverApi = require('./weaverApi'); // Import the new Weaver API

const app = express();
app.use(bodyParser.json());

// Mount the Weaver API
app.use('/weaver', weaverApi);

// Unified AI endpoint
app.post('/analyze', async (req, res) => {
  try {
    const context = req.body;
    const result = await runAllAIs(context);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
