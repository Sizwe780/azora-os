/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Notification service
async function sendNotification(userId, message, type = 'info') {
  // In production, integrate with push/email/SMS
  console.log(`Notify ${userId}: [${type}] ${message}`);
  return { userId, message, type, sent: true };
}

module.exports = { sendNotification };
