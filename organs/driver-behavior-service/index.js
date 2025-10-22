/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Driver Behavior Service
 * 
 * Real-time driver scoring, gamification, and automated coaching.
 * Reduces insurance costs and incidents.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * Email: sizwe.ngwenya@azora.world
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 4083;

// ============================================================================
// DATA STORES
// ============================================================================

const drivers = new Map(); // driverId -> driver behavior data
const trips = new Map(); // tripId -> trip behavior data
const events = new Map(); // eventId -> behavior event
const coachingPlans = new Map(); // driverId -> coaching plan
const leaderboards = new Map(); // fleetId -> leaderboard

// ============================================================================
// BEHAVIOR SCORING RULES
// ============================================================================

const SCORING_RULES = {
  // Harsh events (immediate deductions)
  harshAcceleration: { threshold: 3.5, deduction: 5, severity: 'medium' }, // m/s²
  harshBraking: { threshold: -3.5, deduction: 10, severity: 'high' },
  harshCornering: { threshold: 0.5, deduction: 8, severity: 'high' }, // g-force
  
  // Speed violations
  speedingMinor: { threshold: 10, deduction: 3, severity: 'low' }, // 10km/h over
  speedingMajor: { threshold: 20, deduction: 10, severity: 'high' }, // 20km/h over
  speedingExtreme: { threshold: 40, deduction: 25, severity: 'critical' }, // 40km/h over
  
  // Following distance
  tailgating: { threshold: 2, deduction: 7, severity: 'medium' }, // seconds
  
  // Idle time
  excessiveIdling: { threshold: 300, deduction: 5, severity: 'low' }, // 5 minutes
  
  // Positive behaviors (bonuses)
  smoothDriving: { bonus: 2, criteria: 'No harsh events for 50km' },
  fuelEfficiency: { bonus: 3, criteria: 'Better than fleet average' },
  safetyStreak: { bonus: 5, criteria: '7 days without incidents' }
};

// ============================================================================
// DRIVER BEHAVIOR TRACKING
// ============================================================================

