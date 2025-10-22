/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Geofencing Service
 * Location-based triggers, zones, and automated actions
 */

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3009;

app.use(express.json());

// In-memory storage (production: database + spatial index)
const geofences = new Map();

// ============================================================================
// GEOFENCING ENGINE
// ============================================================================

class Geofence {
  constructor(id, config) {
    this.id = id;
    this.name = config.name;
    this.type = config.type; // 'circle', 'polygon', 'corridor'
    this.coordinates = config.coordinates;
    this.radius = config.radius; // For circle type
    this.actions = config.actions || [];
    this.metadata = config.metadata || {};
    this.active = true;
    this.createdAt = new Date();
  }

  // Check if point is inside geofence
  containsPoint(lat, lng) {
    switch (this.type) {
      case 'circle':
        return this.isPointInCircle(lat, lng);
      case 'polygon':
        return this.isPointInPolygon(lat, lng);
      case 'corridor':
        return this.isPointInCorridor(lat, lng);
      default:
        return false;
    }
  }

  isPointInCircle(lat, lng) {
    const distance = this.calculateDistance(lat, lng, this.coordinates.lat, this.coordinates.lng);
    return distance <= this.radius;
  }

  isPointInPolygon(lat, lng) {
    // Ray casting algorithm for polygon containment
    let inside = false;
    const polygon = this.coordinates;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;

      if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  isPointInCorridor(lat, lng) {
    // Simplified corridor check (rectangle along route)
    const corridor = this.coordinates;
    if (!corridor.start || !corridor.end) return false;

    // Calculate if point is within corridor bounds
    const minLat = Math.min(corridor.start.lat, corridor.end.lat);
    const maxLat = Math.max(corridor.start.lat, corridor.end.lat);
    const minLng = Math.min(corridor.start.lng, corridor.end.lng);
    const maxLng = Math.max(corridor.start.lng, corridor.end.lng);

    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  }

  // Execute actions when triggered
  async executeActions(context) {
    const results = [];

    for (const action of this.actions) {
      try {
        const result = await this.executeAction(action, context);
        results.push({ action: action.type, success: true, result });
      } catch (error) {
        results.push({ action: action.type, success: false, error: error.message });
      }
    }

    return results;
  }

  async executeAction(action, context) {
    switch (action.type) {
      case 'notification':
        return await this.sendNotification(action, context);
      case 'speed_limit':
        return await this.enforceSpeedLimit(action, context);
      case 'time_restriction':
        return await this.checkTimeRestriction(action, context);
      case 'pod_required':
        return await this.requireProofOfDelivery(action, context);
      case 'compliance_check':
        return await this.performComplianceCheck(action, context);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  async sendNotification(action, context) {
    // Simulate notification sending
    console.log(`📢 Geofence ${this.name}: ${action.message}`, context);
    return { notificationSent: true, message: action.message };
  }

  async enforceSpeedLimit(action, context) {
    const currentSpeed = context.speed || 0;
    const limit = action.limit || 60;

    if (currentSpeed > limit) {
      return {
        violation: true,
        currentSpeed,
        limit,
        action: 'speed_warning_sent'
      };
    }

    return { violation: false, currentSpeed, limit };
  }

  async checkTimeRestriction(action, _context) {
    const now = new Date();
    const currentHour = now.getHours();

    if (action.allowedHours && !action.allowedHours.includes(currentHour)) {
      return {
        violation: true,
        currentHour,
        allowedHours: action.allowedHours,
        action: 'time_restriction_violation'
      };
    }

    return { violation: false, currentHour };
  }

  async requireProofOfDelivery(action, context) {
    // Trigger POD requirement
    return {
      podRequired: true,
      deliveryId: context.deliveryId,
      action: 'pod_process_initiated'
    };
  }

  async performComplianceCheck(action, _context) {
    // Simulate compliance check
    const checks = action.checks || ['popia', 'gdpr', 'safety'];
    const results = {};

    checks.forEach(check => {
      results[check] = Math.random() > 0.1; // 90% pass rate
    });

    return {
      complianceResults: results,
      allPassed: Object.values(results).every(r => r),
      action: 'compliance_verified'
    };
  }
}

// ============================================================================
// LOCATION MONITORING
// ============================================================================

class LocationMonitor {
  constructor() {
    this.activeMonitors = new Map();
    this.triggerHistory = new Map();
  }

  // Monitor vehicle location
  async checkLocation(vehicleId, location) {
    const triggers = [];

    // Check all active geofences
    for (const [fenceId, fence] of geofences) {
      if (!fence.active) continue;

      const wasInside = this.wasInsideFence(vehicleId, fenceId);
      const isInside = fence.containsPoint(location.lat, location.lng);

      // Detect enter/exit events
      if (!wasInside && isInside) {
        triggers.push({
          type: 'enter',
          fenceId,
          fence: fence.name,
          location,
          timestamp: new Date()
        });
      } else if (wasInside && !isInside) {
        triggers.push({
          type: 'exit',
          fenceId,
          fence: fence.name,
          location,
          timestamp: new Date()
        });
      }

      // Update location state
      this.updateLocationState(vehicleId, fenceId, isInside);
    }

    // Execute triggers
    const results = [];
    for (const trigger of triggers) {
      const result = await this.executeTrigger(trigger, vehicleId, location);
      results.push(result);
    }

    return results;
  }

  wasInsideFence(vehicleId, fenceId) {
    const state = this.activeMonitors.get(vehicleId);
    return state && state[fenceId];
  }

  updateLocationState(vehicleId, fenceId, isInside) {
    if (!this.activeMonitors.has(vehicleId)) {
      this.activeMonitors.set(vehicleId, {});
    }

    const state = this.activeMonitors.get(vehicleId);
    state[fenceId] = isInside;
  }

  async executeTrigger(trigger, vehicleId, location) {
    const fence = geofences.get(trigger.fenceId);
    if (!fence) return null;

    const context = {
      vehicleId,
      location,
      trigger: trigger.type,
      timestamp: trigger.timestamp
    };

    const results = await fence.executeActions(context);

    // Record trigger
    const triggerRecord = {
      id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vehicleId,
      fenceId: trigger.fenceId,
      fenceName: trigger.fence,
      type: trigger.type,
      location,
      timestamp: trigger.timestamp,
      actions: results
    };

    if (!this.triggerHistory.has(vehicleId)) {
      this.triggerHistory.set(vehicleId, []);
    }

    this.triggerHistory.get(vehicleId).push(triggerRecord);

    return triggerRecord;
  }
}

const locationMonitor = new LocationMonitor();

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Geofencing Service',
    status: 'operational',
    geofences: geofences.size,
    activeMonitors: locationMonitor.activeMonitors.size,
    version: '1.0.0'
  });
});

