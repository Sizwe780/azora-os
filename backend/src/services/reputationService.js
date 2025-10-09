// Reputation logic (mock)
async function updateReputation(userId, delta, reason) {
  // In production, update DB and trigger workflows
  console.log(`Reputation for ${userId} changed by ${delta} due to ${reason}`);
  return { userId, delta, reason, updated: true };
}

module.exports = { updateReputation };
