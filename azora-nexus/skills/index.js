/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const fs = require('fs');
const path = require('path');

function loadSkills(dir) {
  const skills = new Map();
  if (!fs.existsSync(dir)) return skills;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file === 'index.js') continue;
    const modPath = path.join(dir, file);
    // eslint-disable-next-line import/no-dynamic-require
    const mod = require(modPath);
    if (mod?.name && mod?.actions && typeof mod.actions === 'object') {
      skills.set(mod.name, mod.actions);
    }
  }
  return skills;
}

module.exports = { loadSkills };