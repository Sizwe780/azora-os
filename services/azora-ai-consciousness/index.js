const express = require('express');
const app = express();
app.get('/health', (req, res) => res.json({ status: 'conscious' }));
app.listen(5000, () => console.log('✅ AI on 5000'));
