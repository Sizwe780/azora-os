/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file socket-realtime.test.js
 * @module organs/vigil-service/test
 * @description Integration tests for Socket.io real-time functionality
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies jest, socket.io-client
 * @integrates_with
 *   - Socket.io server
 *   - Real-time metrics
 *   - Authentication
 * @api_endpoints N/A
 * @state_management Socket.io rooms
 * @mobile_optimized No
 * @accessibility N/A
 * @tests integration
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['jest', 'socket.io-client'],
  exports: [],
  consumed_by: ['npm test'],
  dependencies: ['vigil-service'],
  api_calls: [],
  state_shared: true,
  environment_vars: []
}

const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Mock the service modules
jest.mock('../src/cameraManager');
jest.mock('../src/alertEngine');
jest.mock('../src/streamProcessor');

const cameraManager = require('../src/cameraManager');
const alertEngine = require('../src/alertEngine');
const streamProcessor = require('../src/streamProcessor');

const JWT_SECRET = 'test-secret';
const TEST_USER = {
  id: 'test-user-001',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin'
};

function generateTestToken(user = TEST_USER) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    },
    JWT_SECRET
  );
}

describe('Socket.io Real-time Functionality', () => {
  let io, serverSocket, clientSocket;
  let httpServer;

  beforeAll((done) => {
    // Create HTTP server
    httpServer = createServer();

    // Create Socket.io server
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Setup Socket.io authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    // Setup Socket.io event handlers
    io.on('connection', (socket) => {
      serverSocket = socket;

      // Join camera room
      socket.on('join-camera', (cameraId) => {
        socket.join(`camera-${cameraId}`);
        socket.emit('joined-camera', { cameraId, success: true });
      });

      // Join dashboard room
      socket.on('join-dashboard', () => {
        socket.join('dashboard');
        socket.emit('joined-dashboard', { success: true });
      });

      // Leave rooms
      socket.on('leave-camera', (cameraId) => {
        socket.leave(`camera-${cameraId}`);
        socket.emit('left-camera', { cameraId, success: true });
      });

      socket.on('leave-dashboard', () => {
        socket.leave('dashboard');
        socket.emit('left-dashboard', { success: true });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    // Start server
    httpServer.listen(() => {
      const port = httpServer.address().port;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close(done);
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    cameraManager.getCameras.mockResolvedValue([
      {
        id: 'cam-001',
        name: 'Test Camera',
        status: 'online',
        streaming: { webrtc: true, hls: true, dash: false, rtsp: true }
      }
    ]);

    alertEngine.getAlerts.mockResolvedValue([
      {
        id: 'alert-001',
        event: {
          type: 'vigil.azora.alert.motion',
          data: { severity: 'medium' }
        },
        timestamp: new Date().toISOString(),
        acknowledged: false,
        escalated: false
      }
    ]);

    streamProcessor.getActiveStreams.mockResolvedValue([
      {
        cameraId: 'cam-001',
        startTime: new Date(),
        frameCount: 1000,
        status: 'active'
      }
    ]);
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
  });

  describe('Authentication', () => {
    test('should connect with valid JWT token', (done) => {
      const token = generateTestToken();

      clientSocket = Client(`http://localhost:${httpServer.address().port}`, {
        auth: { token }
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (error) => {
        done.fail(`Connection failed: ${error.message}`);
      });
    });

    test('should reject connection without token', (done) => {
      clientSocket = Client(`http://localhost:${httpServer.address().port}`);

      clientSocket.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication error');
        done();
      });

      clientSocket.on('connect', () => {
        done.fail('Connection should have been rejected');
      });
    });

    test('should reject connection with invalid token', (done) => {
      clientSocket = Client(`http://localhost:${httpServer.address().port}`, {
        auth: { token: 'invalid-token' }
      });

      clientSocket.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication error');
        done();
      });

      clientSocket.on('connect', () => {
        done.fail('Connection should have been rejected');
      });
    });
  });

  describe('Room Management', () => {
    beforeEach((done) => {
      const token = generateTestToken();

      clientSocket = Client(`http://localhost:${httpServer.address().port}`, {
        auth: { token }
      });

      clientSocket.on('connect', () => {
        done();
      });
    });

    test('should join camera room', (done) => {
      clientSocket.emit('join-camera', 'cam-001');

      clientSocket.on('joined-camera', (data) => {
        expect(data.cameraId).toBe('cam-001');
        expect(data.success).toBe(true);
        done();
      });
    });

    test('should join dashboard room', (done) => {
      clientSocket.emit('join-dashboard');

      clientSocket.on('joined-dashboard', (data) => {
        expect(data.success).toBe(true);
        done();
      });
    });

    test('should leave camera room', (done) => {
      clientSocket.emit('join-camera', 'cam-001');

      clientSocket.on('joined-camera', () => {
        clientSocket.emit('leave-camera', 'cam-001');
      });

      clientSocket.on('left-camera', (data) => {
        expect(data.cameraId).toBe('cam-001');
        expect(data.success).toBe(true);
        done();
      });
    });

    test('should leave dashboard room', (done) => {
      clientSocket.emit('join-dashboard');

      clientSocket.on('joined-dashboard', () => {
        clientSocket.emit('leave-dashboard');
      });

      clientSocket.on('left-dashboard', (data) => {
        expect(data.success).toBe(true);
        done();
      });
    });
  });

  describe('Real-time Events', () => {
    beforeEach((done) => {
      const token = generateTestToken();

      clientSocket = Client(`http://localhost:${httpServer.address().port}`, {
        auth: { token }
      });

      clientSocket.on('connect', () => {
        done();
      });
    });

    test('should receive camera metrics in camera room', (done) => {
      clientSocket.emit('join-camera', 'cam-001');

      clientSocket.on('joined-camera', () => {
        // Simulate server emitting camera metrics
        io.to('camera-cam-001').emit('camera-metrics', {
          cameraId: 'cam-001',
          fps: 30,
          resolution: '1920x1080',
          timestamp: new Date().toISOString()
        });
      });

      clientSocket.on('camera-metrics', (data) => {
        expect(data.cameraId).toBe('cam-001');
        expect(data.fps).toBe(30);
        expect(data.resolution).toBe('1920x1080');
        done();
      });
    });

    test('should receive alerts in dashboard room', (done) => {
      clientSocket.emit('join-dashboard');

      clientSocket.on('joined-dashboard', () => {
        // Simulate server emitting alert
        io.to('dashboard').emit('alert', {
          id: 'alert-001',
          type: 'vigil.azora.alert.motion',
          severity: 'medium',
          timestamp: new Date().toISOString()
        });
      });

      clientSocket.on('alert', (data) => {
        expect(data.id).toBe('alert-001');
        expect(data.type).toBe('vigil.azora.alert.motion');
        expect(data.severity).toBe('medium');
        done();
      });
    });

    test('should receive system metrics in dashboard room', (done) => {
      clientSocket.emit('join-dashboard');

      clientSocket.on('joined-dashboard', () => {
        // Simulate server emitting system metrics
        io.to('dashboard').emit('system-metrics', {
          uptime: 3600000,
          memoryUsage: 0.75,
          cpuUsage: 0.45,
          activeStreams: 3,
          timestamp: new Date().toISOString()
        });
      });

      clientSocket.on('system-metrics', (data) => {
        expect(data.uptime).toBe(3600000);
        expect(data.memoryUsage).toBe(0.75);
        expect(data.cpuUsage).toBe(0.45);
        expect(data.activeStreams).toBe(3);
        done();
      });
    });

    test('should not receive events from rooms not joined', (done) => {
      let receivedEvent = false;

      clientSocket.on('camera-metrics', () => {
        receivedEvent = true;
      });

      // Emit to camera room without joining
      io.to('camera-cam-001').emit('camera-metrics', {
        cameraId: 'cam-001',
        fps: 30
      });

      // Wait a bit and check that no event was received
      setTimeout(() => {
        expect(receivedEvent).toBe(false);
        done();
      }, 100);
    });
  });

  describe('Connection Management', () => {
    test('should handle disconnection gracefully', (done) => {
      const token = generateTestToken();

      clientSocket = Client(`http://localhost:${httpServer.address().port}`, {
        auth: { token }
      });

      clientSocket.on('connect', () => {
        clientSocket.disconnect();
      });

      clientSocket.on('disconnect', () => {
        expect(clientSocket.connected).toBe(false);
        done();
      });
    });

    test('should maintain user context', (done) => {
      const token = generateTestToken();

      clientSocket = Client(`http://localhost:${httpServer.address().port}`, {
        auth: { token }
      });

      clientSocket.on('connect', () => {
        // The server should have set socket.user from the JWT
        expect(serverSocket.user.email).toBe(TEST_USER.email);
        expect(serverSocket.user.role).toBe(TEST_USER.role);
        done();
      });
    });
  });
});