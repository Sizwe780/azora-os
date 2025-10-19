const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/vision', (req, res) => res.json({ detected: 'objects' }));
app.listen(3013);
