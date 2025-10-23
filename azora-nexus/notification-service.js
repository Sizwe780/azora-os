/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA NEXUS NOTIFICATION SERVICE
 *
 * Real-time notification system for the Azora Nexus mobile application.
 * Handles push notifications, in-app messages, and system announcements.
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');

class NotificationService {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        this.clients = new Map(); // userId -> WebSocket connection
        this.notifications = new Map(); // userId -> notification queue
    }

    initialize() {
        this.app.use(express.json());

        // WebSocket connection handling
        this.wss.on('connection', (ws, req) => {
            const userId = this.extractUserId(req.url);
            if (userId) {
                this.clients.set(userId, ws);
                console.log(`User ${userId} connected to notification service`);

                // Send any queued notifications
                this.sendQueuedNotifications(userId);

                ws.on('close', () => {
                    this.clients.delete(userId);
                    console.log(`User ${userId} disconnected from notification service`);
                });

                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message.toString());
                        this.handleMessage(userId, data);
                    } catch (error) {
                        console.error('Invalid message format:', error);
                    }
                });
            }
        });

        // REST API for sending notifications
        this.app.post('/api/notifications/send', (req, res) => {
            const { userId, type, title, message, data } = req.body;

            if (!userId || !type || !title || !message) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            this.sendNotification(userId, { type, title, message, data });
            res.json({ success: true });
        });

        // Broadcast to all users
        this.app.post('/api/notifications/broadcast', (req, res) => {
            const { type, title, message, data } = req.body;

            if (!type || !title || !message) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            this.broadcastNotification({ type, title, message, data });
            res.json({ success: true });
        });

        // Get notification history for user
        this.app.get('/api/notifications/:userId', (req, res) => {
            const userId = req.params.userId;
            const userNotifications = this.notifications.get(userId) || [];
            res.json({ notifications: userNotifications });
        });
    }

    extractUserId(url) {
        // Extract userId from WebSocket URL query parameter
        // e.g., ws://localhost:4101/?userId=12345
        const urlObj = new URL(url, 'http://localhost');
        return urlObj.searchParams.get('userId');
    }

    handleMessage(userId, data) {
        // Handle incoming messages from clients
        console.log(`Message from ${userId}:`, data);

        if (data.type === 'acknowledge') {
            // Client acknowledged receiving a notification
            this.markNotificationAsRead(userId, data.notificationId);
        }
    }

    sendNotification(userId, notification) {
        const notificationWithId = {
            id: this.generateNotificationId(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        // Queue notification if user is not connected
        if (!this.clients.has(userId)) {
            const queue = this.notifications.get(userId) || [];
            queue.push(notificationWithId);
            this.notifications.set(userId, queue);
            console.log(`Queued notification for offline user ${userId}`);
            return;
        }

        // Send immediately if user is connected
        const ws = this.clients.get(userId);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'notification',
                data: notificationWithId
            }));
            console.log(`Sent notification to user ${userId}: ${notification.title}`);
        }
    }

    broadcastNotification(notification) {
        const notificationWithId = {
            id: this.generateNotificationId(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        let sentCount = 0;
        for (const [userId, ws] of this.clients) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'notification',
                    data: notificationWithId
                }));
                sentCount++;
            }
        }

        console.log(`Broadcast notification sent to ${sentCount} connected users: ${notification.title}`);
    }

    sendQueuedNotifications(userId) {
        const queue = this.notifications.get(userId);
        if (!queue || queue.length === 0) return;

        const ws = this.clients.get(userId);
        if (ws.readyState === WebSocket.OPEN) {
            queue.forEach(notification => {
                ws.send(JSON.stringify({
                    type: 'notification',
                    data: notification
                }));
            });

            // Clear the queue after sending
            this.notifications.delete(userId);
            console.log(`Sent ${queue.length} queued notifications to user ${userId}`);
        }
    }

    markNotificationAsRead(userId, notificationId) {
        const queue = this.notifications.get(userId);
        if (queue) {
            const notification = queue.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
            }
        }
    }

    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    start(port = 4101) {
        this.server.listen(port, () => {
            console.log(`Azora Nexus Notification Service running on port ${port}`);
        });
    }

    stop() {
        this.wss.close();
        this.server.close();
    }
}

// Create and export singleton instance
const notificationService = new NotificationService();

// Initialize the service
notificationService.initialize();

module.exports = notificationService;