/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { VoiceService } from './voiceService.js';

const router = express.Router();
const voiceService = new VoiceService();

router.post('/transcribe', async (req, res) => {
  try {
    const { audio_data, userId } = req.body;
    if (!audio_data) {
      return res.status(400).json({ error: 'No audio data provided.' });
    }
    const result = await voiceService.transcribe(audio_data, userId);
    res.json(result);
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;