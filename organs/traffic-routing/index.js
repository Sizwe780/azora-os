/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Traffic & Smart Routing Service
 * 
 * Real-time traffic detection, best route optimization,
 * accident prevention, and risk monitoring.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * Email: sizwe.ngwenya@azora.world
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 4088;

// ============================================================================
// DATA STORES
// ============================================================================

const routes = new Map(); // routeId -> route data
const trafficData = new Map(); // locationId -> traffic conditions
const accidents = new Map(); // accidentId -> accident report
const riskAlerts = new Map(); // alertId -> risk alert
const activeTrips = new Map(); // tripId -> trip tracking

// ============================================================================
// TRAFFIC DETECTION
// ============================================================================

function detectTrafficConditions(location) {
  // Simulate real-time traffic data (would integrate with real APIs in production)
  const conditions = {
    location,
    timestamp: new Date().toISOString(),
    
    congestion: {
      level: Math.random() > 0.7 ? 'heavy' : Math.random() > 0.4 ? 'moderate' : 'light',
      speed: Math.floor(Math.random() * 80) + 20, // km/h
      delay: Math.floor(Math.random() * 30) // minutes
    },
    
    incidents: {
      accidents: Math.random() > 0.9,
      roadwork: Math.random() > 0.8,
      weather: Math.random() > 0.7 ? 'clear' : Math.random() > 0.5 ? 'rain' : 'heavy_rain'
    },
    
    prediction: {
      nextHour: Math.random() > 0.5 ? 'improving' : 'worsening',
      confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
    }
  };
  
  trafficData.set(location.lat + ',' + location.lng, conditions);
  
  return conditions;
}

function getTrafficAlerts(route) {
  const alerts = [];
  
  // Check each point along the route
  route.waypoints.forEach((point, index) => {
    const traffic = detectTrafficConditions(point);
    
    if (traffic.congestion.level === 'heavy') {
      alerts.push({
        type: 'heavy_traffic',
        severity: 'high',
        location: point,
        message: `Heavy traffic ahead: ${traffic.congestion.delay} min delay`,
        alternateRoute: true
      });
    }
    
    if (traffic.incidents.accidents) {
      alerts.push({
        type: 'accident',
        severity: 'critical',
        location: point,
        message: 'Accident reported on route',
        alternateRoute: true
      });
    }
    
    if (traffic.incidents.weather === 'heavy_rain') {
      alerts.push({
        type: 'weather',
        severity: 'high',
        location: point,
        message: 'Heavy rain - reduce speed, increase following distance',
        alternateRoute: false
      });
    }
  });
  
  return alerts;
}

// ============================================================================
// SMART ROUTING
// ============================================================================

function calculateOptimalRoute(start, end, preferences = {}) {
  const routeId = `ROUTE-${Date.now()}`;
  
  // Generate multiple route options
  const routes = [
    generateRoute(start, end, 'fastest', preferences),
    generateRoute(start, end, 'shortest', preferences),
    generateRoute(start, end, 'economical', preferences)
  ];
  
  // Score each route
  routes.forEach(route => {
    route.score = scoreRoute(route, preferences);
  });
  
  // Sort by score (highest first)
  routes.sort((a, b) => b.score - a.score);
  
  const optimalRoute = {
    id: routeId,
    start,
    end,
    recommended: routes[0],
    alternatives: routes.slice(1),
    calculatedAt: new Date().toISOString()
  };
  
  return optimalRoute;
}

function generateRoute(start, end, type, preferences) {
  // Simplified route generation (would use real mapping API in production)
  const distance = calculateDistance(start, end);
  const baseSpeed = type === 'fastest' ? 80 : type === 'shortest' ? 60 : 70;
  
  const route = {
    type,
    distance: distance,
    duration: Math.floor((distance / baseSpeed) * 60), // minutes
    
    waypoints: [
      start,
      { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 },
      end
    ],
    
    tolls: {
      count: type === 'shortest' ? 0 : Math.floor(Math.random() * 3),
      cost: type === 'shortest' ? 0 : Math.floor(Math.random() * 200) + 50
    },
    
    fuelConsumption: {
      liters: distance / (type === 'economical' ? 12 : 10),
      cost: (distance / (type === 'economical' ? 12 : 10)) * 22 // R22 per liter
    },
    
    roadConditions: {
      paved: type === 'shortest' ? 70 : 95, // percentage
      gravel: type === 'shortest' ? 30 : 5
    },
    
    safety: {
      rating: type === 'fastest' ? 85 : type === 'shortest' ? 70 : 80,
      riskFactors: []
    }
  };
  
  // Check traffic conditions
  const trafficAlerts = getTrafficAlerts(route);
  if (trafficAlerts.length > 0) {
    route.trafficAlerts = trafficAlerts;
    route.duration += trafficAlerts.reduce((sum, alert) => 
      sum + (alert.type === 'heavy_traffic' ? 15 : 0), 0);
  }
  
  return route;
}

