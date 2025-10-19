const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/arvr/scene', (req, res) => res.json({ scene: 'virtual-room', objects: 5 }));
app.listen(3051);
