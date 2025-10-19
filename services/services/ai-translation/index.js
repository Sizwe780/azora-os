const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/translate', (req, res) => res.json({ translated: 'text' }));
app.listen(3018);
