const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/message/send', (req, res) => res.json({ sent: true, messageId: Date.now() }));
app.listen(3061);
