const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/nlp', (req, res) => res.json({ processed: 'text' }));
app.listen(3014);
