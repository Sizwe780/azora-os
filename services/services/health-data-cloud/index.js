const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/health/data', (req, res) => res.json({ recordId: Date.now(), synced: true }));
app.listen(3082);
