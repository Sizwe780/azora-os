/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Vision AI API Route
// Provides REST endpoint for image analysis and video streaming

const express = require('express');
const router = express.Router();
const visionService = require('../services/visionService');

// POST /api/vision/analyze
router.post('/analyze', async (req, res) => {
  try {
    const imageBuffer = req.body.image; // Expect base64 or binary
    const result = await visionService.analyzeImage(imageBuffer);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vision/stream
router.post('/stream', async (req, res) => {
  try {
    // Placeholder for video stream handling
    const result = await visionService.streamVideo(req.body.stream);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