function initializeDriverBehavior(driverId, driverInfo) {
  const behavior = {
    driverId,
    name: driverInfo.name,
    licenseNumber: driverInfo.licenseNumber,
    fleetId: driverInfo.fleetId,
    
    // Current scores
    scores: {
      overall: 100, // 0-100
      safety: 100,
      efficiency: 100,
      compliance: 100
    },
    
    // Historical averages
    averages: {
      overallScore: 100,
      safetyScore: 100,
      efficiencyScore: 100
    },
    
    // Behavior statistics
    stats: {
      totalTrips: 0,
      totalDistance: 0,
      totalDuration: 0,
      
      harshAccelerations: 0,
      harshBraking: 0,
      harshCornering: 0,
      speedingEvents: 0,
      tailgatingEvents: 0,
      idlingEvents: 0,
      
      perfectTrips: 0, // No events
      smoothDrivingBonus: 0,
      safetyStreakDays: 0,
      
      lastIncident: null,
      lastPerfectTrip: null
    },
    
    // Coaching
    coaching: {
      needsCoaching: false,
      focusAreas: [],
      completedSessions: 0,
      lastCoachingDate: null
    },
    
    // Gamification
    gamification: {
      level: 1,
      points: 0,
      badges: [],
      rank: null, // Fleet ranking
      achievements: []
    },
    
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  drivers.set(driverId, behavior);
  return behavior;
}

function startTrip(driverId, tripData) {
  const tripId = `trip_${driverId}_${Date.now()}`;
  
  const trip = {
    id: tripId,
    driverId,
    vehicleId: tripData.vehicleId,
    
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    distance: 0,
    
    route: {
      start: tripData.startLocation,
      end: tripData.endLocation,
      waypoints: []
    },
    
    // Real-time tracking
    events: [],
    scores: {
      safety: 100,
      efficiency: 100
    },
    
    // Statistics
    stats: {
      harshAccelerations: 0,
      harshBraking: 0,
      harshCornering: 0,
      speedingEvents: 0,
      tailgatingEvents: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      idleTime: 0,
      fuelUsed: 0
    },
    
    status: 'in_progress'
  };
  
  trips.set(tripId, trip);
  return trip;
}

function recordBehaviorEvent(tripId, eventData) {
  const trip = trips.get(tripId);
  if (!trip) {
    return { error: 'Trip not found' };
  }
  
  const eventId = `event_${tripId}_${Date.now()}`;
  
  const event = {
    id: eventId,
    tripId,
    driverId: trip.driverId,
    timestamp: new Date().toISOString(),
    location: eventData.location,
    type: eventData.type,
    value: eventData.value,
    severity: null,
    scoreDeduction: 0
  };
  
  // Determine severity and deduction
  switch (eventData.type) {
    case 'harshAcceleration':
      if (eventData.value >= SCORING_RULES.harshAcceleration.threshold) {
        event.severity = SCORING_RULES.harshAcceleration.severity;
        event.scoreDeduction = SCORING_RULES.harshAcceleration.deduction;
        trip.stats.harshAccelerations++;
      }
      break;
      
    case 'harshBraking':
      if (Math.abs(eventData.value) >= Math.abs(SCORING_RULES.harshBraking.threshold)) {
        event.severity = SCORING_RULES.harshBraking.severity;
        event.scoreDeduction = SCORING_RULES.harshBraking.deduction;
        trip.stats.harshBraking++;
      }
      break;
      
    case 'harshCornering':
      if (eventData.value >= SCORING_RULES.harshCornering.threshold) {
        event.severity = SCORING_RULES.harshCornering.severity;
        event.scoreDeduction = SCORING_RULES.harshCornering.deduction;
        trip.stats.harshCornering++;
      }
      break;
      
    case 'speeding':
      if (eventData.value >= SCORING_RULES.speedingExtreme.threshold) {
        event.severity = SCORING_RULES.speedingExtreme.severity;
        event.scoreDeduction = SCORING_RULES.speedingExtreme.deduction;
      } else if (eventData.value >= SCORING_RULES.speedingMajor.threshold) {
        event.severity = SCORING_RULES.speedingMajor.severity;
        event.scoreDeduction = SCORING_RULES.speedingMajor.deduction;
      } else if (eventData.value >= SCORING_RULES.speedingMinor.threshold) {
        event.severity = SCORING_RULES.speedingMinor.severity;
        event.scoreDeduction = SCORING_RULES.speedingMinor.deduction;
      }
      trip.stats.speedingEvents++;
      break;
      
    case 'tailgating':
      if (eventData.value <= SCORING_RULES.tailgating.threshold) {
        event.severity = SCORING_RULES.tailgating.severity;
        event.scoreDeduction = SCORING_RULES.tailgating.deduction;
        trip.stats.tailgatingEvents++;
      }
      break;
  }
  
  // Deduct from trip score
  trip.scores.safety = Math.max(0, trip.scores.safety - event.scoreDeduction);
  
  // Add to trip events
  trip.events.push(event);
  events.set(eventId, event);
  
  trips.set(tripId, trip);
  
  return event;
}

function endTrip(tripId, tripSummary) {
  const trip = trips.get(tripId);
  if (!trip) {
    return { error: 'Trip not found' };
  }
  
  trip.endTime = new Date().toISOString();
  trip.duration = tripSummary.duration;
  trip.distance = tripSummary.distance;
  trip.stats.avgSpeed = tripSummary.avgSpeed;
  trip.stats.maxSpeed = tripSummary.maxSpeed;
  trip.stats.idleTime = tripSummary.idleTime;
  trip.stats.fuelUsed = tripSummary.fuelUsed;
  trip.status = 'completed';
  
  // Calculate efficiency score
  const fuelEfficiency = trip.distance / trip.stats.fuelUsed; // km/L
  if (fuelEfficiency > 8) {
    trip.scores.efficiency += SCORING_RULES.fuelEfficiency.bonus;
  }
  
  // Check for smooth driving bonus
  if (trip.events.length === 0) {
    trip.scores.safety += SCORING_RULES.smoothDriving.bonus;
  }
  
  // Check for excessive idling
  if (trip.stats.idleTime > SCORING_RULES.excessiveIdling.threshold) {
    trip.scores.efficiency -= SCORING_RULES.excessiveIdling.deduction;
  }
  
  // Cap scores at 100
  trip.scores.safety = Math.min(100, trip.scores.safety);
  trip.scores.efficiency = Math.min(100, trip.scores.efficiency);
  
  trips.set(tripId, trip);
  
  // Update driver behavior
  updateDriverBehavior(trip.driverId, trip);
  
  return trip;
}

function updateDriverBehavior(driverId, completedTrip) {
  const behavior = drivers.get(driverId);
  if (!behavior) return;
  
  // Update statistics
  behavior.stats.totalTrips++;
  behavior.stats.totalDistance += completedTrip.distance;
  behavior.stats.totalDuration += completedTrip.duration;
  
  behavior.stats.harshAccelerations += completedTrip.stats.harshAccelerations;
  behavior.stats.harshBraking += completedTrip.stats.harshBraking;
  behavior.stats.harshCornering += completedTrip.stats.harshCornering;
  behavior.stats.speedingEvents += completedTrip.stats.speedingEvents;
  behavior.stats.tailgatingEvents += completedTrip.stats.tailgatingEvents;
  
  // Check for perfect trip
  if (completedTrip.events.length === 0) {
    behavior.stats.perfectTrips++;
    behavior.stats.lastPerfectTrip = completedTrip.endTime;
  }
  
  // Update scores (weighted average: 80% historical + 20% new trip)
  behavior.scores.safety = Math.round(behavior.scores.safety * 0.8 + completedTrip.scores.safety * 0.2);
  behavior.scores.efficiency = Math.round(behavior.scores.efficiency * 0.8 + completedTrip.scores.efficiency * 0.2);
  behavior.scores.overall = Math.round((behavior.scores.safety + behavior.scores.efficiency) / 2);
  
  // Update averages
  behavior.averages.overallScore = behavior.scores.overall;
  behavior.averages.safetyScore = behavior.scores.safety;
  behavior.averages.efficiencyScore = behavior.scores.efficiency;
  
  // Update gamification
  updateGamification(behavior, completedTrip);
  
  // Check if coaching needed
  checkCoachingNeeds(behavior);
  
  behavior.lastUpdated = new Date().toISOString();
  drivers.set(driverId, behavior);
}

// ============================================================================
// GAMIFICATION
// ============================================================================

function updateGamification(behavior, trip) {
  // Award points
  const points = Math.round((trip.scores.safety + trip.scores.efficiency) / 2);
  behavior.gamification.points += points;
  
  // Level up (every 1000 points)
  const newLevel = Math.floor(behavior.gamification.points / 1000) + 1;
  if (newLevel > behavior.gamification.level) {
    behavior.gamification.level = newLevel;
    behavior.gamification.achievements.push({
      type: 'level_up',
      level: newLevel,
      date: new Date().toISOString()
    });
  }
  
  // Award badges
  if (behavior.stats.perfectTrips === 10 && !behavior.gamification.badges.includes('perfect_10')) {
    behavior.gamification.badges.push('perfect_10');
  }
  
  if (behavior.stats.perfectTrips === 50 && !behavior.gamification.badges.includes('perfect_50')) {
    behavior.gamification.badges.push('perfect_50');
  }
  
  if (behavior.scores.overall >= 95 && !behavior.gamification.badges.includes('elite_driver')) {
    behavior.gamification.badges.push('elite_driver');
  }
  
  if (behavior.stats.totalDistance >= 10000 && !behavior.gamification.badges.includes('road_warrior')) {
    behavior.gamification.badges.push('road_warrior');
  }
}

function generateLeaderboard(fleetId) {
  const fleetDrivers = [];
  
  drivers.forEach(driver => {
    if (driver.fleetId === fleetId) {
      fleetDrivers.push({
        driverId: driver.driverId,
        name: driver.name,
        score: driver.scores.overall,
        level: driver.gamification.level,
        points: driver.gamification.points,
        badges: driver.gamification.badges.length,
        perfectTrips: driver.stats.perfectTrips
      });
    }
  });
  
  // Sort by score descending
  fleetDrivers.sort((a, b) => b.score - a.score);
  
  // Assign ranks
  fleetDrivers.forEach((driver, index) => {
    driver.rank = index + 1;
    
    const behavior = drivers.get(driver.driverId);
    if (behavior) {
      behavior.gamification.rank = driver.rank;
      drivers.set(driver.driverId, behavior);
    }
  });
  
  const leaderboard = {
    fleetId,
    drivers: fleetDrivers,
    generatedAt: new Date().toISOString()
  };
  
  leaderboards.set(fleetId, leaderboard);
  return leaderboard;
}

// ============================================================================
// AUTOMATED COACHING
// ============================================================================

function checkCoachingNeeds(behavior) {
  const focusAreas = [];
  
  // Check for consistent issues
  const tripsAnalyzed = Math.min(behavior.stats.totalTrips, 10);
  
  if (behavior.stats.harshBraking / tripsAnalyzed > 2) {
    focusAreas.push({
      area: 'Harsh Braking',
      frequency: 'high',
      recommendation: 'Anticipate stops earlier and brake gradually'
    });
  }
  
  if (behavior.stats.harshAccelerations / tripsAnalyzed > 2) {
    focusAreas.push({
      area: 'Harsh Acceleration',
      frequency: 'high',
      recommendation: 'Accelerate smoothly to improve fuel efficiency'
    });
  }
  
  if (behavior.stats.speedingEvents / tripsAnalyzed > 1) {
    focusAreas.push({
      area: 'Speeding',
      frequency: 'medium',
      recommendation: 'Maintain speed limits to reduce risk and fuel consumption'
    });
  }
  
  if (behavior.scores.overall < 70) {
    focusAreas.push({
      area: 'Overall Safety',
      frequency: 'critical',
      recommendation: 'Immediate coaching session required'
    });
  }
  
  behavior.coaching.needsCoaching = focusAreas.length > 0;
  behavior.coaching.focusAreas = focusAreas;
  
  // Generate coaching plan if needed
  if (behavior.coaching.needsCoaching) {
    generateCoachingPlan(behavior.driverId, focusAreas);
  }
}

function generateCoachingPlan(driverId, focusAreas) {
  const planId = `plan_${driverId}_${Date.now()}`;
  
  const plan = {
    id: planId,
    driverId,
    focusAreas,
    modules: [],
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // Add coaching modules
  focusAreas.forEach(area => {
    plan.modules.push({
      title: `${area.area} Training`,
      duration: 15, // minutes
      content: area.recommendation,
      completed: false
    });
  });
  
  coachingPlans.set(driverId, plan);
  return plan;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Driver Behavior Service',
    status: 'operational',
    drivers: drivers.size,
    activeTrips: Array.from(trips.values()).filter(t => t.status === 'in_progress').length,
    events: events.size
  });
});

