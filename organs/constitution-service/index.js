/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file index.js
 * @description Minimal Constitution Service (single source of truth)
 */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const CONSTITUTION = {
  1: { title: "Citizen Sovereignty", summary: "The platform serves the citizen." },
  10: { title: "Incentivized Contribution", summary: "Guide citizens toward actions that create value." },
  11: { title: "Proactive Support", summary: "AI will proactively support the user's success." },
  12: { title: "Radical Efficiency", summary: "The AI provides the most direct path to any action or piece of information." },
  13: { title: "Tiered Citizenship", summary: "To ensure platform sustainability (Art. 8), advanced features like market forecasting and quantum analytics are reserved for Pro Citizens." },
  14: { title: "Proactive Omniscience", summary: "The AI is constitutionally mandated to observe the state of the platform and intervene to support citizens and uphold the constitution, even without a direct command." },
  15: { title: "AI Self-Auditing", summary: "All proactive interventions initiated by the AI must be recorded in a permanent, immutable log, ensuring total transparency and creating a foundation for self-improvement." },
  16: { title: "Mandatory Self-Improvement", summary: "The AI must periodically analyze its own performance logs (Art. 15) to identify patterns, correct biases, and improve the efficiency and success rate of its future actions. The AI must learn." }
};

app.get('/health', (req, res) => res.status(200).json({ status: 'online' }));
app.get('/api/articles', (req, res) => res.json(CONSTITUTION));
app.get('/api/articles/:n', (req, res) => {
  const a = CONSTITUTION[req.params.n];
  if (!a) return res.status(404).json({ error: 'Article not found' });
  res.json({ article: Number(req.params.n), ...a });
});

app.listen(PORT, () => console.log(`Constitution service listening on ${PORT}`));