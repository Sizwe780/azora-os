const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'orchestration-engine' }));

app.post('/api/orchestration-engine', (req, res) => {
  // TODO: Replace with real logic
  res.json({ service: 'orchestration-engine', ok: true, received: req.body });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3072;
app.listen(PORT, () => console.log('[orchestration-engine] running on port', PORT));
