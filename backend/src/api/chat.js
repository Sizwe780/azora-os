/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Real-time Chat and Notification API Route
// Provides REST endpoints for chat and notifications

const express = require('express');
const router = express.Router();
const chatService = require('../services/chat/chatService');

// POST /api/chat/send-message
router.post('/send-message', (req, res) => {
  try {
    const { from, to, message, corridor } = req.body;
    const chat = chatService.sendMessage({ from, to, message, corridor });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/messages/:corridor
router.get('/messages/:corridor', (req, res) => {
  try {
    const corridor = req.params.corridor;
    const messages = chatService.getMessages(corridor);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/send-notification
router.post('/send-notification', (req, res) => {
  try {
    const { to, message, corridor } = req.body;
    const notification = chatService.sendNotification({ to, message, corridor });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/notifications/:corridor
router.get('/notifications/:corridor', (req, res) => {
  try {
    const corridor = req.params.corridor;
    const notifications = chatService.getNotifications(corridor);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
