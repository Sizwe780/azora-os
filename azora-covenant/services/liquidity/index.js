const express = require('express');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'liquidity' }));
app.listen(4000 + (RANDOM % 1000), () => console.log('liquidity running'));
