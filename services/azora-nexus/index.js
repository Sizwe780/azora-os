/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const notificationService = require('./notification-service');

const app = express();
app.use(express.json());

let profiles = {};

// Personalization endpoints
app.post('/api/personalize', (req, res) => {
  const { userId, preferences } = req.body;
  profiles[userId] = { ...(profiles[userId] || {}), ...preferences };
  res.json({ ok: true, profile: profiles[userId] });
});

app.get('/api/personalize/:userId', (req, res) => {
  res.json({ profile: profiles[req.params.userId] || {} });
});

// Global Transfer feature notification
function sendGlobalTransferNotification() {
  // Broadcast to all connected users
  notificationService.broadcastNotification({
    type: 'feature_launch',
    title: 'Azora Global Transfer',
    message: 'Now Live: Send value anywhere in the world. Instantly. Transparently. Welcome to the new economy.',
    data: {
      feature: 'global_transfer',
      launchDate: '2025-10-23T13:15:00Z',
      capabilities: [
        'Cross-border transfers',
        'Real-time exchange rates',
        '5% Protocol Integrated Value Capture',
        'Smart contract security'
      ]
    }
  });

  console.log('Global Transfer launch notification broadcasted to all users');
}

// Start services
app.listen(4100, () => {
  console.log("[personalization] running on 4100");

  // Start notification service
  notificationService.start(4101);

  // Send initial Global Transfer notification
  setTimeout(() => {
    sendGlobalTransferNotification();
  }, 1000); // Send after 1 second to allow connections
});
