const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/water/monitor', (req, res) => res.json({ pH: 7.3, contamination: 'none' }));
app.listen(3089);
