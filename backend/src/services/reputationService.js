/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Reputation service
async function updateReputation(userId, delta, reason) {
  // In production, update DB and trigger workflows
  console.log(`Reputation for ${userId} changed by ${delta} due to ${reason}`);
  return { userId, delta, reason, updated: true };
}

module.exports = { updateReputation };
