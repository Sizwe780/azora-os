const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/autopilot/decide', (req, res) => res.json({ nextAction: 'scale up', confidence: 0.97 }));
app.listen(3109);
