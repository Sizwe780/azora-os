/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - AI Trip Planning Service
 * 
 * Intelligent trip planning with Azora AI integration for easy trip starting,
 * workday scheduling, driver assistance, and predictive route optimization.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * Email: sizwe.ngwenya@azora.world
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 4089;

// ============================================================================
// DATA STORES
// ============================================================================

const trips = new Map(); // tripId -> trip plan
const workdays = new Map(); // workdayId -> workday schedule
const aiConversations = new Map(); // conversationId -> conversation history
const driverPreferences = new Map(); // driverId -> preferences

// ============================================================================
// AZORA AI INTEGRATION
// ============================================================================

function azoraAI(prompt, context = {}) {
  // Simulate Azora AI responses (would integrate with real AI model in production)
  const responses = {
    'plan_trip': `I've analyzed the best route for your trip. Based on current traffic conditions, weather forecast, and your delivery schedule, I recommend leaving at 06:00 tomorrow morning. This will help you avoid peak traffic on the N1 and get you to your destination by 11:30, giving you time for a proper lunch break before your afternoon deliveries.`,
    
    'optimize_workday': `Let me optimize your workday schedule. I've arranged your 8 deliveries in the most efficient order, minimizing backtracking. You'll start with the northern deliveries in Pretoria, then work your way south through Midrand and Johannesburg. This saves you approximately 45km and 1.5 hours compared to the original order. I've also scheduled your mandatory breaks to coincide with rest stops that have good facilities.`,
    
    'safety_check': `Safety check complete. I've noticed you've been driving for 3 hours and 45 minutes. I recommend taking your mandatory 15-minute break at the next Engen garage in 12km. The weather forecast shows rain in 2 hours, so I've adjusted your route to avoid the gravel section on the R50. Your vehicle's tire pressure is slightly low on the rear left - please check it during your break.`,
    
    'accident_alert': `⚠️ URGENT: Accident reported 8km ahead on your route. I'm immediately rerouting you via the R21 to avoid delays. This adds 15 minutes to your journey but keeps you moving. I've notified dispatch and updated your ETA for all remaining deliveries. Stay alert - traffic is merging from 2 lanes to 1.`,
    
    'break_reminder': `Hi! You've been driving for 4 hours straight. Time for your mandatory 30-minute break. I've found a safe rest stop 5km ahead with clean facilities, food, and secure parking. Your next delivery isn't until 14:00, so you have plenty of time. Would you like me to set a 30-minute timer?`,
    
    'weather_advisory': `Weather advisory: Heavy rain expected on your route in 45 minutes. I recommend reducing speed to 80 km/h when it starts, and increasing your following distance to at least 3 seconds. The rain should clear by 16:00. I've added 20 minutes buffer time to your remaining deliveries.`,
    
    'fuel_reminder': `Your fuel level is at 25%. There's a Shell station with good diesel prices in 18km. If you refuel there, you'll have enough fuel for all remaining deliveries today plus your return trip tomorrow. Shall I add it to your route?`,
    
    'delivery_prep': `You're 10 minutes from your next delivery at Regional Distribution Hub Distribution Centre. Here's what you need to know: Gate 4 is for commercial vehicles, they require your delivery note and driver's license at security, the offloading bay is on the east side, and they typically take 30-45 minutes to offload. I've already sent them your ETA notification.`
  };
  
  // Determine response type based on context
  let responseType = 'plan_trip';
  
  if (prompt.toLowerCase().includes('accident') || prompt.toLowerCase().includes('emergency')) {
    responseType = 'accident_alert';
  } else if (prompt.toLowerCase().includes('break') || prompt.toLowerCase().includes('rest')) {
    responseType = 'break_reminder';
  } else if (prompt.toLowerCase().includes('weather') || prompt.toLowerCase().includes('rain')) {
    responseType = 'weather_advisory';
  } else if (prompt.toLowerCase().includes('fuel')) {
    responseType = 'fuel_reminder';
  } else if (prompt.toLowerCase().includes('delivery') || prompt.toLowerCase().includes('destination')) {
    responseType = 'delivery_prep';
  } else if (prompt.toLowerCase().includes('safety') || prompt.toLowerCase().includes('check')) {
    responseType = 'safety_check';
  } else if (prompt.toLowerCase().includes('optimize') || prompt.toLowerCase().includes('schedule')) {
    responseType = 'optimize_workday';
  }
  
  return {
    message: responses[responseType],
    type: responseType,
    timestamp: new Date().toISOString(),
    context
  };
}

