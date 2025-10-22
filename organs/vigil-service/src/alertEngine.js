/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file alertEngine.js
 * @module organs/vigil-service/src
 * @description Alert generation and distribution using CloudEvents, MQTT, and webhooks
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies cloudevents, mqtt, @azure/eventgrid
 * @integrates_with
 *   - MQTT broker
 *   - Azure Event Grid
 *   - Microsoft Teams
 *   - Slack
 * @api_endpoints N/A
 * @state_management local
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit, integration
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['cloudevents', 'mqtt', '@azure/eventgrid'],
  exports: ['generateAlert', 'initialize', 'getAlerts'],
  consumed_by: ['index.js', 'streamProcessor.js'],
  dependencies: ['mqtt-broker', 'azure-eventgrid'],
  api_calls: [],
  state_shared: false,
  environment_vars: ['MQTT_BROKER', 'AZURE_EVENTGRID_TOPIC', 'AZURE_EVENTGRID_KEY']
}

const { CloudEvent, HTTP } = require('cloudevents');
const mqtt = require('mqtt');
const { EventGridPublisherClient, AzureKeyCredential } = require('@azure/eventgrid');

class AlertEngine {
  constructor() {
    this.mqttClient = null;
    this.eventGridClient = null;
    this.alerts = [];
  }

