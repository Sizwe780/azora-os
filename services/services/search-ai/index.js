const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/search', (req, res) => res.json({ results: ['result1', 'result2'] }));
app.listen(3064);
