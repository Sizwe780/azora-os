/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/


const express = require('express');
const { generateMissionProtocol } = require('./weaverService');

const router = express.Router();

// Endpoint to generate a new mission protocol
router.post('/generate-mission', async (req, res) => {
  try {
    const { objective, context } = req.body;
    if (!objective) {
      return res.status(400).json({ error: 'Objective is required.' });
    }
    const mission = await generateMissionProtocol(objective, context);
    res.json(mission);
  } catch (error) {
    console.error('Error generating mission protocol:', error);
    res.status(500).json({ error: 'Failed to generate mission protocol.' });
  }
});

module.exports = router;
