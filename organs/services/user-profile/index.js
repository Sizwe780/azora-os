const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/profile/update', (req, res) => res.json({ updated: true, user: req.body.user }));
app.listen(3066);
