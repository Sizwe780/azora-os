const express = require('express');
const app = express();
app.use(express.json());
app.post('/api/robotic/task', (req, res) => res.json({ robot: req.body.robot, task: 'complete', status: 'done' }));
app.listen(3074);
