const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'self-healing-core' }));

app.post('/api/self-healing-core', (req, res) => {
  // TODO: Replace with real logic
  res.json({ service: 'self-healing-core', ok: true, received: req.body });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3073;
app.listen(PORT, () => console.log('[self-healing-core] running on port', PORT));
