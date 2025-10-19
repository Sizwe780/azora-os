const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/compliance/gdpr', (req, res) => res.json({ compliant: true }));
app.listen(3030);
