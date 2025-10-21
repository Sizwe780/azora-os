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
        cameraFov: alertData.cameraId,
        rules: alertData.rules || []
      }
    });

    // Store alert
    this.alerts.push({
      id: event.id,
      event: event,
      timestamp: event.time,
      processed: false
    });

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

  async getAlerts(filters = {}) {
    let filteredAlerts = [...this.alerts];

    // Apply filters
    if (filters.severity) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.event.data.severity === filters.severity
      );
    }

    if (filters.cameraId) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.event.source.includes(filters.cameraId)
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

    // Sort by timestamp (newest first)
    filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return filteredAlerts;
  }

  async getAlert(id) {
    return this.alerts.find(alert => alert.id === id);
  }

  async acknowledgeAlert(id, ackData = {}) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      alert.acknowledgedBy = ackData.userId || 'system';
      alert.notes = ackData.notes || '';

      console.log(`Alert ${id} acknowledged by ${alert.acknowledgedBy}`);
    } else {
      throw new Error('Alert not found');
    }
  }

  async escalateAlert(id, escalationData = {}) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.escalated = true;
      alert.escalatedAt = new Date().toISOString();
      alert.escalationLevel = escalationData.level || 'high';
      alert.escalationNotes = escalationData.notes || '';

      // Send escalated alert to additional channels
      await this.sendEscalatedAlert(alert);

      console.log(`Alert ${id} escalated to ${alert.escalationLevel}`);
    } else {
      throw new Error('Alert not found');
    }
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
}

const alertEngine = new AlertEngine();

module.exports = alertEngine;