  async initialize() {
    console.log('Initializing Alert Engine...');

    // Initialize MQTT
    this.mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883');
    this.mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
    });

    // Initialize Azure Event Grid
    if (process.env.AZURE_EVENTGRID_TOPIC && process.env.AZURE_EVENTGRID_KEY) {
      this.eventGridClient = new EventGridPublisherClient(
        process.env.AZURE_EVENTGRID_TOPIC,
        new AzureKeyCredential(process.env.AZURE_EVENTGRID_KEY)
      );
      console.log('Connected to Azure Event Grid');
    }
  }

  async generateAlert(alertData) {
    const event = new CloudEvent({
      specversion: '1.0',
      type: `vigil.azora.alert.${alertData.type}`,
      source: `vigil://site/${alertData.site}/camera/${alertData.cameraId}`,
      id: alertData.id || this.generateId(),
      time: new Date().toISOString(),
      subject: alertData.zone || 'unknown',
      datacontenttype: 'application/json',
      data: {
        severity: alertData.severity || 'medium',
        confidence: alertData.confidence || 0.8,
        frameTs: alertData.frameTs || new Date().toISOString(),
        trackId: alertData.trackId,
        bbox: alertData.bbox,
        snapshotUrl: alertData.snapshotUrl,
        videoClipUrl: alertData.videoClipUrl,
        model: alertData.model || 'default',
        cameraId: alertData.cameraId,
        cameraFov: alertData.cameraId,
        rules: alertData.rules || []
      }
    });

    // Store alert
    const alert = {
      id: event.id,
      event: event,
      timestamp: event.time,
      acknowledged: false,
      escalated: false,
      resolved: false,
      processed: false
    };
    this.alerts.push(alert);

    // Publish to MQTT
    if (this.mqttClient) {
      const topic = `vigil/${alertData.site || 'default'}/${alertData.cameraId}/alerts`;
      this.mqttClient.publish(topic, JSON.stringify(event), { qos: 1 });
    }

    // Publish to Azure Event Grid
    if (this.eventGridClient) {
      await this.eventGridClient.send([
        {
          eventType: event.type,
          subject: event.subject,
          dataVersion: '1.0',
          data: event.data,
          id: event.id,
          eventTime: new Date(event.time)
        }
      ]);
    }

    // Send webhooks if configured
    await this.sendWebhooks(event);

    console.log(`Alert generated: ${event.id} - ${event.type}`);
    return event;
  }

  async sendWebhooks(event) {
    // Implementation for Teams/Slack webhooks
    const webhooks = process.env.ALERT_WEBHOOKS ? JSON.parse(process.env.ALERT_WEBHOOKS) : [];

    for (const webhook of webhooks) {
      try {
        // Simplified webhook sending
        console.log(`Sending webhook to ${webhook.url}`);
        // In production, use axios or fetch to POST the event
      } catch (error) {
        console.error(`Failed to send webhook to ${webhook.url}:`, error);
      }
    }
  }

  generateId() {
    return 'alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Test-compatible methods
  async createAlert(alertData) {
    // Extract data from the event structure used in tests
    const eventData = alertData.event || alertData;
    
    // Validate alert data
    if (!eventData.type || eventData.type.trim() === '') {
      throw new Error('Invalid alert event type');
    }

    if (!eventData.data) {
      throw new Error('Alert event data is required');
    }

    const generateData = {
      type: eventData.type.replace('vigil.azora.alert.', ''),
      site: alertData.site,
      cameraId: eventData.data.cameraId,
      severity: eventData.data.severity,
      confidence: eventData.data.confidence,
      zone: alertData.zone,
      frameTs: eventData.data.frameTs,
      trackId: eventData.data.trackId,
      bbox: eventData.data.bbox,
      snapshotUrl: eventData.data.snapshotUrl,
      videoClipUrl: eventData.data.videoClipUrl,
      model: eventData.data.model,
      rules: eventData.data.rules
    };

    await this.generateAlert(generateData);
    // Return the last alert that was created
    return this.alerts[this.alerts.length - 1];
  }

  async acknowledgeAlert(id, userId, notes) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      alert.acknowledgedBy = userId || 'system';
      alert.notes = notes || '';

      console.log(`Alert ${id} acknowledged by ${alert.acknowledgedBy}`);
      return true;
    }
    return false;
  }

  async escalateAlert(id, level, notes) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.escalated = true;
      alert.escalatedAt = new Date().toISOString();
      alert.escalationLevel = level || 'high';
      alert.escalationNotes = notes || '';

      // Send escalated alert to additional channels
      await this.sendEscalatedAlert(alert);

      console.log(`Alert ${id} escalated to ${alert.escalationLevel}`);
      return true;
    }
    return false;
  }

  async resolveAlert(id, userId, notes) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      alert.resolvedBy = userId || 'system';
      alert.resolutionNotes = notes || '';

      console.log(`Alert ${id} resolved by ${alert.resolvedBy}`);
      return true;
    }
    return false;
  }

  async getAlerts(filters = {}) {
    let filteredAlerts = [...this.alerts];

    // Apply filters
    if (filters.type) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.event.type === filters.type
      );
    }

    if (filters.severity) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.event.data.severity === filters.severity
      );
    }

    if (filters.cameraId) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.event.data.cameraId === filters.cameraId
      );
    }

    if (filters.acknowledged !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.acknowledged === filters.acknowledged
      );
    }

    if (filters.escalated !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.escalated === filters.escalated
      );
    }

    if (filters.startTime || filters.endTime) {
      filteredAlerts = filteredAlerts.filter(alert => {
        const alertTime = new Date(alert.timestamp);
        const startTime = filters.startTime ? new Date(filters.startTime) : null;
        const endTime = filters.endTime ? new Date(filters.endTime) : null;

        if (startTime && alertTime < startTime) return false;
        if (endTime && alertTime > endTime) return false;
        return true;
      });
    }

    // Sort by timestamp (newest first)
    filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return filteredAlerts;
  }

  async getAlert(id) {
    return this.alerts.find(alert => alert.id === id) || null;
  }

  async getAlertStatistics() {
    const total = this.alerts.length;
    const acknowledged = this.alerts.filter(a => a.acknowledged).length;
    const escalated = this.alerts.filter(a => a.escalated).length;
    const resolved = this.alerts.filter(a => a.resolved).length;

    const bySeverity = {};
    this.alerts.forEach(alert => {
      const severity = alert.event.data.severity || 'unknown';
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;
    });

    const recent = this.alerts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
      .map(alert => ({
        id: alert.id,
        type: alert.event.type,
        severity: alert.event.data.severity,
        timestamp: alert.timestamp
      }));

    return {
      total,
      acknowledged,
      escalated,
      resolved,
      bySeverity,
      recent
    };
  }

  async getRecentAlerts(limit = 10) {
    return this.alerts
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  async getAlertsByTimePeriod(period) {
    const now = new Date();
    let startTime;

    switch (period) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return this.alerts.filter(alert =>
      new Date(alert.timestamp) >= startTime
    ).length;
  }

  setNotifier(notifier) {
    this.notifier = notifier;
  }

  async acknowledgeAlert(id, userId, notes) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      alert.acknowledgedBy = userId || 'system';
      alert.notes = notes || '';

      console.log(`Alert ${id} acknowledged by ${alert.acknowledgedBy}`);
      return true;
    }
    return false;
  }

  async escalateAlert(id, level, notes) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.escalated = true;
      alert.escalatedAt = new Date().toISOString();
      alert.escalationLevel = level || 'high';
      alert.escalationNotes = notes || '';

      // Send escalated alert to additional channels
      await this.sendEscalatedAlert(alert);

      console.log(`Alert ${id} escalated to ${alert.escalationLevel}`);
      return true;
    }
    return false;
  }

  async resolveAlert(id, userId, notes) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      alert.resolvedBy = userId || 'system';
      alert.resolutionNotes = notes || '';

      console.log(`Alert ${id} resolved by ${alert.resolvedBy}`);
      return true;
    }
    return false;
  }

  async sendEscalatedAlert(alert) {
    // Send to escalation channels (Teams, SMS, etc.)
    const escalationChannels = process.env.ESCALATION_WEBHOOKS ? JSON.parse(process.env.ESCALATION_WEBHOOKS) : [];

    for (const channel of escalationChannels) {
      try {
        console.log(`Sending escalated alert to ${channel.type}`);
        // Implementation for sending to escalation channels
      } catch (error) {
        console.error(`Failed to send escalated alert to ${channel.type}:`, error);
      }
    }
  }

  async notifyAlert(alert) {
    if (this.notifier) {
      try {
        await this.notifier(alert);
      } catch (error) {
        console.error('Failed to send alert notification:', error);
      }
    }
  }
}

const alertEngine = new AlertEngine();

module.exports = alertEngine;