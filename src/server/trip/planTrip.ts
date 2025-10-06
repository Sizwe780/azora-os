// src/server/trip/planTrip.ts
import { prisma } from '../prisma';

// Dummy routing + HOS logic hooks (replace with OSRM/GraphHopper calls)
async function routeBetween(a: any, b: any) {
  // Return km/min. In production, call OSRM and measure distance/time.
  return { distanceKm: 120, durationMin: 100 };
}

export async function planTripWithHOS({ companyId, driverId, currentCycleUsedHrs, current, pickup, drop }:
  { companyId: string; driverId?: string; currentCycleUsedHrs: number; current: any; pickup: any; drop: any }) {

  const leg1 = await routeBetween(current, pickup);
  const leg2 = await routeBetween(pickup, drop);

  const fuelStops = []; // compute from distance and policy.fuelEveryKm
  const legsData = [
    { sequence: 1, start: current, end: pickup, type: 'pickup', distanceKm: leg1.distanceKm, durationMin: leg1.durationMin, plannedAt: new Date() },
    { sequence: 2, start: pickup, end: drop, type: 'driving', distanceKm: leg2.distanceKm, durationMin: leg2.durationMin, plannedAt: new Date() },
    { sequence: 3, start: drop, end: drop, type: 'dropoff', distanceKm: 0, durationMin: 60, plannedAt: new Date() },
  ];

  const trip = await prisma.tripPlan.create({
    data: {
      companyId,
      driverId,
      status: 'planned',
      currentCycleUsedHrs,
      currentLocation: current,
      pickupLocation: pickup,
      dropoffLocation: drop,
      routeSummary: { distanceKm: leg1.distanceKm + leg2.distanceKm, durationMin: leg1.durationMin + leg2.durationMin + 120, fuelStops },
      legs: { create: legsData }
    },
    include: { legs: true }
  });

  return trip;
}
