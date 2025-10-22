/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
const PORT = process.env.PORT || 4035;

const principles = [
  // Human Rights
  { id: 'UNGC-01', principle: 1, category: 'Human Rights', name: 'Support and respect the protection of internationally proclaimed human rights.' },
  { id: 'UNGC-02', principle: 2, category: 'Human Rights', name: 'Make sure that they are not complicit in human rights abuses.' },
  // Labour
  { id: 'UNGC-03', principle: 3, category: 'Labour', name: 'Uphold the freedom of association and the effective recognition of the right to collective bargaining.' },
  { id: 'UNGC-04', principle: 4, category: 'Labour', name: 'Uphold the elimination of all forms of forced and compulsory labour.' },
  { id: 'UNGC-05', principle: 5, category: 'Labour', name: 'Uphold the effective abolition of child labour.' },
  { id: 'UNGC-06', principle: 6, category: 'Labour', name: 'Uphold the elimination of discrimination in respect of employment and occupation.' },
  // Environment
  { id: 'UNGC-07', principle: 7, category: 'Environment', name: 'Support a precautionary approach to environmental challenges.' },
  { id: 'UNGC-08', principle: 8, category: 'Environment', name: 'Undertake initiatives to promote greater environmental responsibility.' },
  { id: 'UNGC-09', principle: 9, category: 'Environment', name: 'Encourage the development and diffusion of environmentally friendly technologies.' },
  // Anti-Corruption
  { id: 'UNGC-10', principle: 10, category: 'Anti-Corruption', name: 'Work against corruption in all its forms, including extortion and bribery.' },
];

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'un-global-compact-compliance' }));

app.get('/api/v1/principles', (req, res) => {
  res.status(200).json({
    source: 'United Nations Global Compact',
    principles,
  });
});

app.listen(PORT, () => console.log(`UN Global Compact Compliance service running on port ${PORT}`));

module.exports = { principles };