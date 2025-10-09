// Notification logic (mock)
async function sendNotification(userId, message, type = 'info') {
  // In production, integrate with push/email/SMS
  console.log(`Notify ${userId}: [${type}] ${message}`);
  return { userId, message, type, sent: true };
}

module.exports = { sendNotification };
