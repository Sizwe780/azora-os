const express = require('express');
const app = express();
app.use(express.json());

let listings = [];

app.post('/api/marketplace/list', (req, res) => {
  const { item, price } = req.body;
  listings.push({ item, price, id: listings.length + 1 });
  res.json({ listed: true, id: listings.length });
});

app.get('/api/marketplace/listings', (req, res) => {
  res.json({ listings });
});

const PORT = 4130;
app.listen(PORT, () => console.log(`🛒 Marketplace Service running on port ${PORT}`));