// ============================================================================
// TRIP PLANNING
// ============================================================================

function createTripPlan(tripData) {
  const tripId = `TRIP-PLAN-${Date.now()}`;
  
  const plan = {
    id: tripId,
    driverId: tripData.driverId,
    vehicleId: tripData.vehicleId,
    
    route: {
      origin: tripData.origin,
      destination: tripData.destination,
      waypoints: tripData.waypoints || [],
      distance: calculateTotalDistance(tripData),
      estimatedDuration: calculateEstimatedDuration(tripData)
    },
    
    schedule: {
      plannedDeparture: tripData.plannedDeparture,
      estimatedArrival: calculateArrival(tripData),
      mandatoryBreaks: planMandatoryBreaks(tripData),
      flexibilityWindow: 30 // minutes
    },
    
    optimizations: {
      fuelStops: planFuelStops(tripData),
      restStops: planRestStops(tripData),
      deliverySequence: optimizeDeliverySequence(tripData.deliveries || []),
      avoidTollRoads: tripData.preferences?.avoidTolls || false
    },
    
    safety: {
      weatherForecast: 'clear', // Would integrate with weather API
      roadConditions: 'good',
      riskLevel: 'low',
      alternativeRoutes: 2
    },
    
    aiAssistance: {
      enabled: true,
      suggestions: [],
      conversationId: `CONV-${Date.now()}`
    },
    
    status: 'planned',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Get AI suggestions for the trip
  const aiResponse = azoraAI('plan_trip', { trip: plan });
  plan.aiAssistance.suggestions.push(aiResponse.message);
  
  trips.set(tripId, plan);
  
  return plan;
}

function calculateTotalDistance(tripData) {
  // Simplified distance calculation
  let totalDistance = 0;
  
  const points = [
    tripData.origin,
    ...(tripData.waypoints || []),
    tripData.destination
  ];
  
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(points[i], points[i + 1]);
  }
  
  return totalDistance;
}

