/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Real-Time Communication & Collaboration Service
 *
 * Comprehensive real-time service providing:
 * - WebRTC peer-to-peer communication
 * - Socket.io real-time messaging
 * - Live collaboration features
 * - Notification system
 * - Real-time data streaming
 * - Integration with database service
 */

// @ts-check
/**
 * @fileoverview Set sourceType: module for ES imports
 */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Redis from 'redis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables
require('dotenv').config();

const app = express();
const server = createServer(app);
const PORT = process.env.REALTIME_PORT || 4000;

// ============================================================================
// SOCKET.IO CONFIGURATION
// ============================================================================

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5175",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// ============================================================================
// REDIS CONFIGURATION (for pub/sub and scaling)
// ============================================================================

let redisClient = null;
let redisPublisher = null;
let redisSubscriber = null;

async function initRedis() {
  try {
    if (process.env.REDIS_URL) {
      redisClient = Redis.createClient({ url: process.env.REDIS_URL });
      redisPublisher = Redis.createClient({ url: process.env.REDIS_URL });
      redisSubscriber = Redis.createClient({ url: process.env.REDIS_URL });

      await Promise.all([
        redisClient.connect(),
        redisPublisher.connect(),
        redisSubscriber.connect()
      ]);

      console.log('✅ Redis connected for real-time service');

      // Subscribe to cross-service events
      redisSubscriber.subscribe('realtime:notifications', (message) => {
        const data = JSON.parse(message);
        broadcastNotification(data);
      });

      redisSubscriber.subscribe('realtime:updates', (message) => {
        const data = JSON.parse(message);
        broadcastUpdate(data);
      });

    } else {
      console.log('⚠️  Redis not configured, running in single-instance mode');
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
}

// ============================================================================
// IN-MEMORY DATA STRUCTURES (fallback when Redis unavailable)
// ============================================================================

const activeUsers = new Map(); // userId -> socketId
const activeRooms = new Map(); // roomId -> Set of socketIds
const userSessions = new Map(); // socketId -> userData
const collaborationSessions = new Map(); // sessionId -> collaborationData
const notificationQueue = new Map(); // userId -> Array of notifications

// ============================================================================
// WEBRTC SIGNALING
// ============================================================================

class WebRTCSignaling {
  constructor() {
    this.peers = new Map(); // peerId -> {socketId, roomId, offer, answer, candidates}
  }

  // Handle WebRTC signaling messages
  async handleSignaling(socket, data) {
    const { type, peerId, roomId, offer, answer, candidate } = data;

    switch (type) {
      case 'join-room':
        await this.joinRoom(socket, peerId, roomId);
        break;
      case 'offer':
        await this.handleOffer(socket, peerId, roomId, offer);
        break;
      case 'answer':
        await this.handleAnswer(socket, peerId, roomId, answer);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(socket, peerId, roomId, candidate);
        break;
      case 'leave-room':
        await this.leaveRoom(socket, peerId, roomId);
        break;
    }
  }

  async joinRoom(socket, peerId, roomId) {
    // Store peer information
    this.peers.set(peerId, {
      socketId: socket.id,
      roomId,
      connected: true
    });

    // Notify other peers in the room
    socket.to(roomId).emit('peer-joined', {
      peerId,
      roomId
    });

    socket.join(roomId);
    console.log(`🔗 Peer ${peerId} joined room ${roomId}`);
  }

  async handleOffer(socket, peerId, roomId, offer) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.offer = offer;
      socket.to(roomId).emit('offer', {
        peerId,
        offer,
        roomId
      });
    }
  }

  async handleAnswer(socket, peerId, roomId, answer) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.answer = answer;
      socket.to(roomId).emit('answer', {
        peerId,
        answer,
        roomId
      });
    }
  }

  async handleIceCandidate(socket, peerId, roomId, candidate) {
    socket.to(roomId).emit('ice-candidate', {
      peerId,
      candidate,
      roomId
    });
  }

  async leaveRoom(socket, peerId, roomId) {
    this.peers.delete(peerId);
    socket.to(roomId).emit('peer-left', {
      peerId,
      roomId
    });
    socket.leave(roomId);
    console.log(`🔌 Peer ${peerId} left room ${roomId}`);
  }
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

