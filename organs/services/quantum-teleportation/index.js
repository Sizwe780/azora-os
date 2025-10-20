const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/quantum/teleport', (req, res) => res.json({ teleported: true }));
app.listen(3026);
