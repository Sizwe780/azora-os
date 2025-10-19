const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/automate', (req, res) => res.json({ action: 'executed' }));
app.listen(3016);
