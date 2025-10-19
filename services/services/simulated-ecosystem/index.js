const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/simulate/ecosystem', (req, res) => res.json({ simulation: 'ecosystem', entities: 1000 }));
app.listen(3078);
