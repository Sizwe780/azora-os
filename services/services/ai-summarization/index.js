const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/summarize', (req, res) => res.json({ summary: 'short' }));
app.listen(3019);
