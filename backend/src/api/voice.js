/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Voice Copilot API Route
// Provides REST endpoint for voice transcription and query handling

const express = require('express');
const router = express.Router();
const voiceCopilotService = require('../services/voice/voiceCopilotService');

// POST /api/voice/transcribe
router.post('/transcribe', async (req, res) => {
  try {
    const audioBuffer = req.body.audio; // Expect base64 or binary
    const lang = req.body.lang || 'en';
    const result = await voiceCopilotService.transcribe(audioBuffer, lang);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/voice/query
router.post('/query', async (req, res) => {
  try {
    const transcript = req.body.transcript;
    const lang = req.body.lang || 'en';
    const result = await voiceCopilotService.handleQuery(transcript, lang);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