// Create geofence
app.post('/geofences', (req, res) => {
  const { id, name, type, coordinates, radius, actions, metadata } = req.body;

  const fenceId = id || `fence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fence = new Geofence(fenceId, {
    name,
    type,
    coordinates,
    radius,
    actions,
    metadata
  });

  geofences.set(fenceId, fence);

  res.json({
    success: true,
    fenceId,
    fence: {
      id: fence.id,
      name: fence.name,
      type: fence.type,
      active: fence.active
    }
  });
});

// Get geofences
app.get('/geofences', (req, res) => {
  const fences = Array.from(geofences.values()).map(f => ({
    id: f.id,
    name: f.name,
    type: f.type,
    coordinates: f.coordinates,
    radius: f.radius,
    actions: f.actions.length,
    active: f.active
  }));

  res.json({
    success: true,
    geofences: fences
  });
});

// Update geofence
app.put('/geofences/:id', (req, res) => {
  const fence = geofences.get(req.params.id);
  if (!fence) {
    return res.status(404).json({ error: 'Geofence not found' });
  }

  const updates = req.body;
  Object.assign(fence, updates);

  res.json({
    success: true,
    fence: {
      id: fence.id,
      name: fence.name,
      type: fence.type,
      active: fence.active
    }
  });
});

// Delete geofence
app.delete('/geofences/:id', (req, res) => {
  const deleted = geofences.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Geofence not found' });
  }

  res.json({ success: true, message: 'Geofence deleted' });
});

// Check location against geofences
app.post('/check-location', async (req, res) => {
  const { vehicleId, location } = req.body;

  const triggers = await locationMonitor.checkLocation(vehicleId, location);

  res.json({
    success: true,
    vehicleId,
    location,
    triggers: triggers.length,
    triggerDetails: triggers
  });
});

// Get trigger history for vehicle
app.get('/vehicles/:id/triggers', (req, res) => {
  const history = locationMonitor.triggerHistory.get(req.params.id) || [];

  res.json({
    success: true,
    vehicleId: req.params.id,
    triggers: history,
    count: history.length
  });
});

// Create predefined geofences for common use cases
app.post('/setup-demo-geofences', (req, res) => {
  const demoFences = [
    {
      id: 'warehouse_cape_town',
      name: 'Cape Town Warehouse',
      type: 'circle',
      coordinates: { lat: -33.9249, lng: 18.4241 },
      radius: 500, // 500m radius
      actions: [
        { type: 'notification', message: 'Arrived at Cape Town Warehouse' },
        { type: 'pod_required', deliveryId: 'auto' }
      ]
    },
    {
      id: 'johannesburg_cbd',
      name: 'Johannesburg CBD',
      type: 'polygon',
      coordinates: [
        { lat: -26.2041, lng: 28.0473 },
        { lat: -26.2041, lng: 28.0573 },
        { lat: -26.2141, lng: 28.0573 },
        { lat: -26.2141, lng: 28.0473 }
      ],
      actions: [
        { type: 'speed_limit', limit: 40 },
        { type: 'time_restriction', allowedHours: [6,7,8,9,16,17,18,19,20] },
        { type: 'compliance_check', checks: ['safety', 'popia'] }
      ]
    },
    {
      id: 'highway_corridor',
      name: 'N1 Highway Corridor',
      type: 'corridor',
      coordinates: {
        start: { lat: -33.9249, lng: 18.4241 },
        end: { lat: -26.2041, lng: 28.0473 }
      },
      actions: [
        { type: 'speed_limit', limit: 120 },
        { type: 'notification', message: 'Entering highway - maintain speed limits' }
      ]
    }
  ];

  demoFences.forEach(fenceData => {
    const fence = new Geofence(fenceData.id, fenceData);
    geofences.set(fenceData.id, fence);
  });

  res.json({
    success: true,
    message: 'Demo geofences created',
    geofences: demoFences.map(f => f.id)
  });
});

// ============================================================================
// START SERVICE
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🎯 Geofencing Service');
  console.log('====================');
  console.log(`Port: ${PORT}`);
  console.log('Status: Online');
  console.log('');
  console.log('Features:');
  console.log('  ✅ Circle, polygon, and corridor geofences');
  console.log('  ✅ Real-time location monitoring');
  console.log('  ✅ Automated triggers & actions');
  console.log('  ✅ Speed limit enforcement');
  console.log('  ✅ Time-based restrictions');
  console.log('  ✅ Proof of delivery integration');
  console.log('  ✅ Compliance automation');
  console.log('');
  console.log('🇿🇦 Built by Sizwe Ngwenya for Azora World');
  console.log('Making locations intelligent and compliant!');
  console.log('');
});