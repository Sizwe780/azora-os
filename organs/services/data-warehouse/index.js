const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/warehouse/query', (req, res) => res.json({ rows: [1,2,3], count: 3 }));
app.listen(3054);
