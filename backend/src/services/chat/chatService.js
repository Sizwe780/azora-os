/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Real-time Chat and Notification Service
// Corridor-scoped, secure chat and push notifications with compliance logging

class ChatService {
  constructor() {
    this.chats = [];
    this.notifications = [];
  }

  sendMessage({ from, to, message, corridor }) {
    const chat = { from, to, message, corridor, timestamp: Date.now() };
    this.chats.push(chat);
    // Log for compliance
    this.logCompliance(chat);
    return chat;
  }

  getMessages(corridor) {
    return this.chats.filter(chat => chat.corridor === corridor);
  }

  sendNotification({ to, message, corridor }) {
    const notification = { to, message, corridor, timestamp: Date.now() };
    this.notifications.push(notification);
    // Log for compliance
    this.logCompliance(notification);
    return notification;
  }

  getNotifications(corridor) {
    return this.notifications.filter(n => n.corridor === corridor);
  }

  logCompliance(entry) {
    // Immutable audit trail for chat compliance
    // For now, just print
    console.log('Compliance log:', entry);
  }
}

module.exports = new ChatService();
