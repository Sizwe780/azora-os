/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file camera-manager.test.js
 * @module organs/vigil-service/test
 * @description Unit tests for camera manager functionality
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies jest
 * @integrates_with
 *   - Camera discovery
 *   - Stream processing
 *   - ONVIF protocol
 * @api_endpoints N/A
 * @state_management Camera configurations
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['jest'],
  exports: [],
  consumed_by: ['npm test'],
  dependencies: ['vigil-service'],
  api_calls: [],
  state_shared: false,
  environment_vars: []
}

const cameraManager = require('../src/cameraManager');

describe('Camera Manager', () => {
  let originalDiscoverCameras;

  beforeEach(() => {
    // Reset camera manager state
    cameraManager.cameras = new Map();
    cameraManager.discoveryInProgress = false;
    jest.clearAllMocks();
    // Save original method
    originalDiscoverCameras = cameraManager.discoverCameras;
  });

  afterEach(() => {
    // Restore original methods after each test
    cameraManager.discoverCameras = originalDiscoverCameras;
    jest.restoreAllMocks();
  });

  describe('Camera Discovery', () => {
    test('should discover cameras on network', async () => {
      // Mock network discovery
      const mockCameras = [
        {
          id: 'cam-001',
          name: 'Front Door Camera',
          ip: '192.168.1.100',
          port: 554,
          username: 'admin',
          password: 'password',
          rtspUrl: 'rtsp://admin:password@192.168.1.100:554/stream'
        },
        {
          id: 'cam-002',
          name: 'Backyard Camera',
          ip: '192.168.1.101',
          port: 554,
          username: 'admin',
          password: 'password',
          rtspUrl: 'rtsp://admin:password@192.168.1.101:554/stream'
        }
      ];

      // Mock the discovery function
      cameraManager.discoverCameras = jest.fn().mockResolvedValue(mockCameras);

      const cameras = await cameraManager.discoverCameras();

      expect(cameras).toHaveLength(2);
      expect(cameras[0]).toHaveProperty('id', 'cam-001');
      expect(cameras[1]).toHaveProperty('id', 'cam-002');
    });

    test('should handle discovery errors gracefully', async () => {
      cameraManager.discoverCameras = jest.fn().mockRejectedValue(new Error('Network timeout'));

      await expect(cameraManager.discoverCameras()).rejects.toThrow('Network timeout');
    });

    test('should prevent concurrent discovery', async () => {
      cameraManager.discoveryInProgress = true;

      await expect(cameraManager.discoverCameras()).rejects.toThrow('Discovery already in progress');
    });
  });

  describe('Camera Management', () => {
    const testCamera = {
      id: 'cam-001',
      name: 'Test Camera',
      ip: '192.168.1.100',
      port: 554,
      username: 'admin',
      password: 'password',
      rtspUrl: 'rtsp://admin:password@192.168.1.100:554/stream',
      status: 'online',
      streaming: {
        webrtc: true,
        hls: true,
        dash: false,
        rtsp: true
      }
    };

    beforeEach(() => {
      cameraManager.cameras.set('cam-001', testCamera);
    });

    test('should get all cameras', async () => {
      const cameras = await cameraManager.getCameras();

      expect(cameras).toHaveLength(1);
      expect(cameras[0]).toHaveProperty('id', 'cam-001');
      expect(cameras[0]).toHaveProperty('name', 'Test Camera');
    });

    test('should get specific camera by id', () => {
      const camera = cameraManager.getCamera('cam-001');

      expect(camera).toBeDefined();
      expect(camera.id).toBe('cam-001');
      expect(camera.name).toBe('Test Camera');
    });

    test('should return null for non-existent camera', () => {
      const camera = cameraManager.getCamera('non-existent');

      expect(camera).toBeNull();
    });

    test('should add new camera', () => {
      const newCamera = {
        id: 'cam-002',
        name: 'New Camera',
        ip: '192.168.1.101',
        port: 554,
        username: 'admin',
        password: 'password'
      };

      cameraManager.testAddCamera(newCamera);

      expect(cameraManager.cameras.has('cam-002')).toBe(true);
      const added = cameraManager.getCamera('cam-002');
      expect(added.name).toBe('New Camera');
    });

    test('should update existing camera', () => {
      const updates = {
        name: 'Updated Camera',
        status: 'offline'
      };

      cameraManager.testUpdateCamera('cam-001', updates);

      const updated = cameraManager.getCamera('cam-001');
      expect(updated.name).toBe('Updated Camera');
      expect(updated.status).toBe('offline');
    });

    test('should remove camera', () => {
      expect(cameraManager.cameras.has('cam-001')).toBe(true);

      cameraManager.testRemoveCamera('cam-001');

      expect(cameraManager.cameras.has('cam-001')).toBe(false);
      expect(cameraManager.getCamera('cam-001')).toBeNull();
    });
  });

  describe('Camera Status', () => {
    const testCamera = {
      id: 'cam-001',
      name: 'Test Camera',
      ip: '192.168.1.100',
      port: 554,
      username: 'admin',
      password: 'password',
      rtspUrl: 'rtsp://admin:password@192.168.1.100:554/stream',
      status: 'online'
    };

    beforeEach(() => {
      cameraManager.cameras.set('cam-001', testCamera);
    });

    test('should check camera connectivity', async () => {
      // Mock successful connectivity check
      cameraManager.checkConnectivity = jest.fn().mockResolvedValue(true);

      const isOnline = await cameraManager.checkConnectivity('cam-001');

      expect(isOnline).toBe(true);
    });

    test('should handle connectivity check failure', async () => {
      cameraManager.checkConnectivity = jest.fn().mockResolvedValue(false);

      const isOnline = await cameraManager.checkConnectivity('cam-001');

      expect(isOnline).toBe(false);
    });

    test('should update camera status', async () => {
      cameraManager.checkConnectivity = jest.fn().mockResolvedValue(false);
      cameraManager.updateCameraStatus = jest.fn();

      await cameraManager.updateCameraStatus('cam-001');

      expect(cameraManager.updateCameraStatus).toHaveBeenCalledWith('cam-001');
    });
  });

  describe('Streaming Configuration', () => {
    const testCamera = {
      id: 'cam-001',
      name: 'Test Camera',
      ip: '192.168.1.100',
      port: 554,
      username: 'admin',
      password: 'password',
      rtspUrl: 'rtsp://admin:password@192.168.1.100:554/stream',
      status: 'online',
      streaming: {
        webrtc: true,
        hls: true,
        dash: false,
        rtsp: true
      }
    };

    beforeEach(() => {
      cameraManager.cameras.set('cam-001', testCamera);
    });

    test('should get streaming endpoints', async () => {
      const endpoints = await cameraManager.getStreamingEndpoints('cam-001');

      expect(endpoints).toHaveProperty('webrtc');
      expect(endpoints).toHaveProperty('hls');
      expect(endpoints).toHaveProperty('dash');
      expect(endpoints).toHaveProperty('rtsp');
      expect(endpoints.webrtc).toBe(true);
      expect(endpoints.hls).toBe(true);
      expect(endpoints.dash).toBe(false);
      expect(endpoints.rtsp).toBe(true);
    });

    test('should return null endpoints for non-existent camera', async () => {
      const endpoints = await cameraManager.getStreamingEndpoints('non-existent');

      expect(endpoints).toBeNull();
    });

    test('should update streaming configuration', () => {
      const newConfig = {
        webrtc: false,
        hls: true,
        dash: true,
        rtsp: true
      };

      cameraManager.updateStreamingConfig('cam-001', newConfig);

      const camera = cameraManager.getCamera('cam-001');
      expect(camera.streaming.webrtc).toBe(false);
      expect(camera.streaming.dash).toBe(true);
    });
  });

  describe('Camera Validation', () => {
    test('should validate camera configuration', () => {
      const validCamera = {
        id: 'cam-001',
        name: 'Test Camera',
        hostname: '192.168.1.100',
        port: 554,
        username: 'admin',
        password: 'password'
      };

      expect(() => cameraManager.validateCameraConfig(validCamera)).not.toThrow();
    });

    test('should reject invalid camera configuration', () => {
      const invalidCamera = {
        id: '',
        name: '',
        ip: 'invalid-ip',
        port: 'not-a-number'
      };

      expect(() => cameraManager.validateCameraConfig(invalidCamera)).toThrow();
    });

    test('should validate RTSP URL format', () => {
      const validUrls = [
        'rtsp://admin:pass@192.168.1.100:554/stream',
        'rtsp://camera.local:554/live',
        'rtsp://10.0.0.1/stream'
      ];

      validUrls.forEach(url => {
        expect(cameraManager.validateRtspUrl(url)).toBe(true);
      });
    });

    test('should reject invalid RTSP URLs', () => {
      const invalidUrls = [
        'http://example.com',
        'rtsp://',
        'invalid-url',
        ''
      ];

      invalidUrls.forEach(url => {
        expect(cameraManager.validateRtspUrl(url)).toBe(false);
      });
    });
  });
});