function scoreRoute(route, preferences) {
  let score = 100;
  
  // Time efficiency (40% weight)
  const avgDuration = 300; // minutes
  score += ((avgDuration - route.duration) / avgDuration) * 40;
  
  // Cost efficiency (30% weight)
  const totalCost = route.tolls.cost + route.fuelConsumption.cost;
  const avgCost = 500; // R500
  score += ((avgCost - totalCost) / avgCost) * 30;
  
  // Safety (20% weight)
  score += (route.safety.rating / 100) * 20;
  
  // Road conditions (10% weight)
  score += (route.roadConditions.paved / 100) * 10;
  
  // Penalties
  if (route.trafficAlerts && route.trafficAlerts.length > 0) {
    score -= route.trafficAlerts.length * 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateDistance(start, end) {
  // Haversine formula for distance
  const R = 6371; // Earth's radius in km
  const dLat = (end.lat - start.lat) * Math.PI / 180;
  const dLng = (end.lng - start.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return Math.floor(R * c);
}

// ============================================================================
// ACCIDENT PREVENTION
// ============================================================================

function monitorRiskyBehavior(tripId, telemetryData) {
  const risks = [];
  
  // Speed risk
  if (telemetryData.speed > telemetryData.speedLimit + 20) {
    risks.push({
      type: 'excessive_speed',
      severity: 'critical',
      message: `Speed ${telemetryData.speed} km/h exceeds limit by ${telemetryData.speed - telemetryData.speedLimit} km/h`,
      action: 'Reduce speed immediately'
    });
  } else if (telemetryData.speed > telemetryData.speedLimit + 10) {
    risks.push({
      type: 'speeding',
      severity: 'high',
      message: `Speed ${telemetryData.speed} km/h exceeds limit`,
      action: 'Reduce speed'
    });
  }
  
  // Following distance risk
  if (telemetryData.followingDistance < 2) {
    risks.push({
      type: 'tailgating',
      severity: 'high',
      message: `Following distance too close: ${telemetryData.followingDistance}s`,
      action: 'Increase following distance to at least 3 seconds'
    });
  }
  
  // Fatigue risk
  if (telemetryData.drivingDuration > 4.5 * 60) { // 4.5 hours in minutes
    risks.push({
      type: 'fatigue',
      severity: 'critical',
      message: 'Driver approaching maximum continuous driving time',
      action: 'Plan for mandatory break in next 30 minutes'
    });
  }
  
  // Weather risk
  if (telemetryData.weather === 'heavy_rain' && telemetryData.speed > 80) {
    risks.push({
      type: 'weather_risk',
      severity: 'high',
      message: 'Speed too high for weather conditions',
      action: 'Reduce speed to maximum 80 km/h in heavy rain'
    });
  }
  
  // Lane departure
  if (telemetryData.laneDepartures > 3) {
    risks.push({
      type: 'lane_departure',
      severity: 'high',
      message: 'Multiple lane departures detected - possible fatigue',
      action: 'Take immediate rest break'
    });
  }
  
  // Store risk alerts
  risks.forEach(risk => {
    const alertId = `ALERT-${Date.now()}-${Math.random()}`;
    riskAlerts.set(alertId, {
      id: alertId,
      tripId,
      timestamp: new Date().toISOString(),
      ...risk
    });
  });
  
  return risks;
}

function predictAccidentRisk(tripId, telemetryData, driverHistory) {
  const riskFactors = [];
  let riskScore = 0;
  
  // Driver behavior history
  if (driverHistory.safetyScore < 70) {
    riskFactors.push('Poor driver safety history');
    riskScore += 20;
  }
  
  // Current conditions
  if (telemetryData.speed > 120) {
    riskFactors.push('High speed');
    riskScore += 15;
  }
  
  if (telemetryData.weather !== 'clear') {
    riskFactors.push('Adverse weather conditions');
    riskScore += 10;
  }
  
  if (telemetryData.timeOfDay === 'night') {
    riskFactors.push('Night driving');
    riskScore += 10;
  }
  
  if (telemetryData.drivingDuration > 4 * 60) {
    riskFactors.push('Extended driving duration');
    riskScore += 15;
  }
  
  const prediction = {
    tripId,
    riskScore,
    riskLevel: riskScore > 50 ? 'critical' : riskScore > 30 ? 'high' : riskScore > 15 ? 'medium' : 'low',
    riskFactors,
    recommendation: riskScore > 50 ? 'STOP AND REST IMMEDIATELY' : 
                    riskScore > 30 ? 'Plan rest break within next hour' : 
                    'Continue with caution',
    timestamp: new Date().toISOString()
  };
  
  return prediction;
}

// ============================================================================
// REAL-TIME TRIP MONITORING
// ============================================================================

function startTripMonitoring(tripData) {
  const tripId = `TRIP-${Date.now()}`;
  
  const trip = {
    id: tripId,
    driverId: tripData.driverId,
    vehicleId: tripData.vehicleId,
    
    route: tripData.route,
    currentLocation: tripData.route.start,
    
    startedAt: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + tripData.route.recommended.duration * 60 * 1000).toISOString(),
    
    status: 'in_progress',
    
    monitoring: {
      lastUpdate: new Date().toISOString(),
      speed: 0,
      risks: [],
      alerts: []
    }
  };
  
  activeTrips.set(tripId, trip);
  
  return trip;
}

function updateTripTelemetry(tripId, telemetryData) {
  const trip = activeTrips.get(tripId);
  if (!trip) return { error: 'Trip not found' };
  
  // Update location
  trip.currentLocation = telemetryData.location;
  
  // Monitor risks
  const risks = monitorRiskyBehavior(tripId, telemetryData);
  trip.monitoring.risks = risks;
  
  // Update status
  trip.monitoring.lastUpdate = new Date().toISOString();
  trip.monitoring.speed = telemetryData.speed;
  
  // Check if rerouting needed
  if (risks.some(r => r.severity === 'critical')) {
    const newRoute = calculateOptimalRoute(
      telemetryData.location,
      trip.route.end,
      { avoidHazards: true }
    );
    
    trip.monitoring.alerts.push({
      type: 'reroute_suggested',
      message: 'Alternative route recommended due to safety concerns',
      newRoute: newRoute.recommended
    });
  }
  
  activeTrips.set(tripId, trip);
  
  return trip;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Traffic & Smart Routing Service',
    status: 'operational',
    activeTrips: activeTrips.size,
    riskAlerts: riskAlerts.size
  });
});

