/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer();

app.post('/api/biometrics/face-auth', upload.single('image'), (req, res) => {
  // TODO: Connect to real face recognition, e.g. AWS Rekognition, OpenCV, etc.
  const matchScore = Math.random() * 100;
  res.json({ match: matchScore > 70, score: matchScore });
});

app.listen(4700, () => console.log("[biometrics] running on 4700"));
