const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'load-balancing-engine' }));

app.post('/api/load-balancing-engine', (req, res) => {
  // TODO: Replace with real logic
  res.json({ service: 'load-balancing-engine', ok: true, received: req.body });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3078;
app.listen(PORT, () => console.log('[load-balancing-engine] running on port', PORT));
