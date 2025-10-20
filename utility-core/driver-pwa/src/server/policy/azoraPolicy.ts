// src/server/policy/azoraPolicy.ts
export type HosPolicy = {
    cycleHoursMax: number;        // e.g., 70 over 8 days
    dailyDrivingMaxMin: number;   // e.g., 660 (11 hours)
    dailyOnDutyMaxMin: number;    // e.g., 840 (14 hours)
    pickupBufferMin: number;      // 60
    dropBufferMin: number;        // 60
  };
  
  export type TripPolicy = {
    fuelEveryKm: number;          // 1600 km (or set in miles if needed)
    restEveryDrivingMin: number;  // e.g., 480 (8h) suggested rest
    allowAdverseExtension: boolean;
  };
  
  export type AzoraPolicy = {
    hos: HosPolicy;
    trip: TripPolicy;
    privacy: {
      shareLocationWithPartners: boolean;
    };
    notifications: {
      criticalViaSms: boolean;
      infoViaToastOnly: boolean;
    };
  };
  
  export const defaultAzoraPolicy: AzoraPolicy = {
    hos: {
      cycleHoursMax: 70,
      dailyDrivingMaxMin: 660,
      dailyOnDutyMaxMin: 840,
      pickupBufferMin: 60,
      dropBufferMin: 60
    },
    trip: {
      fuelEveryKm: 1600,
      restEveryDrivingMin: 480,
      allowAdverseExtension: false
    },
    privacy: { shareLocationWithPartners: false },
    notifications: { criticalViaSms: true, infoViaToastOnly: true }
  };
  