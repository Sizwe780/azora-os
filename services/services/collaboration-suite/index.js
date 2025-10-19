const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/collab/share', (req, res) => res.json({ shared: true, docId: Date.now() }));
app.listen(3060);
