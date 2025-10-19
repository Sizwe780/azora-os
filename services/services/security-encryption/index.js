const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/security/encrypt', (req, res) => res.json({ encrypted: 'data' }));
app.listen(3031);
