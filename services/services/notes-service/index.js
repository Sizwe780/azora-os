const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/notes/create', (req, res) => res.json({ noteId: Date.now(), saved: true }));
app.listen(3068);
