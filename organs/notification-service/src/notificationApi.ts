/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { NotificationService } from './notificationService';

const router = express.Router();

router.post('/notify', async (req, res) => {
  const { userId, title, message, action } = req.body;
  if (!userId || !title || !message) {
    return res.status(400).json({ error: 'userId, title, and message are required.' });
  }
  try {
    const notification = await NotificationService.sendNotification(userId, title, message, action);
    res.status(202).json({ success: true, message: "Notification dispatched.", id: notification.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification', details: err });
  }
});

router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await NotificationService.getNotifications(userId);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get notifications', details: err });
  }
});

router.get('/proactive/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await NotificationService.proactiveNotify(userId);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send proactive notification', details: err });
  }
});

export default router;