class NotificationManager {
  constructor() {
    this.notifications = new Map(); // userId -> Array of notifications
  }

  // Send notification to user
  async sendNotification(userId, notification) {
    const notif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      timestamp: new Date().toISOString(),
      read: false
    };

    // Store in memory
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId).push(notif);

    // Keep only last 100 notifications per user
    const userNotifications = this.notifications.get(userId);
    if (userNotifications.length > 100) {
      userNotifications.splice(0, userNotifications.length - 100);
    }

    // Send to connected user
    const socketId = activeUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notif);
    }

    // Store in Redis for persistence
    if (redisClient) {
      await redisClient.setEx(`notification:${userId}:${notif.id}`, 86400, JSON.stringify(notif));
    }

    console.log(`📢 Notification sent to user ${userId}: ${notification.title}`);
    return notif;
  }

  // Get user notifications
  getUserNotifications(userId, limit = 50) {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.slice(-limit);
  }

  // Mark notification as read
  markAsRead(userId, notificationId) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
      }
    }
  }

  // Broadcast notification to all users or specific group
  async broadcastNotification(notification, userIds = null) {
    if (userIds) {
      // Send to specific users
      for (const userId of userIds) {
        await this.sendNotification(userId, notification);
      }
    } else {
      // Send to all connected users
      const connectedUsers = Array.from(activeUsers.keys());
      for (const userId of connectedUsers) {
        await this.sendNotification(userId, notification);
      }
    }
  }
}

// ============================================================================
// LIVE COLLABORATION
// ============================================================================

class CollaborationManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> sessionData
    this.userCursors = new Map(); // userId -> cursorData
  }

  // Create collaboration session
  createSession(sessionId, data) {
    const session = {
      id: sessionId,
      type: data.type || 'document', // document, whiteboard, code, etc.
      participants: new Set(),
      document: data.document || {},
      cursors: new Map(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    this.sessions.set(sessionId, session);
    console.log(`📝 Collaboration session created: ${sessionId}`);
    return session;
  }

  // Join collaboration session
  joinSession(sessionId, userId, userData) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.participants.add(userId);
    session.lastActivity = new Date().toISOString();

    // Notify other participants
    const participants = Array.from(session.participants).filter(id => id !== userId);
    for (const participantId of participants) {
      const socketId = activeUsers.get(participantId);
      if (socketId) {
        io.to(socketId).emit('collaboration:participant-joined', {
          sessionId,
          userId,
          userData
        });
      }
    }

    console.log(`👥 User ${userId} joined collaboration session ${sessionId}`);
    return session;
  }

  // Leave collaboration session
  leaveSession(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.participants.delete(userId);
    session.cursors.delete(userId);
    session.lastActivity = new Date().toISOString();

    // Notify other participants
    const participants = Array.from(session.participants);
    for (const participantId of participants) {
      const socketId = activeUsers.get(participantId);
      if (socketId) {
        io.to(socketId).emit('collaboration:participant-left', {
          sessionId,
          userId
        });
      }
    }

    // Clean up empty sessions
    if (session.participants.size === 0) {
      this.sessions.delete(sessionId);
      console.log(`🗑️  Collaboration session cleaned up: ${sessionId}`);
    }

    console.log(`👋 User ${userId} left collaboration session ${sessionId}`);
  }

  // Handle collaboration updates
  handleUpdate(sessionId, userId, update) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.lastActivity = new Date().toISOString();

    // Apply update to session document
    this.applyUpdate(session, update);

    // Broadcast update to other participants
    const participants = Array.from(session.participants).filter(id => id !== userId);
    for (const participantId of participants) {
      const socketId = activeUsers.get(participantId);
      if (socketId) {
        io.to(socketId).emit('collaboration:update', {
          sessionId,
          userId,
          update,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Update user cursor position
  updateCursor(sessionId, userId, cursorData) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.cursors.set(userId, {
      ...cursorData,
      userId,
      timestamp: new Date().toISOString()
    });

    // Broadcast cursor update
    const participants = Array.from(session.participants).filter(id => id !== userId);
    for (const participantId of participants) {
      const socketId = activeUsers.get(participantId);
      if (socketId) {
        io.to(socketId).emit('collaboration:cursor-update', {
          sessionId,
          userId,
          cursor: cursorData
        });
      }
    }
  }

  // Apply update to session document
  applyUpdate(session, update) {
    const { type, path, value, operation } = update;

    switch (type) {
      case 'text':
        this.applyTextUpdate(session.document, path, value, operation);
        break;
      case 'shape':
        this.applyShapeUpdate(session.document, path, value, operation);
        break;
      case 'code':
        this.applyCodeUpdate(session.document, path, value, operation);
        break;
    }
  }

  applyTextUpdate(document, path, value, operation) {
    // Simple text update implementation
    const keys = path.split('.');
    let current = document;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    if (operation === 'insert') {
      current[lastKey] = (current[lastKey] || '') + value;
    } else if (operation === 'delete') {
      current[lastKey] = (current[lastKey] || '').replace(value, '');
    } else if (operation === 'replace') {
      current[lastKey] = value;
    }
  }

  applyShapeUpdate(document, path, value, operation) {
    // Shape update for whiteboard functionality
    if (!document.shapes) document.shapes = [];

    if (operation === 'add') {
      document.shapes.push(value);
    } else if (operation === 'update') {
      const index = document.shapes.findIndex(s => s.id === value.id);
      if (index !== -1) {
        document.shapes[index] = { ...document.shapes[index], ...value };
      }
    } else if (operation === 'delete') {
      document.shapes = document.shapes.filter(s => s.id !== value.id);
    }
  }

  applyCodeUpdate(document, path, value, operation) {
    // Code update for collaborative coding
    if (!document.code) document.code = {};

    const keys = path.split('.');
    let current = document.code;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    if (operation === 'insert') {
      current[lastKey] = (current[lastKey] || '') + value;
    } else if (operation === 'delete') {
      current[lastKey] = (current[lastKey] || '').replace(value, '');
    } else if (operation === 'replace') {
      current[lastKey] = value;
    }
  }
}

// ============================================================================
// REAL-TIME DATA STREAMING
// ============================================================================

class DataStreamingManager {
  constructor() {
    this.streams = new Map(); // streamId -> streamData
    this.subscribers = new Map(); // streamId -> Set of subscriberIds
  }

  // Create data stream
  createStream(streamId, config) {
    const stream = {
      id: streamId,
      type: config.type || 'generic', // metrics, logs, events, etc.
      active: true,
      subscribers: new Set(),
      buffer: [],
      bufferSize: config.bufferSize || 1000,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    this.streams.set(streamId, stream);
    console.log(`📊 Data stream created: ${streamId}`);
    return stream;
  }

  // Subscribe to data stream
  subscribeToStream(streamId, subscriberId, socketId) {
    const stream = this.streams.get(streamId);
    if (!stream) return false;

    stream.subscribers.add(subscriberId);
    this.subscribers.set(streamId, stream.subscribers);

    // Send buffered data to new subscriber
    if (stream.buffer.length > 0) {
      io.to(socketId).emit('stream:data', {
        streamId,
        data: stream.buffer,
        type: 'buffer'
      });
    }

    console.log(`📡 Subscriber ${subscriberId} joined stream ${streamId}`);
    return true;
  }

  // Unsubscribe from data stream
  unsubscribeFromStream(streamId, subscriberId) {
    const stream = this.streams.get(streamId);
    if (!stream) return;

    stream.subscribers.delete(subscriberId);

    // Clean up empty streams
    if (stream.subscribers.size === 0) {
      this.streams.delete(streamId);
      console.log(`🗑️  Data stream cleaned up: ${streamId}`);
    }

    console.log(`📴 Subscriber ${subscriberId} left stream ${streamId}`);
  }

  // Publish data to stream
  publishToStream(streamId, data) {
    const stream = this.streams.get(streamId);
    if (!stream || !stream.active) return;

    stream.lastUpdate = new Date().toISOString();

    // Add to buffer
    stream.buffer.push({
      data,
      timestamp: new Date().toISOString()
    });

    // Maintain buffer size
    if (stream.buffer.length > stream.bufferSize) {
      stream.buffer.shift();
    }

    // Broadcast to subscribers
    for (const subscriberId of stream.subscribers) {
      const socketId = activeUsers.get(subscriberId);
      if (socketId) {
        io.to(socketId).emit('stream:data', {
          streamId,
          data: [data],
          type: 'live',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Get stream statistics
  getStreamStats(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) return null;

    return {
      id: stream.id,
      type: stream.type,
      active: stream.active,
      subscriberCount: stream.subscribers.size,
      bufferSize: stream.buffer.length,
      createdAt: stream.createdAt,
      lastUpdate: stream.lastUpdate
    };
  }
}

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

const webrtcSignaling = new WebRTCSignaling();
const notificationManager = new NotificationManager();
const collaborationManager = new CollaborationManager();
const dataStreaming = new DataStreamingManager();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Real-Time Communication Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    connections: io.engine.clientsCount,
    activeUsers: activeUsers.size,
    activeRooms: activeRooms.size
  });
});

// Get active users
app.get('/users/active', (req, res) => {
  const users = Array.from(activeUsers.entries()).map(([userId, socketId]) => {
    const session = userSessions.get(socketId);
    return {
      userId,
      socketId,
      ...session
    };
  });

  res.json({ users, count: users.length });
});

// Get active rooms
app.get('/rooms/active', (req, res) => {
  const rooms = Array.from(activeRooms.entries()).map(([roomId, sockets]) => ({
    roomId,
    participants: sockets.size,
    participantIds: Array.from(sockets)
  }));

  res.json({ rooms, count: rooms.length });
});

// Get collaboration sessions
app.get('/collaboration/sessions', (req, res) => {
  const sessions = Array.from(collaborationManager.sessions.values()).map(session => ({
    id: session.id,
    type: session.type,
    participants: Array.from(session.participants),
    participantCount: session.participants.size,
    lastActivity: session.lastActivity
  }));

  res.json({ sessions, count: sessions.length });
});

// Get data streams
app.get('/streams', (req, res) => {
  const streams = Array.from(dataStreaming.streams.values()).map(stream =>
    dataStreaming.getStreamStats(stream.id)
  );

  res.json({ streams, count: streams.length });
});

// Send notification via REST API
app.post('/notifications/send', async (req, res) => {
  try {
    const { userId, notification } = req.body;

    if (!userId || !notification) {
      return res.status(400).json({ error: 'userId and notification required' });
    }

    const sentNotification = await notificationManager.sendNotification(userId, notification);
    res.json({ success: true, notification: sentNotification });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Broadcast notification
app.post('/notifications/broadcast', async (req, res) => {
  try {
    const { notification, userIds } = req.body;

    if (!notification) {
      return res.status(400).json({ error: 'notification required' });
    }

    await notificationManager.broadcastNotification(notification, userIds);
    res.json({ success: true, message: 'Notification broadcasted' });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SOCKET.IO EVENT HANDLERS
// ============================================================================

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // User authentication and registration
  socket.on('authenticate', (userData) => {
    const { userId, name, role, companyId } = userData;

    // Store user session
    userSessions.set(socket.id, {
      userId,
      name,
      role,
      companyId,
      connectedAt: new Date().toISOString()
    });

    // Map user to socket
    activeUsers.set(userId, socket.id);

    console.log(`👤 User authenticated: ${userId} (${name})`);

    // Send welcome notification
    notificationManager.sendNotification(userId, {
      type: 'success',
      title: 'Connected',
      message: `Welcome to Azora OS, ${name}!`
    });
  });

  // Join room
  socket.on('join-room', (data) => {
    const { roomId, userId } = data;

    socket.join(roomId);

    // Track active rooms
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add(socket.id);

    console.log(`🏠 User ${userId} joined room: ${roomId}`);

    // Notify others in room
    socket.to(roomId).emit('user-joined', {
      userId,
      socketId: socket.id,
      roomId,
      timestamp: new Date().toISOString()
    });
  });

  // Leave room
  socket.on('leave-room', (data) => {
    const { roomId, userId } = data;

    socket.leave(roomId);

    // Remove from active rooms
    const roomSockets = activeRooms.get(roomId);
    if (roomSockets) {
      roomSockets.delete(socket.id);
      if (roomSockets.size === 0) {
        activeRooms.delete(roomId);
      }
    }

    console.log(`🏠 User ${userId} left room: ${roomId}`);

    // Notify others in room
    socket.to(roomId).emit('user-left', {
      userId,
      socketId: socket.id,
      roomId,
      timestamp: new Date().toISOString()
    });
  });

  // WebRTC signaling
  socket.on('webrtc:signal', (data) => {
    webrtcSignaling.handleSignaling(socket, data);
  });

  // Real-time messaging
  socket.on('message', (data) => {
    const { roomId, message, userId, username } = data;

    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      message,
      roomId,
      timestamp: new Date().toISOString()
    };

    // Broadcast to room
    io.to(roomId).emit('message', messageData);

    console.log(`💬 Message in ${roomId} from ${username}: ${message.substring(0, 50)}...`);
  });

  // Typing indicators
  socket.on('typing-start', (data) => {
    const { roomId, userId, username } = data;
    socket.to(roomId).emit('typing-start', { userId, username });
  });

  socket.on('typing-stop', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('typing-stop', { userId });
  });

  // Collaboration events
  socket.on('collaboration:create-session', (data) => {
    const { sessionId, sessionData } = data;
    collaborationManager.createSession(sessionId, sessionData);
    socket.emit('collaboration:session-created', { sessionId });
  });

  socket.on('collaboration:join-session', (data) => {
    const { sessionId, userId, userData } = data;
    const session = collaborationManager.joinSession(sessionId, userId, userData);
    if (session) {
      socket.emit('collaboration:session-joined', { sessionId, session });
    } else {
      socket.emit('collaboration:error', { message: 'Session not found' });
    }
  });

  socket.on('collaboration:leave-session', (data) => {
    const { sessionId, userId } = data;
    collaborationManager.leaveSession(sessionId, userId);
  });

  socket.on('collaboration:update', (data) => {
    const { sessionId, userId, update } = data;
    collaborationManager.handleUpdate(sessionId, userId, update);
  });

  socket.on('collaboration:cursor-update', (data) => {
    const { sessionId, userId, cursorData } = data;
    collaborationManager.updateCursor(sessionId, userId, cursorData);
  });

  // Data streaming
  socket.on('stream:subscribe', (data) => {
    const { streamId, userId } = data;
    const success = dataStreaming.subscribeToStream(streamId, userId, socket.id);
    socket.emit('stream:subscribed', { streamId, success });
  });

  socket.on('stream:unsubscribe', (data) => {
    const { streamId, userId } = data;
    dataStreaming.unsubscribeFromStream(streamId, userId);
  });

  socket.on('stream:publish', (data) => {
    const { streamId, streamData } = data;
    dataStreaming.publishToStream(streamId, streamData);
  });

  // File sharing
  socket.on('file-share', (data) => {
    const { roomId, fileData, userId, filename } = data;

    // Broadcast file to room
    socket.to(roomId).emit('file-received', {
      fileData,
      filename,
      userId,
      timestamp: new Date().toISOString()
    });

    console.log(`📁 File shared in ${roomId}: ${filename} by ${userId}`);
  });

  // Screen sharing signals
  socket.on('screen-share:start', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('screen-share:started', { userId });
  });

  socket.on('screen-share:stop', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('screen-share:stopped', { userId });
  });

  // Voice/video call signals
  socket.on('call:initiate', (data) => {
    const { targetUserId, callData, userId } = data;
    const targetSocketId = activeUsers.get(targetUserId);

    if (targetSocketId) {
      io.to(targetSocketId).emit('call:incoming', {
        from: userId,
        callData,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('call:accept', (data) => {
    const { targetUserId, callData, userId } = data;
    const targetSocketId = activeUsers.get(targetUserId);

    if (targetSocketId) {
      io.to(targetSocketId).emit('call:accepted', {
        from: userId,
        callData,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('call:reject', (data) => {
    const { targetUserId, userId } = data;
    const targetSocketId = activeUsers.get(targetUserId);

    if (targetSocketId) {
      io.to(targetSocketId).emit('call:rejected', {
        from: userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);

    // Clean up user session
    const userSession = userSessions.get(socket.id);
    if (userSession) {
      const { userId } = userSession;
      activeUsers.delete(userId);

      // Leave all collaboration sessions
      for (const [sessionId, session] of collaborationManager.sessions) {
        if (session.participants.has(userId)) {
          collaborationManager.leaveSession(sessionId, userId);
        }
      }

      // Leave all data streams
      for (const [streamId, subscribers] of dataStreaming.subscribers) {
        if (subscribers.has(userId)) {
          dataStreaming.unsubscribeFromStream(streamId, userId);
        }
      }

      // Clean up from active rooms
      for (const [roomId, sockets] of activeRooms) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          activeRooms.delete(roomId);
        }
      }

      userSessions.delete(socket.id);
    }

    // Clean up WebRTC peers
    for (const [peerId, peer] of webrtcSignaling.peers) {
      if (peer.socketId === socket.id) {
        webrtcSignaling.peers.delete(peerId);
      }
    }
  });
});

// ============================================================================
// BROADCAST FUNCTIONS
// ============================================================================

function broadcastNotification(data) {
  if (data.userIds) {
    // Send to specific users
    for (const userId of data.userIds) {
      notificationManager.sendNotification(userId, data.notification);
    }
  } else {
    // Send to all users
    notificationManager.broadcastNotification(data.notification);
  }
}

function broadcastUpdate(data) {
  const { event, payload, rooms } = data;

  if (rooms) {
    // Send to specific rooms
    for (const roomId of rooms) {
      io.to(roomId).emit(event, payload);
    }
  } else {
    // Broadcast to all connected clients
    io.emit(event, payload);
  }
}

// ============================================================================
// STARTUP
// ============================================================================

async function startServer() {
  try {
    // Initialize Redis for scaling
    await initRedis();

    // Start the server
    server.listen(PORT, () => {
      console.log(`🔴 Real-Time Communication Service online on port ${PORT}`);
      console.log(`🌐 Socket.IO server ready`);
      console.log(`📡 WebRTC signaling active`);
      console.log(`🔔 Notification system active`);
      console.log(`👥 Live collaboration ready`);
      console.log(`📊 Real-time data streaming active`);
      console.log(`🚀 Ready for real-time Azora OS interactions`);
    });

  } catch (error) {
    console.error('Failed to start real-time service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down real-time service...');

  // Close Redis connections
  if (redisClient) await redisClient.quit();
  if (redisPublisher) await redisPublisher.quit();
  if (redisSubscriber) await redisSubscriber.quit();

  // Close Socket.IO server
  io.close();

  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down real-time service...');

  // Close Redis connections
  if (redisClient) await redisClient.quit();
  if (redisPublisher) await redisPublisher.quit();
  if (redisSubscriber) await redisSubscriber.quit();

  // Close Socket.IO server
  io.close();

  process.exit(0);
});

startServer();

export {
  io,
  webrtcSignaling,
  notificationManager,
  collaborationManager,
  dataStreaming,
  activeUsers,
  activeRooms
};
export default app;