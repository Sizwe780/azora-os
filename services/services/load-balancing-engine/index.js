const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/loadbalancer/distribute', (req, res) => res.json({ nodes: 5, strategy: 'round-robin' }));
app.listen(3108);
