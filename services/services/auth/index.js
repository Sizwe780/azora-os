const express = require('express');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'auth' }));
const PORT = 4000 + Math.floor(Math.random() * 1000);
app.listen(PORT, () => console.log('auth running on port ${PORT}'));
