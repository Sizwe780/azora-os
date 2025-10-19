const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/waste/track', (req, res) => res.json({ wasteId: Date.now(), recycled: true }));
app.listen(3088);
