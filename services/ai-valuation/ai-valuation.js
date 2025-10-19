const express = require('express');
const app = express();
app.use(express.json());

let users = 10000; // Start with 10,000 users

app.post('/api/user-growth/onboard', (req, res) => {
  users += 1;
  res.json({ totalUsers: users });
});

app.get('/api/user-growth/total', (req, res) => {
  res.json({ totalUsers: users });
});

const PORT = 4125;
app.listen(PORT, () => console.log(`📈 User Growth Service running on port ${PORT}`));