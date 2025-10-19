const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/inventory/update', (req, res) => res.json({ sku: req.body.sku, stock: req.body.stock, updated: true }));
app.listen(3076);
