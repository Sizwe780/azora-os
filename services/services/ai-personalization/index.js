const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/personalize', (req, res) => res.json({ recommendation: 'personalized' }));
app.listen(3010);
