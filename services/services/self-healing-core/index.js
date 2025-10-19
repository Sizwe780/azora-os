const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/selfhealing/trigger', (req, res) => res.json({ healed: true, issue: req.body.issue || 'unknown' }));
app.listen(3103);
