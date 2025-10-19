const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/knowledge/query', (req, res) => res.json({ answer: '42', doc: 'doc.md' }));
app.listen(3062);
