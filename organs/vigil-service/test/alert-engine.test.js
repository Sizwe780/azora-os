/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file alert-engine.test.js
 * @module organs/vigil-service/test
 * @description Unit tests for alert engine functionality
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies jest
 * @integrates_with
 *   - Alert processing
 *   - Event handling
 *   - Notification system
 * @api_endpoints N/A
 * @state_management Alert states
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

const alertEngine = require('../src/alertEngine');

describe('Alert Engine', () => {
  beforeEach(() => {
    // Reset alert engine state
    alertEngine.alerts = [];
  });

  describe('Alert Creation', () => {
    test('should create new alert', async () => {
      const alertData = {
        event: {
          type: 'vigil.azora.alert.motion',
          data: {
            cameraId: 'cam-001',
            severity: 'medium',
            confidence: 0.85
          }
        },
        source: 'camera-manager'
      };

      const alert = await alertEngine.createAlert(alertData);

      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('event');
      expect(alert).toHaveProperty('timestamp');
      expect(alert).toHaveProperty('acknowledged', false);
      expect(alert).toHaveProperty('escalated', false);
      expect(alert.event.type).toBe('vigil.azora.alert.motion');
      expect(alert.event.data.cameraId).toBe('cam-001');
    });

    test('should generate unique alert IDs', async () => {
      const alert1 = await alertEngine.createAlert({
        event: { type: 'vigil.azora.alert.motion', data: {} }
      });
      const alert2 = await alertEngine.createAlert({
        event: { type: 'vigil.azora.alert.motion', data: {} }
      });

      expect(alert1.id).not.toBe(alert2.id);
    });

    test('should validate alert data', async () => {
      await expect(alertEngine.createAlert({
        event: { type: '', data: {} }
      })).rejects.toThrow('Invalid alert event type');

      await expect(alertEngine.createAlert({
        event: { type: 'vigil.azora.alert.motion', data: null }
      })).rejects.toThrow('Alert event data is required');
    });
  });

  describe('Alert Management', () => {
    let testAlert;

    beforeEach(async () => {
      testAlert = await alertEngine.createAlert({
        event: {
          type: 'vigil.azora.alert.motion',
          data: {
            cameraId: 'cam-001',
            severity: 'medium',
            confidence: 0.85
          }
        }
      });
    });

    test('should get all alerts', async () => {
      const alerts = await alertEngine.getAlerts();

      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe(testAlert.id);
    });

    test('should get specific alert by id', async () => {
      const alert = await alertEngine.getAlert(testAlert.id);

      expect(alert).toBeDefined();
      expect(alert.id).toBe(testAlert.id);
      expect(alert.event.type).toBe('vigil.azora.alert.motion');
    });

    test('should return null for non-existent alert', async () => {
      const alert = await alertEngine.getAlert('non-existent');

      expect(alert).toBeNull();
    });

    test('should acknowledge alert', async () => {
      const result = await alertEngine.acknowledgeAlert(testAlert.id, 'user-001', 'False alarm');

      expect(result).toBe(true);
      const updated = await alertEngine.getAlert(testAlert.id);
      expect(updated.acknowledged).toBe(true);
      expect(updated.acknowledgedBy).toBe('user-001');
      expect(updated.acknowledgedAt).toBeDefined();
      expect(updated.notes).toBe('False alarm');
    });

    test('should not acknowledge non-existent alert', async () => {
      const result = await alertEngine.acknowledgeAlert('non-existent', 'user-001');

      expect(result).toBe(false);
    });

    test('should escalate alert', async () => {
      const result = await alertEngine.escalateAlert(testAlert.id, 'high', 'Escalated due to severity');

      expect(result).toBe(true);
      const updated = await alertEngine.getAlert(testAlert.id);
      expect(updated.escalated).toBe(true);
      expect(updated.escalationLevel).toBe('high');
      expect(updated.escalatedAt).toBeDefined();
      expect(updated.escalationNotes).toBe('Escalated due to severity');
    });

    test('should not escalate non-existent alert', async () => {
      const result = await alertEngine.escalateAlert('non-existent', 'high');

      expect(result).toBe(false);
    });

    test('should resolve alert', async () => {
      const result = await alertEngine.resolveAlert(testAlert.id, 'user-001', 'Issue resolved');

      expect(result).toBe(true);
      const updated = await alertEngine.getAlert(testAlert.id);
      expect(updated.resolved).toBe(true);
      expect(updated.resolvedBy).toBe('user-001');
      expect(updated.resolvedAt).toBeDefined();
      expect(updated.resolutionNotes).toBe('Issue resolved');
    });

    test('should not resolve non-existent alert', async () => {
      const result = await alertEngine.resolveAlert('non-existent', 'user-001');

      expect(result).toBe(false);
    });
  });

  describe('Alert Filtering', () => {
    beforeEach(async () => {
      // Clear existing alerts
      alertEngine.alerts = [];
      
      // Create multiple test alerts
      await alertEngine.createAlert({
        event: {
          type: 'vigil.azora.alert.motion',
          data: { cameraId: 'cam-001', severity: 'medium' }
        }
      });

      await alertEngine.createAlert({
        event: {
          type: 'vigil.azora.alert.intrusion',
          data: { cameraId: 'cam-002', severity: 'high' }
        }
      });

      await alertEngine.createAlert({
        event: {
          type: 'vigil.azora.alert.motion',
          data: { cameraId: 'cam-001', severity: 'low' }
        }
      });
    });

    test('should filter alerts by type', async () => {
      const motionAlerts = await alertEngine.getAlerts({ type: 'vigil.azora.alert.motion' });

      expect(motionAlerts).toHaveLength(2);
      motionAlerts.forEach(alert => {
        expect(alert.event.type).toBe('vigil.azora.alert.motion');
      });
    });

    test('should filter alerts by camera', async () => {
      const cam1Alerts = await alertEngine.getAlerts({ cameraId: 'cam-001' });

      expect(cam1Alerts).toHaveLength(2);
      cam1Alerts.forEach(alert => {
        expect(alert.event.data.cameraId).toBe('cam-001');
      });
    });

    test('should filter alerts by severity', async () => {
      const highAlerts = await alertEngine.getAlerts({ severity: 'high' });

      expect(highAlerts).toHaveLength(1);
      expect(highAlerts[0].event.data.severity).toBe('high');
    });

    test('should filter alerts by acknowledged status', async () => {
      // Acknowledge one alert
      const alerts = await alertEngine.getAlerts();
      await alertEngine.acknowledgeAlert(alerts[0].id, 'user-001');

      const acknowledged = await alertEngine.getAlerts({ acknowledged: true });
      const unacknowledged = await alertEngine.getAlerts({ acknowledged: false });

      expect(acknowledged).toHaveLength(1);
      expect(unacknowledged).toHaveLength(2);
    });

    test('should filter alerts by time range', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const recentAlerts = await alertEngine.getAlerts({
        startTime: oneHourAgo,
        endTime: now
      });

      expect(recentAlerts).toHaveLength(3);

      const oldAlerts = await alertEngine.getAlerts({
        startTime: twoHoursAgo,
        endTime: oneHourAgo
      });

      expect(oldAlerts).toHaveLength(0);
    });

    test('should combine multiple filters', async () => {
      const filtered = await alertEngine.getAlerts({
        type: 'vigil.azora.alert.motion',
        severity: 'medium',
        acknowledged: false
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].event.type).toBe('vigil.azora.alert.motion');
      expect(filtered[0].event.data.severity).toBe('medium');
      expect(filtered[0].acknowledged).toBe(false);
    });
  });

  describe('Alert Statistics', () => {
    beforeEach(async () => {
      // Clear existing alerts
      alertEngine.alerts = [];
      
      // Create test alerts with different states
      const alert1 = await alertEngine.createAlert({
        event: { type: 'vigil.azora.alert.motion', data: { severity: 'medium' } }
      });
      const alert2 = await alertEngine.createAlert({
        event: { type: 'vigil.azora.alert.intrusion', data: { severity: 'high' } }
      });
      const alert3 = await alertEngine.createAlert({
        event: { type: 'vigil.azora.alert.motion', data: { severity: 'low' } }
      });

      await alertEngine.acknowledgeAlert(alert1.id, 'user-001');
      await alertEngine.escalateAlert(alert2.id, 'high');
      await alertEngine.resolveAlert(alert3.id, 'user-002');
    });

    test('should calculate alert statistics', async () => {
      const stats = await alertEngine.getAlertStatistics();

      expect(stats).toHaveProperty('total', 3);
      expect(stats).toHaveProperty('acknowledged', 1);
      expect(stats).toHaveProperty('escalated', 1);
      expect(stats).toHaveProperty('resolved', 1);
      expect(stats).toHaveProperty('bySeverity');
      expect(stats.bySeverity.medium).toBe(1);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.low).toBe(1);
    });

    test('should get recent alerts', async () => {
      const recent = await alertEngine.getRecentAlerts(2);

      expect(recent).toHaveLength(2);
      // Should be ordered by timestamp (most recent first)
      expect(new Date(recent[0].timestamp).getTime()).toBeGreaterThanOrEqual(new Date(recent[1].timestamp).getTime());
    });

    test('should get alerts by time period', async () => {
      const lastHour = await alertEngine.getAlertsByTimePeriod('hour');
      const lastDay = await alertEngine.getAlertsByTimePeriod('day');

      expect(lastHour).toBeGreaterThanOrEqual(0);
      expect(lastDay).toBeGreaterThanOrEqual(lastHour);
    });
  });

  describe('Alert Notifications', () => {
    let testAlert;

    beforeEach(async () => {
      // Clear existing alerts
      alertEngine.alerts = [];
      
      testAlert = await alertEngine.createAlert({
        event: {
          type: 'vigil.azora.alert.motion',
          data: { cameraId: 'cam-001', severity: 'high' }
        }
      });
    });

    test('should send alert notification', async () => {
      const mockNotifier = jest.fn();
      alertEngine.setNotifier(mockNotifier);

      await alertEngine.notifyAlert(testAlert);

      expect(mockNotifier).toHaveBeenCalledWith(testAlert);
    });

    test('should send escalation notification', async () => {
      const result = await alertEngine.escalateAlert(testAlert.id, 'critical');

      expect(result).toBe(true);
      const updated = await alertEngine.getAlert(testAlert.id);
      expect(updated.escalated).toBe(true);
      expect(updated.escalationLevel).toBe('critical');
    });

    test('should handle notification failures gracefully', async () => {
      const mockNotifier = jest.fn().mockRejectedValue(new Error('Notification failed'));
      alertEngine.setNotifier(mockNotifier);

      expect(async () => await alertEngine.notifyAlert(testAlert)).not.toThrow();
    });
  });
});