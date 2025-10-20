// src/server/policy/guard.ts
import { AzoraPolicy } from './azoraPolicy';

export function enforcePolicy<T extends Record<string, any>>(policy: AzoraPolicy, action: { type: string; params: T }) {
  switch (action.type) {
    case 'trip.plan':
      // Validate HOS buffers and fuel cadence
      if (policy.hos.pickupBufferMin < 60 || policy.hos.dropBufferMin < 60) {
        throw new Error('Pickup/Drop buffers must be >= 60 minutes by policy');
      }
      return true;
    case 'trip.start':
      return true;
    case 'trip.insertStop':
      return true;
    case 'logs.generate':
      return true;
    default:
      return true;
  }
}
