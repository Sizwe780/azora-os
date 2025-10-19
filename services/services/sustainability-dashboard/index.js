const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'sustainability-dashboard' }));

app.post('/api/sustainability-dashboard', (req, res) => {
  // TODO: Replace with real logic
  res.json({ service: 'sustainability-dashboard', ok: true, received: req.body });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3050;
app.listen(PORT, () => console.log('[sustainability-dashboard] running on port', PORT));
