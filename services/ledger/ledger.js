const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const SNAPSHOT_DIR = path.join(__dirname, 'snapshots');

(async () => { await fs.mkdir(SNAPSHOT_DIR, { recursive: true }); })();

app.post('/api/ledger/checkpoint', async (req, res) => {
  const { nodeid, stateroot, signature, snapshot_locator } = req.body;
  const checkpointId = Date.now().toString();
  const slices = ['slice-00.bin', 'slice-01.bin'];
  await fs.writeFile(path.join(SNAPSHOT_DIR, `state-${checkpointId}.root`), JSON.stringify({ stateroot, signature }));
  res.json({ checkpointid: checkpointId, distributedslices_refs: slices });
});

app.get('/api/ledger/state', (req, res) => {
  res.json({ stateroot: '0x123', lastCheckpoint: Date.now() });
});

const PORT = process.env.LEDGER_PORT || 4099;
app.listen(PORT, () => console.log(`✅ Ledger Service running on port ${PORT}`));
