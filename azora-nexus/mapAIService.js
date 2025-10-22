/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// services/ai-orchestrator/mapAIService.js
// const axios = require('axios');

// In-memory storage of authorities and historical risk data
const AUTHORITIES_DB = [
  { id: 'auth_01', name: 'SAPS Sandton', location: { lat: -26.107, lon: 28.054 } },
  { id: 'auth_02', name: 'JMPD Midrand', location: { lat: -25.990, lon: 28.127 } },
];

const RISK_ZONES = [
  { zoneId: 'risk_zone_01', location: { lat: -26.1, lon: 28.05 }, risk: 0.8, type: 'high_accident_rate' },
];

/**
 * Predicts risks along a given route using historical and real-time data.
 * @param {object} route - The route to analyze.
 * @returns {Promise<object>} - Predicted risks and an optimal route.
 */
async function predictRouteRisks(route) {
  // In production, this analyzes route segments against a real-time risk model.
  // Currently returns data if the route intersects a known risk zone.
  const risks = RISK_ZONES.filter(zone => {
    // Simple proximity check for demo
    return Math.abs(zone.location.lat - route.start.lat) < 0.1;
  });

  const optimalRoute = [...route.waypoints]; // Placeholder for a real routing algorithm
  if (risks.length > 0) {
    // In production, re-route around the risk. For demo, just flag it.
    optimalRoute.push({ lat: -26.15, lon: 28.1, note: 'AI-rerouted path' });
  }

  return { risks, optimalRoute };
}

/**
 * Finds the closest authorities and nearby Azora members to an incident location.
 * @param {object} location - The lat/lon of the incident.
 * @param {Array<object>} allMembers - A list of all active Azora members.
 * @returns {object} - Closest official authorities and nearby members.
 */
function findNearbyResponders(location, allMembers = []) {
  // Simple distance calculation (Haversine formula would be better in production)
  const sortByDistance = (a, b) => {
    const distA = Math.hypot(a.location.lat - location.lat, a.location.lon - location.lon);
    const distB = Math.hypot(b.location.lat - location.lat, b.location.lon - location.lon);
    return distA - distB;
  };

  const authorities = [...AUTHORITIES_DB].sort(sortByDistance);
  const nearbyMembers = allMembers.filter(m => m.status === 'active').sort(sortByDistance);

  return {
    closestAuthority: authorities[0],
    firstResponders: nearbyMembers.slice(0, 3), // Top 3 closest members
  };
}

module.exports = { predictRouteRisks, findNearbyResponders };
