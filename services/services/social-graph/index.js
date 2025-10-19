const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/social/connect', (req, res) => res.json({ connected: true, user: req.body.user }));
app.listen(3063);
