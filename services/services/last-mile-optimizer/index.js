const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/lastmile/optimize', (req, res) => res.json({ optimized: true, costSaved: 123 }));
app.listen(3075);
