const express = require('express');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'offline-sync-service' }));
const PORT = 4000 + Math.floor(Math.random() * 1000);
app.listen(PORT, () => console.log('offline-sync-service running on port ${PORT}'));
