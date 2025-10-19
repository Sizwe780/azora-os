const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/sentiment', (req, res) => res.json({ sentiment: 'positive' }));
app.listen(3011);
