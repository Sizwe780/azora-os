/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file vigil-service.test.js
 * @module organs/vigil-service/test
 * @description Unit tests for Vigil service components
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies jest
 * @integrates_with
 *   - src/cameraManager.js
 *   - src/alertEngine.js
 *   - src/streamProcessor.js
 * @api_endpoints N/A
 * @state_management N/A
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['jest'],
  exports: [],
  consumed_by: [],
  dependencies: ['cameraManager', 'alertEngine', 'streamProcessor'],
  api_calls: [],
  state_shared: false,
  environment_vars: []
}

const cameraManager = require('../src/cameraManager');
const alertEngine = require('../src/alertEngine');
const streamProcessor = require('../src/streamProcessor');

describe('Vigil Service', () => {
  beforeAll(async () => {
    // Initialize components for testing
    await cameraManager.initialize();
    await alertEngine.initialize();
    await streamProcessor.initialize();
  });

  describe('Camera Manager', () => {
    test('should initialize without errors', () => {
      expect(cameraManager).toBeDefined();
    });

    test('should return empty camera list when no cameras configured', async () => {
      const cameras = await cameraManager.getCameras();
      expect(Array.isArray(cameras)).toBe(true);
    });
  });

  describe('Alert Engine', () => {
    test('should initialize without errors', () => {
      expect(alertEngine).toBeDefined();
    });

    test('should generate alert with CloudEvent structure', async () => {
      const alertData = {
        type: 'test.intrusion',
        cameraId: 'test-camera',
        site: 'test-site',
        confidence: 0.95
      };

      const event = await alertEngine.generateAlert(alertData);

      expect(event).toBeDefined();
      expect(event.specversion).toBe('1.0');
      expect(event.type).toContain('vigil.azora.alert');
      expect(event.data.confidence).toBe(0.95);
    });

    test('should retrieve alerts', async () => {
      const alerts = await alertEngine.getAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe('Stream Processor', () => {
    test('should initialize without errors', () => {
      expect(streamProcessor).toBeDefined();
    });

    test('should return empty active streams list', () => {
      const streams = streamProcessor.getActiveStreams();
      expect(Array.isArray(streams)).toBe(true);
    });

    test('should fail to start stream for non-existent camera', async () => {
      await expect(streamProcessor.startStream('non-existent-camera'))
        .rejects
        .toThrow('Camera non-existent-camera not found');
    });
  });
});