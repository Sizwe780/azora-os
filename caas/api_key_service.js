/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Minimal stub for CaaS API key generation & billing activation.
// This file is scaffold only — do not run in production without security review.

const crypto = require('crypto');
const fs = require('fs');
const KEYS_DB = './.data/caas_keys.json';

function _load() {
  try { return JSON.parse(fs.readFileSync(KEYS_DB, 'utf8')); } catch { return {}; }
}
function _save(db) { fs.mkdirSync('./.data', { recursive: true }); fs.writeFileSync(KEYS_DB, JSON.stringify(db, null, 2)); }

function generateApiKey(customerId) {
  const db = _load();
  const key = crypto.randomBytes(24).toString('hex');
  db[key] = { customerId, createdAt: new Date().toISOString(), active: true, calls: 0 };
  _save(db);
  return key;
}

function revokeApiKey(key) {
  const db = _load();
  if (db[key]) { db[key].active = false; _save(db); return true; }
  return false;
}

module.exports = { generateApiKey, revokeApiKey };