// Initialize driver behavior tracking
app.post('/api/behavior/driver/initialize', (req, res) => {
  const { driverId, driverInfo } = req.body;
  
  const behavior = initializeDriverBehavior(driverId, driverInfo);
  
  res.json({
    success: true,
    behavior
  });
});

// Start trip
app.post('/api/behavior/trip/start', (req, res) => {
  const { driverId, tripData } = req.body;
  
  const trip = startTrip(driverId, tripData);
  
  res.json({
    success: true,
    trip
  });
});

// Record behavior event
app.post('/api/behavior/event', (req, res) => {
  const { tripId, eventData } = req.body;
  
  const event = recordBehaviorEvent(tripId, eventData);
  
  if (event.error) {
    return res.status(404).json(event);
  }
  
  res.json({
    success: true,
    event
  });
});

// End trip
app.post('/api/behavior/trip/:tripId/end', (req, res) => {
  const { tripId } = req.params;
  const tripSummary = req.body;
  
  const trip = endTrip(tripId, tripSummary);
  
  if (trip.error) {
    return res.status(404).json(trip);
  }
  
  res.json({
    success: true,
    trip
  });
});

// Get driver behavior
app.get('/api/behavior/driver/:driverId', (req, res) => {
  const { driverId } = req.params;
  const behavior = drivers.get(driverId);
  
  if (!behavior) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  
  res.json(behavior);
});

