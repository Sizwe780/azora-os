const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/team/add', (req, res) => res.json({ team: req.body.team, status: 'added' }));
app.listen(3067);
