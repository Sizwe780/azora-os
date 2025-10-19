const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/ai/chat', (req, res) => res.json({ response: 'Hello from AI' }));
app.listen(3012);
