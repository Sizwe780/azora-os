const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/data-lake/store', (req, res) => res.json({ stored: true, id: Date.now() }));
app.listen(3050);