function calculateDistance(start, end) {
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (end.lat - start.lat) * Math.PI / 180;
  const dLng = (end.lng - start.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return Math.floor(R * c);
}

function calculateEstimatedDuration(tripData) {
  const distance = calculateTotalDistance(tripData);
  const averageSpeed = 80; // km/h
  
  return Math.floor((distance / averageSpeed) * 60); // minutes
}

function calculateArrival(tripData) {
  const departure = new Date(tripData.plannedDeparture);
  const duration = calculateEstimatedDuration(tripData);
  
  const arrival = new Date(departure.getTime() + duration * 60 * 1000);
  
  return arrival.toISOString();
}

function planMandatoryBreaks(tripData) {
  const duration = calculateEstimatedDuration(tripData);
  const breaks = [];
  
  // SA law: 15-minute break every 3 hours, 30-minute break after 5 hours
  let breakTime = 0;
  
  while (breakTime < duration) {
    breakTime += 180; // 3 hours in minutes
    
    if (breakTime < duration) {
      breaks.push({
        type: breakTime >= 300 ? 'long' : 'short',
        duration: breakTime >= 300 ? 30 : 15,
        scheduledAt: new Date(new Date(tripData.plannedDeparture).getTime() + breakTime * 60 * 1000).toISOString(),
        location: 'Next safe rest stop'
      });
    }
  }
  
  return breaks;
}

function planFuelStops(tripData) {
  const distance = calculateTotalDistance(tripData);
  const fuelRange = 800; // km typical range
  
  const stops = [];
  let distanceCovered = 0;
  
  while (distanceCovered + fuelRange < distance) {
    distanceCovered += fuelRange * 0.75; // Refuel at 75% range
    
    stops.push({
      estimatedDistance: distanceCovered,
      estimatedTime: new Date(new Date(tripData.plannedDeparture).getTime() + 
                              (distanceCovered / 80) * 60 * 60 * 1000).toISOString(),
      note: 'Recommended fuel stop'
    });
  }
  
  return stops;
}

function planRestStops(tripData) {
  const breaks = planMandatoryBreaks(tripData);
  
  return breaks.map(breakInfo => ({
    type: 'rest_stop',
    duration: breakInfo.duration,
    scheduledAt: breakInfo.scheduledAt,
    facilities: ['restrooms', 'food', 'secure_parking']
  }));
}

function optimizeDeliverySequence(deliveries) {
  if (deliveries.length === 0) return [];
  
  // Simple nearest-neighbor optimization (TSP approximation)
  const optimized = [];
  const remaining = [...deliveries];
  
  let current = remaining[0];
  optimized.push(current);
  remaining.splice(0, 1);
  
  while (remaining.length > 0) {
    let nearest = 0;
    let minDistance = Infinity;
    
    remaining.forEach((delivery, index) => {
      const distance = calculateDistance(current.location, delivery.location);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = index;
      }
    });
    
    current = remaining[nearest];
    optimized.push(current);
    remaining.splice(nearest, 1);
  }
  
  return optimized.map((delivery, index) => ({
    ...delivery,
    sequence: index + 1
  }));
}

// ============================================================================
// WORKDAY PLANNING
// ============================================================================

function planWorkday(workdayData) {
  const workdayId = `WORKDAY-${Date.now()}`;
  
  const workday = {
    id: workdayId,
    driverId: workdayData.driverId,
    date: workdayData.date,
    
    schedule: {
      startTime: workdayData.startTime,
      endTime: calculateWorkdayEnd(workdayData),
      totalHours: 0,
      drivingHours: 0,
      breakHours: 0
    },
    
    trips: workdayData.trips || [],
    deliveries: workdayData.deliveries || [],
    
    breaks: {
      mandatory: [],
      lunch: {
        scheduledAt: workdayData.lunchTime || '12:00',
        duration: 60
      }
    },
    
    optimization: {
      totalDistance: 0,
      estimatedFuelCost: 0,
      efficiency: 0
    },
    
    status: 'planned',
    createdAt: new Date().toISOString()
  };
  
  // Optimize delivery sequence
  workday.deliveries = optimizeDeliverySequence(workday.deliveries);
  
  // Calculate totals
  workday.optimization.totalDistance = workday.deliveries.reduce((sum, d) => 
    sum + (d.distance || 0), 0);
  workday.optimization.estimatedFuelCost = workday.optimization.totalDistance * 2.2; // R2.20/km
  
  // Get AI optimization suggestions
  const aiResponse = azoraAI('optimize_workday', { workday });
  workday.aiSuggestions = [aiResponse.message];
  
  workdays.set(workdayId, workday);
  
  return workday;
}

function calculateWorkdayEnd(workdayData) {
  const start = new Date(`${workdayData.date}T${workdayData.startTime}`);
  const totalMinutes = (workdayData.trips || []).reduce((sum, trip) => 
    sum + (trip.duration || 0), 0);
  
  const end = new Date(start.getTime() + totalMinutes * 60 * 1000 + 60 * 60 * 1000); // +1 hour buffer
  
  return end.toTimeString().substring(0, 5);
}

// ============================================================================
// AI CHAT INTERFACE
// ============================================================================

