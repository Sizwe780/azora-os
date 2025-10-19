const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/green/optimize', (req, res) => res.json({ greenScore: 0.98, recommendation: 'solar' }));
app.listen(3081);
