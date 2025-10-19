const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/blockchain/defi', (req, res) => res.json({ yield: '10%' }));
app.listen(3025);
