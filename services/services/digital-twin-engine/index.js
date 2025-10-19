const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/digital-twin/sync', (req, res) => res.json({ twinId: Date.now(), status: 'synced' }));
app.listen(3070);