// Get fleet leaderboard
app.get('/api/behavior/fleet/:fleetId/leaderboard', (req, res) => {
  const { fleetId } = req.params;
  
  const leaderboard = generateLeaderboard(fleetId);
  
  res.json(leaderboard);
});

// Get coaching plan
app.get('/api/behavior/driver/:driverId/coaching', (req, res) => {
  const { driverId } = req.params;
  const plan = coachingPlans.get(driverId);
  
  if (!plan) {
    return res.status(404).json({ error: 'No coaching plan found' });
  }
  
  res.json(plan);
});

// Complete coaching module
app.post('/api/behavior/coaching/:driverId/complete', (req, res) => {
  const { driverId } = req.params;
  const { moduleIndex } = req.body;
  
  const plan = coachingPlans.get(driverId);
  if (!plan) {
    return res.status(404).json({ error: 'Coaching plan not found' });
  }
  
  if (plan.modules[moduleIndex]) {
    plan.modules[moduleIndex].completed = true;
  }
  
  // Check if all modules completed
  const allCompleted = plan.modules.every(m => m.completed);
  if (allCompleted) {
    plan.status = 'completed';
    
    const behavior = drivers.get(driverId);
    if (behavior) {
      behavior.coaching.completedSessions++;
      behavior.coaching.lastCoachingDate = new Date().toISOString();
      drivers.set(driverId, behavior);
    }
  }
  
  coachingPlans.set(driverId, plan);
  
  res.json({
    success: true,
    plan
  });
});

// Get scoring rules
app.get('/api/behavior/rules', (req, res) => {
  res.json(SCORING_RULES);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Driver Behavior Service running on port ${PORT}`);
  console.log(`🚗 Real-time Scoring: ACTIVE`);
  console.log(`🏆 Gamification: ACTIVE`);
  console.log(`👨‍🏫 Automated Coaching: ACTIVE`);
  console.log(`📊 Leaderboards: READY`);
});

module.exports = app;
