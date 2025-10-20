const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/security/auth', (req, res) => res.json({ token: 'jwt' }));
app.listen(3035);
