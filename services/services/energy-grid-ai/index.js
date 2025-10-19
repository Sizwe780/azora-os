const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/energy/grid', (req, res) => res.json({ load: 123, solar: 45, battery: 67 }));
app.listen(3085);
