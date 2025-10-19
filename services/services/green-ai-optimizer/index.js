const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'green-ai-optimizer' }));

app.post('/api/green-ai-optimizer', (req, res) => {
  // TODO: Replace with real logic
  res.json({ service: 'green-ai-optimizer', ok: true, received: req.body });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3051;
app.listen(PORT, () => console.log('[green-ai-optimizer] running on port', PORT));
