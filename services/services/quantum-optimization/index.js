const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/quantum/optimize', (req, res) => res.json({ optimized: true }));
app.listen(3020);
