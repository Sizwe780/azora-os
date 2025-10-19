const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ar/objects', (req, res) => res.json({ detected: ['chair','table'] }));
app.listen(3056);
