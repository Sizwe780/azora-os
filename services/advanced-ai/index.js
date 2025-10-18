const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; // Port should be managed by orchestrator
const SERVICE_NAME = 'advanced-ai';

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

// Add service-specific routes below this line

app.listen(PORT, () => {
  console.log();
});

// --- Existing code from original file ---

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');
const path = require('path');// filepath: /workspaces/azora-os/services/advanced-ai/index.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');
const path = require('path');
