const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/recommend', (req, res) => res.json({ items: ['item1'] }));
app.listen(3015);
