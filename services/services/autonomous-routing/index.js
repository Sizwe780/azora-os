const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/autonomous/route', (req, res) => res.json({ route: ['A','B','C'], eta: 12 }));
app.listen(3071);
