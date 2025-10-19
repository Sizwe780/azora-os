const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/security/firewall', (req, res) => res.json({ blocked: true }));
app.listen(3033);