// Calculate optimal route
app.post('/api/routing/calculate', (req, res) => {
  const { start, end, preferences } = req.body;
  
  const route = calculateOptimalRoute(start, end, preferences);
  
  res.json({
    success: true,
    route
  });
});

// Get traffic conditions
app.post('/api/traffic/detect', (req, res) => {
  const { location } = req.body;
  
  const conditions = detectTrafficConditions(location);
  
  res.json(conditions);
});

// Start trip monitoring
app.post('/api/trips/start', (req, res) => {
  const trip = startTripMonitoring(req.body);
  
  res.json({
    success: true,
    trip
  });
});

// Update trip telemetry
app.post('/api/trips/:tripId/telemetry', (req, res) => {
  const { tripId } = req.params;
  const telemetryData = req.body;
  
  const trip = updateTripTelemetry(tripId, telemetryData);
  
  if (trip.error) {
    return res.status(404).json(trip);
  }
  
  res.json({
    success: true,
    trip
  });
});

// Monitor risky behavior
app.post('/api/safety/monitor', (req, res) => {
  const { tripId, telemetryData } = req.body;
  
  const risks = monitorRiskyBehavior(tripId, telemetryData);
  
  res.json({
    risks,
    count: risks.length
  });
});

// Predict accident risk
app.post('/api/safety/predict', (req, res) => {
  const { tripId, telemetryData, driverHistory } = req.body;
  
  const prediction = predictAccidentRisk(tripId, telemetryData, driverHistory);
  
  res.json(prediction);
});

// Get active trip
app.get('/api/trips/:tripId', (req, res) => {
  const { tripId } = req.params;
  const trip = activeTrips.get(tripId);
  
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  
  res.json(trip);
});

// Get risk alerts for trip
app.get('/api/trips/:tripId/alerts', (req, res) => {
  const { tripId } = req.params;
  
  const alerts = Array.from(riskAlerts.values()).filter(alert => alert.tripId === tripId);
  
  res.json({
    alerts,
    count: alerts.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Traffic & Smart Routing Service running on port ${PORT}`);
  console.log(`🚦 Traffic Detection: ACTIVE`);
  console.log(`🗺️ Smart Routing: ACTIVE`);
  console.log(`⚠️ Risk Monitoring: ACTIVE`);
  console.log(`🛡️ Accident Prevention: ACTIVE`);
});

module.exports = app;
