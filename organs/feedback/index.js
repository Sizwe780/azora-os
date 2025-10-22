/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let feedbackList = [];

app.post('/api/feedback', (req,res) => {
  const { user, rating, comment } = req.body;
  feedbackList.push({ user, rating, comment, ts: Date.now() });
  res.json({ success: true });
});

app.get('/api/feedback', (req,res) => {
  res.json({ feedback: feedbackList });
});

app.listen(3600, () => console.log("[feedback] running on 3600"));
