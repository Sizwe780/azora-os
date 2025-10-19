const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/edge/ai', (req, res) => res.json({ inference: 'cat', confidence: 0.98 }));
app.listen(3058);