function chatWithAI(message, context = {}) {
  const conversationId = context.conversationId || `CONV-${Date.now()}`;
  
  // Get or create conversation history
  let conversation = aiConversations.get(conversationId) || {
    id: conversationId,
    messages: [],
    createdAt: new Date().toISOString()
  };
  
  // Add user message
  conversation.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });
  
  // Get AI response
  const aiResponse = azoraAI(message, context);
  
  conversation.messages.push({
    role: 'assistant',
    content: aiResponse.message,
    type: aiResponse.type,
    timestamp: aiResponse.timestamp
  });
  
  aiConversations.set(conversationId, conversation);
  
  return {
    conversationId,
    response: aiResponse.message,
    type: aiResponse.type
  };
}

// ============================================================================
// EASY TRIP STARTING
// ============================================================================

function startTripEasy(driverId, destination) {
  // Voice/simple interface: "Start trip to Durban"
  
  // Get driver preferences
  const preferences = driverPreferences.get(driverId) || {
    preferredDepartureTime: '06:00',
    avoidTolls: false,
    preferredRestStops: []
  };
  
  // Create simple trip plan
  const tripPlan = createTripPlan({
    driverId,
    origin: { name: 'Current Location', lat: -26.2041, lng: 28.0473 }, // Johannesburg
    destination: { name: destination, lat: -29.8587, lng: 31.0218 }, // Durban
    plannedDeparture: new Date().toISOString(),
    preferences
  });
  
  // Get AI welcome message
  const welcome = chatWithAI(
    `I'm starting a trip to ${destination}`,
    { trip: tripPlan }
  );
  
  return {
    tripId: tripPlan.id,
    message: welcome.response,
    tripPlan
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'AI Trip Planning Service',
    status: 'operational',
    activePlans: trips.size,
    aiConversations: aiConversations.size
  });
});

// Create trip plan
app.post('/api/trips/plan', (req, res) => {
  const plan = createTripPlan(req.body);
  
  res.json({
    success: true,
    plan
  });
});

// Easy trip start (voice command)
app.post('/api/trips/start-easy', (req, res) => {
  const { driverId, destination } = req.body;
  
  const result = startTripEasy(driverId, destination);
  
  res.json({
    success: true,
    ...result
  });
});

// Get trip plan
app.get('/api/trips/:tripId', (req, res) => {
  const { tripId } = req.params;
  const plan = trips.get(tripId);
  
  if (!plan) {
    return res.status(404).json({ error: 'Trip plan not found' });
  }
  
  res.json(plan);
});

// Plan workday
app.post('/api/workdays/plan', (req, res) => {
  const workday = planWorkday(req.body);
  
  res.json({
    success: true,
    workday
  });
});

// Get workday plan
app.get('/api/workdays/:workdayId', (req, res) => {
  const { workdayId } = req.params;
  const workday = workdays.get(workdayId);
  
  if (!workday) {
    return res.status(404).json({ error: 'Workday plan not found' });
  }
  
  res.json(workday);
});

// Chat with AI
app.post('/api/ai/chat', (req, res) => {
  const { message, context } = req.body;
  
  const response = chatWithAI(message, context);
  
  res.json(response);
});

// Get AI conversation
app.get('/api/ai/conversation/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const conversation = aiConversations.get(conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json(conversation);
});

// Save driver preferences
app.put('/api/drivers/:driverId/preferences', (req, res) => {
  const { driverId } = req.params;
  const preferences = req.body;
  
  driverPreferences.set(driverId, preferences);
  
  res.json({
    success: true,
    preferences
  });
});

// Get driver preferences
app.get('/api/drivers/:driverId/preferences', (req, res) => {
  const { driverId } = req.params;
  const preferences = driverPreferences.get(driverId) || {};
  
  res.json(preferences);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ AI Trip Planning Service running on port ${PORT}`);
  console.log(`🤖 Azora AI: ACTIVE`);
  console.log(`🚗 Easy Trip Start: ENABLED`);
  console.log(`📅 Workday Planning: ACTIVE`);
  console.log(`💬 AI Chat Interface: READY`);
});

module.exports = app;
