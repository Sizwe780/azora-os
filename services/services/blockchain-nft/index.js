const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/blockchain/nft', (req, res) => res.json({ minted: 'nft' }));
app.listen(3023);
