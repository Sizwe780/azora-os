const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/personalize', (req, res) => res.json({ theme: 'dark', widgets: ['weather','stocks'] }));
app.listen(3069);
