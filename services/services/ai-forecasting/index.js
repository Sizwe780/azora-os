const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/forecast', (req, res) => res.json({ prediction: 'future' }));
app.listen(3017);
