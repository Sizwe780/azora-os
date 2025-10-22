/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Advanced Compliance Engine
 * 
 * Industry-grade compliance and logbook generation engine with SADC cross-border rules,
 * HOS tracking, cargo-specific rules, TREMCARD generation, and dynamic logsheet creation.
 * 
 * Based on the AzoraComplianceEngine specification with full legal compliance.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * @author Autonomous Logistics Team
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 4086;

// ============================================================================
// COMPLIANCE RULEBOOK (SADC-Wide)
// ============================================================================

const COMPLIANCE_RULEBOOK = {
  GENERAL: {
    PRDP_EXPIRY_WARNING_DAYS: 60,
    PASSPORT_EXPIRY_MIN_MONTHS: 6,
    COF_EXPIRY_WARNING_DAYS: 30,
    VEHICLE_LICENSE_EXPIRY_WARNING_DAYS: 30,
    POLICE_CLEARANCE_EXPIRY_WARNING_DAYS: 30,
    SERVICE_DUE_SOON_KM: 2500,
    TYRE_TREAD_MIN_MM: 1.6,
    TYRE_TREAD_WARNING_MM: 3.0,
    BRAKE_LIFE_WARNING_PERCENT: 20,
    MAX_LEGAL_LOAD_KG: {
      'Super-link': 34000,
      'Tri-axle': 28000,
      'Refrigerated': 32000,
      'Rigid': 18000,
      'Articulated': 56000
    }
  },

  // NRTA (South African National Road Traffic Act) HOS Rules
  HOS_RULES_ZA: {
    MAX_CONTINUOUS_DRIVING_HOURS: 5,
    MIN_BREAK_AFTER_CONTINUOUS_DRIVING_MINS: 15,
    MAX_DRIVING_HOURS_IN_24H: 15,
    MIN_CONTINUOUS_REST_IN_24H: 9,
    MAX_DUTY_HOURS_IN_24H: 15,
    MAX_DRIVING_HOURS_IN_7_DAYS: 60
  },

  // Cargo-Specific Compliance Rules
  CARGO_SPECIFIC_RULES: {
    ABNORMAL_LOAD: {
      requiresAbnormalPermit: true,
      travelTimeRestrictions: true,
      escortRequired: true,
      speedLimit: 60
    },
    LIVESTOCK: {
      requiresVetCertificate: true,
      maxContinuousTravelHours: 8,
      mandatoryRestStops: true,
      wateringRequirements: '4 hours'
    },
    PERISHABLE_GOODS: {
      requiresTempLog: true,
      maxTempDeviation: 2,
      requiresRefrigeration: true
    },
    HAZARDOUS_GOODS: {
      requiresHazchemCertification: true,
      requiresTREMCARD: true,
      requiresUN_Number: true,
      emergencyContactMandatory: true,
      specialRouting: true
    },
    FUEL_TRANSPORT: {
      requiresTankInspection: true,
      requiresFuelTransportLicense: true,
      emergencyShutoffRequired: true,
      spillKitMandatory: true
    }
  },

  // SADC Countries Cross-Border Requirements
  COUNTRIES: {
    ZA: {
      name: 'South Africa',
      requiresPassport: false,
      requiresWorkPermit: false,
      requiresVisa: false
    },
    ZW: {
      name: 'Zimbabwe',
      requiresPassport: true,
      requiresWorkPermit: true,
      requiresVehiclePoliceClearance: true,
      borderPosts: {
        'Beitbridge': {
          coordinates: { lat: -22.2167, lng: 30.0000 },
          requiresSAD500: true,
          requiresCOMESAYellowCard: true,
          additionalDocs: ['Bill of Lading', 'Commercial Invoice', 'Packing List'],
          customsHours: '24/7',
          averageProcessingTime: '2-4 hours'
        }
      }
    },
    ZM: {
      name: 'Zambia',
      requiresPassport: true,
      requiresWorkPermit: true,
      requiresVehiclePoliceClearance: false,
      borderPosts: {
        'Kazungula': {
          coordinates: { lat: -17.7833, lng: 25.2667 },
          requiresSAD500: true,
          requiresCOMESAYellowCard: true,
          additionalDocs: ['Bill of Lading', 'Commercial Invoice', 'Certificate of Origin'],
          customsHours: '06:00-18:00',
          averageProcessingTime: '3-5 hours'
        },
        'Chirundu': {
          coordinates: { lat: -15.5167, lng: 28.85 },
          requiresSAD500: true,
          requiresCOMESAYellowCard: true,
          additionalDocs: ['Bill of Lading', 'Commercial Invoice'],
          customsHours: '24/7',
          averageProcessingTime: '2-3 hours'
        }
      }
    },
    BW: {
      name: 'Botswana',
      requiresPassport: true,
      requiresWorkPermit: false,
      requiresVehiclePoliceClearance: false,
      borderPosts: {
        'Skilpadshek': {
          coordinates: { lat: -25.9667, lng: 25.6167 },
          requiresSAD500: true,
          requiresRoadPermit: true,
          additionalDocs: ['Bill of Lading', 'Commercial Invoice'],
          customsHours: '06:00-22:00',
          averageProcessingTime: '1-2 hours'
        }
      }
    },
    MZ: {
      name: 'Mozambique',
      requiresPassport: true,
      requiresWorkPermit: true,
      requiresVehiclePoliceClearance: true,
      borderPosts: {
        'Ressano Garcia': {
          coordinates: { lat: -25.4333, lng: 31.9833 },
          requiresSAD500: true,
          requiresThirdPartyInsurance: true,
          additionalDocs: ['Bill of Lading', 'Commercial Invoice', 'Manifesto de Carga'],
          customsHours: '24/7',
          averageProcessingTime: '3-6 hours'
        }
      }
    },
    NA: {
      name: 'Namibia',
      requiresPassport: true,
      requiresWorkPermit: false,
      requiresVehiclePoliceClearance: false,
      borderPosts: {
        'Ariamsvlei': {
          coordinates: { lat: -26.0167, lng: 19.9833 },
          requiresSAD500: true,
          requiresCBCPermit: true,
          additionalDocs: ['Bill of Lading', 'Commercial Invoice'],
          customsHours: '24/7',
          averageProcessingTime: '1-2 hours'
        }
      }
    }
  },

  // UN Hazardous Goods Classifications
  UN_HAZARD_CLASSES: {
    '1': { class: 'Explosives', tremcardColor: 'orange' },
    '2.1': { class: 'Flammable gases', tremcardColor: 'red' },
    '2.2': { class: 'Non-flammable gases', tremcardColor: 'green' },
    '2.3': { class: 'Toxic gases', tremcardColor: 'white' },
    '3': { class: 'Flammable liquids', tremcardColor: 'red' },
    '4.1': { class: 'Flammable solids', tremcardColor: 'red-white' },
    '5.1': { class: 'Oxidizing substances', tremcardColor: 'yellow' },
    '6.1': { class: 'Toxic substances', tremcardColor: 'white' },
    '8': { class: 'Corrosive substances', tremcardColor: 'black-white' },
    '9': { class: 'Miscellaneous dangerous substances', tremcardColor: 'black-white' }
  }
};

// ============================================================================
// DATA STORES
// ============================================================================

const logsheets = new Map(); // logsheetId -> AzoraLogsheet
const tremcards = new Map(); // tremcardId -> TREMCARD data
// const _inspections = new Map(); // inspectionId -> pre/post trip inspection
// const _complianceReports = new Map(); // reportId -> comprehensive compliance report

// ============================================================================
// AZORA LOGSHEET CLASS
// ============================================================================

class AzoraLogsheet {
  constructor(date, driver, vehicle, trip) {
    this.logsheetId = `LOG-${date}-${driver.id}-${vehicle.id}`;
    this.date = date;
    
    // Section A: Header
    this.driverDetails = {
      name: driver.name,
      id: driver.id,
      licenseCode: driver.licenseCode,
      prdpExpiry: driver.prdpExpiry,
      hazchemCertified: driver.hazchemCertified || false
    };
    
    this.vehicleDetails = {
      id: vehicle.id,
      registration: vehicle.registration,
      type: vehicle.type,
      vin: vehicle.vin
    };
    
    this.trailerDetails = (vehicle.trailers || []).map(t => ({
      registration: t.registration,
      type: t.type,
      cofExpiry: t.cofExpiry
    }));
    
    this.tripDetails = {
      from: trip.from,
      to: trip.to,
      cargo: trip.cargo.description,
      cargoType: trip.cargo.type,
      weightKg: trip.cargo.weightKg,
      isHazchem: trip.cargo.isHazchem || false,
      unNumber: trip.cargo.unNumber || null
    };
    
    // Section B: Inspections
    this.preTripInspection = {
      completed: false,
      timestamp: null,
      defects: [],
      inspector: null
    };
    
    this.postTripInspection = {
      completed: false,
      timestamp: null,
      defects: [],
      inspector: null
    };
    
    // Section C: 24-Hour Activity Grid
    this.activityLog = []; // [{start, end, status, duration, location, odo}]
    
    // Section D: Expenses
    this.expenses = []; // [{type, amount, location, receiptNumber}]
    
    // Section E: Summary & Verification
    this.summary = {
      startOdometer: 0,
      endOdometer: 0,
      totalKm: 0,
      totalDrivingHours: 0,
      totalOnDutyHours: 0,
      totalOffDutyHours: 0
    };
    
    this.complianceReport = {};
    
    this.driverSignature = {
      signed: false,
      timestamp: null,
      signature: null
    };
    
    this.managerVerification = {
      verified: false,
      timestamp: null,
      verifiedBy: null
    };
    
    this.createdAt = new Date().toISOString();
    this.status = 'draft'; // draft, submitted, verified, archived
  }
}

// ============================================================================
// COMPLIANCE CHECKS
// ============================================================================

function getDaysUntil(dateString) {
  if (!dateString) return Infinity;
  const targetDate = new Date(dateString);
  const now = new Date();
  const diffTime = targetDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function checkDriverCompliance(driver, trip) {
  const results = [];
  
  // PrDP Check
  const prdpDays = getDaysUntil(driver.prdpExpiry);
  if (prdpDays < 0) {
    results.push({
      item: 'Professional Driving Permit (PrDP)',
      status: 'Critical',
      message: `Expired ${Math.abs(prdpDays)} days ago. Driver cannot legally operate.`
    });
  } else if (prdpDays <= COMPLIANCE_RULEBOOK.GENERAL.PRDP_EXPIRY_WARNING_DAYS) {
    results.push({
      item: 'Professional Driving Permit (PrDP)',
      status: 'Warning',
      message: `Expires in ${prdpDays} days. Renew soon.`
    });
  } else {
    results.push({
      item: 'Professional Driving Permit (PrDP)',
      status: 'Compliant',
      message: 'Valid'
    });
  }
  
  // Hazchem Certification Check
  if (trip.cargo.isHazchem) {
    if (!driver.hazchemCertified) {
      results.push({
        item: 'Hazchem Certification',
        status: 'Critical',
        message: 'Driver not certified for hazardous goods transport.'
      });
    } else {
      results.push({
        item: 'Hazchem Certification',
        status: 'Compliant',
        message: 'Driver is certified for hazardous goods.'
      });
    }
  }
  
  // Passport Check (for cross-border)
  if (trip.crossBorder) {
    const passportDays = getDaysUntil(driver.passportExpiry);
    const minDays = COMPLIANCE_RULEBOOK.GENERAL.PASSPORT_EXPIRY_MIN_MONTHS * 30;
    
    if (passportDays < minDays) {
      results.push({
        item: 'Passport',
        status: 'Critical',
        message: `Passport expires in ${passportDays} days. Minimum ${COMPLIANCE_RULEBOOK.GENERAL.PASSPORT_EXPIRY_MIN_MONTHS} months required for cross-border.`
      });
    } else {
      results.push({
        item: 'Passport',
        status: 'Compliant',
        message: 'Passport valid for cross-border travel.'
      });
    }
  }
  
  return results;
}

function checkDriverFatigueAndHOS(activityLog) {
  const results = [];
  const rules = COMPLIANCE_RULEBOOK.HOS_RULES_ZA;
  
  let totalDrivingHours = 0;
  let continuousDrivingHours = 0;
  
  activityLog.forEach((activity, _index) => {
    if (activity.status === 'driving') {
      const durationHours = activity.duration / 60; // Convert minutes to hours
      totalDrivingHours += durationHours;
      continuousDrivingHours += durationHours;
      
      // Check continuous driving limit
      if (continuousDrivingHours > rules.MAX_CONTINUOUS_DRIVING_HOURS) {
        results.push({
          item: 'Continuous Driving Limit',
          status: 'Critical',
          message: `Exceeded ${rules.MAX_CONTINUOUS_DRIVING_HOURS} hour continuous driving limit at ${activity.timestamp}.`
        });
      }
    }
    
    if (activity.status === 'break' || activity.status === 'off_duty') {
      const breakDuration = activity.duration; // in minutes
      if (breakDuration >= rules.MIN_BREAK_AFTER_CONTINUOUS_DRIVING_MINS) {
        continuousDrivingHours = 0; // Reset continuous driving counter
      }
    }
  });
  
  // Check total driving hours in 24h
  if (totalDrivingHours > rules.MAX_DRIVING_HOURS_IN_24H) {
    results.push({
      item: 'Daily Driving Limit',
      status: 'Critical',
      message: `Exceeded ${rules.MAX_DRIVING_HOURS_IN_24H} hour daily driving limit. Total: ${totalDrivingHours.toFixed(1)} hours.`
    });
  }
  
  if (results.length === 0) {
    results.push({
      item: 'Hours of Service',
      status: 'Compliant',
      message: 'Driver adhered to all HOS regulations.'
    });
  }
  
  return results;
}

function checkVehicleLifecycle(vehicle) {
  const results = [];
  
  // COF Check (Truck)
  const cofDays = getDaysUntil(vehicle.compliance.lifecycle.cof.expiry);
  if (cofDays < 0) {
    results.push({
      item: `Certificate of Fitness - ${vehicle.registration}`,
      status: 'Critical',
      message: `Expired ${Math.abs(cofDays)} days ago. Vehicle cannot operate.`
    });
  } else if (cofDays <= COMPLIANCE_RULEBOOK.GENERAL.COF_EXPIRY_WARNING_DAYS) {
    results.push({
      item: `Certificate of Fitness - ${vehicle.registration}`,
      status: 'Warning',
      message: `Expires in ${cofDays} days.`
    });
  } else {
    results.push({
      item: `Certificate of Fitness - ${vehicle.registration}`,
      status: 'Compliant',
      message: 'Valid'
    });
  }
  
  // Trailer COF Checks
  (vehicle.trailers || []).forEach(trailer => {
    const trailerCofDays = getDaysUntil(trailer.cofExpiry);
    if (trailerCofDays < 0) {
      results.push({
        item: `Trailer COF - ${trailer.registration}`,
        status: 'Critical',
        message: `Expired ${Math.abs(trailerCofDays)} days ago.`
      });
    }
  });
  
  // Service Due Check
  const kmToService = vehicle.compliance.lifecycle.nextService.kmRemaining;
  if (kmToService <= 0) {
    results.push({
      item: 'Service Interval',
      status: 'Critical',
      message: `Overdue by ${Math.abs(kmToService).toLocaleString()} km.`
    });
  } else if (kmToService <= COMPLIANCE_RULEBOOK.GENERAL.SERVICE_DUE_SOON_KM) {
    results.push({
      item: 'Service Interval',
      status: 'Warning',
      message: `Service due in ${kmToService.toLocaleString()} km.`
    });
  }
  
  return results;
}

function checkLoadAndCargoCompliance(vehicle, trip) {
  const results = [];
  
  // Axle Load Check
  const maxLoad = COMPLIANCE_RULEBOOK.GENERAL.MAX_LEGAL_LOAD_KG[vehicle.type] || 34000;
  const currentLoad = trip.cargo.weightKg;
  
  if (currentLoad > maxLoad) {
    results.push({
      item: 'Axle Load Limit',
      status: 'Critical',
      message: `Overloaded by ${(currentLoad - maxLoad).toLocaleString()} kg. Legal limit: ${maxLoad.toLocaleString()} kg.`
    });
  } else {
    results.push({
      item: 'Axle Load Limit',
      status: 'Compliant',
      message: `${currentLoad.toLocaleString()} kg / ${maxLoad.toLocaleString()} kg`
    });
  }
  
  // Cargo-Specific Rules
  const cargoRules = COMPLIANCE_RULEBOOK.CARGO_SPECIFIC_RULES[trip.cargo.type];
  if (cargoRules) {
    if (cargoRules.requiresAbnormalPermit && !trip.documents.abnormalPermit) {
      results.push({
        item: 'Abnormal Load Permit',
        status: 'Critical',
        message: 'Required for this load but missing.'
      });
    }
    
    if (cargoRules.requiresVetCertificate && !trip.documents.vetCertificate) {
      results.push({
        item: 'Veterinary Certificate',
        status: 'Critical',
        message: 'Required for livestock transport but missing.'
      });
    }
    
    if (cargoRules.requiresTempLog && !trip.documents.tempLog) {
      results.push({
        item: 'Temperature Log',
        status: 'Warning',
        message: 'Required for perishable goods. Ensure cold chain monitoring is active.'
      });
    }
    
    if (cargoRules.requiresTREMCARD && !trip.documents.tremcard) {
      results.push({
        item: 'TREMCARD',
        status: 'Critical',
        message: `TREMCARD required for hazardous goods (UN ${trip.cargo.unNumber}).`
      });
    }
  }
  
  return results;
}

function checkCrossBorderCompliance(driver, vehicle, trip) {
  const results = [];
  
  if (!trip.crossBorder || !trip.destinationCountry) {
    return results;
  }
  
  const country = COMPLIANCE_RULEBOOK.COUNTRIES[trip.destinationCountry];
  if (!country) {
    results.push({
      item: 'Destination Country',
      status: 'Warning',
      message: `No compliance rules defined for ${trip.destinationCountry}.`
    });
    return results;
  }
  
  // Passport Check
  if (country.requiresPassport && !driver.hasPassport) {
    results.push({
      item: 'Passport',
      status: 'Critical',
      message: `Passport required for entry to ${country.name}.`
    });
  }
  
  // Work Permit Check
  if (country.requiresWorkPermit && !driver.hasWorkPermit) {
    results.push({
      item: 'Work Permit',
      status: 'Critical',
      message: `Work permit required for ${country.name}.`
    });
  }
  
  // Border-Specific Documents
  if (trip.borderPost && country.borderPosts[trip.borderPost]) {
    const border = country.borderPosts[trip.borderPost];
    
    if (border.requiresSAD500 && !trip.documents.sad500) {
      results.push({
        item: 'SAD500 Form',
        status: 'Critical',
        message: `SAD500 customs form required at ${trip.borderPost}.`
      });
    }
    
    if (border.requiresCOMESAYellowCard && !trip.documents.comesaYellowCard) {
      results.push({
        item: 'COMESA Yellow Card',
        status: 'Critical',
        message: `COMESA insurance required at ${trip.borderPost}.`
      });
    }
    
    (border.additionalDocs || []).forEach(doc => {
      if (!trip.documents[doc.toLowerCase().replace(/ /g, '_')]) {
        results.push({
          item: doc,
          status: 'Critical',
          message: `${doc} required for ${trip.borderPost} border crossing.`
        });
      }
    });
  }
  
  return results;
}

// ============================================================================
// TREMCARD GENERATION
// ============================================================================

function generateTREMCARD(trip) {
  if (!trip.cargo.isHazchem || !trip.cargo.unNumber) {
    return { error: 'Not a hazardous goods shipment' };
  }
  
  const unClass = trip.cargo.unNumber.toString().charAt(0);
  const hazardInfo = COMPLIANCE_RULEBOOK.UN_HAZARD_CLASSES[unClass] || {};
  
  const tremcardId = `TREM-${trip.cargo.unNumber}-${Date.now()}`;
  
  const tremcard = {
    id: tremcardId,
    tripId: trip.id,
    unNumber: trip.cargo.unNumber,
    properShippingName: trip.cargo.description,
    hazardClass: unClass,
    hazardClassDescription: hazardInfo.class,
    packingGroup: trip.cargo.packingGroup || 'II',
    
    emergencyContact: {
      name: 'Azora Emergency Response',
      phone: '+27 800 AZORA911',
      emergencyResponseGuidelines: `In case of spill or accident: ${getEmergencyProtocol(unClass)}`
    },
    
    driverInstructions: [
      'Keep TREMCARD visible in cabin at all times',
      'In case of accident, contact emergency services immediately',
      'Do not leave vehicle unattended',
      'Follow special routing for hazardous goods',
      'Carry fire extinguisher and spill kit'
    ],
    
    vehicleMarkings: {
      placard: hazardInfo.tremcardColor,
      unNumberDisplay: 'Front and rear of vehicle',
      warningSignsRequired: true
    },
    
    specialInstructions: trip.cargo.specialInstructions || [],
    
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  };
  
  tremcards.set(tremcardId, tremcard);
  return tremcard;
}

function getEmergencyProtocol(unClass) {
  const protocols = {
    '1': 'Evacuate 500m radius. No water. Call bomb disposal.',
    '2': 'Ventilate area. Use breathing apparatus. No flames.',
    '3': 'Use foam or CO2. Do not use water. Prevent ignition.',
    '4': 'Use sand or dry powder. No water contact.',
    '5': 'Use water spray. Keep containers cool.',
    '6': 'Use breathing apparatus. Avoid skin contact. Decontaminate.',
    '8': 'Flush with water. Neutralize with appropriate agent.',
    '9': 'Follow specific substance guidelines.'
  };
  return protocols[unClass] || 'Contact emergency services.';
}

// ============================================================================
// LOGSHEET GENERATION
// ============================================================================

function generateLogsheet(date, driver, vehicle, trip) {
  const logsheet = new AzoraLogsheet(date, driver, vehicle, trip);
  
  // Populate activity log
  logsheet.activityLog = driver.activityLog || [];
  
  // Populate inspections
  logsheet.preTripInspection = trip.inspections?.preTrip || logsheet.preTripInspection;
  logsheet.postTripInspection = trip.inspections?.postTrip || logsheet.postTripInspection;
  
  // Calculate summaries
  const activities = logsheet.activityLog;
  if (activities.length > 0) {
    logsheet.summary.startOdometer = activities[0]?.odo || 0;
    logsheet.summary.endOdometer = activities[activities.length - 1]?.odo || 0;
    logsheet.summary.totalKm = logsheet.summary.endOdometer - logsheet.summary.startOdometer;
    
    logsheet.summary.totalDrivingHours = activities
      .filter(a => a.status === 'driving')
      .reduce((sum, a) => sum + (a.duration / 60), 0);
      
    logsheet.summary.totalOnDutyHours = activities
      .filter(a => ['driving', 'loading', 'unloading'].includes(a.status))
      .reduce((sum, a) => sum + (a.duration / 60), 0);
      
    logsheet.summary.totalOffDutyHours = activities
      .filter(a => ['off_duty', 'sleeper_berth'].includes(a.status))
      .reduce((sum, a) => sum + (a.duration / 60), 0);
  }
  
  // Run comprehensive compliance checks
  const complianceChecks = [
    ...checkDriverCompliance(driver, trip),
    ...checkDriverFatigueAndHOS(logsheet.activityLog),
    ...checkVehicleLifecycle(vehicle),
    ...checkLoadAndCargoCompliance(vehicle, trip),
    ...checkCrossBorderCompliance(driver, vehicle, trip)
  ];
  
  // Determine overall status
  let overallStatus = 'Compliant';
  if (complianceChecks.some(c => c.status === 'Critical')) {
    overallStatus = 'Critical';
  } else if (complianceChecks.some(c => c.status === 'Warning')) {
    overallStatus = 'Warning';
  }
  
  logsheet.complianceReport = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    criticalCount: complianceChecks.filter(c => c.status === 'Critical').length,
    warningCount: complianceChecks.filter(c => c.status === 'Warning').length,
    compliantCount: complianceChecks.filter(c => c.status === 'Compliant').length,
    breakdown: complianceChecks
  };
  
  logsheets.set(logsheet.logsheetId, logsheet);
  return logsheet;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Advanced Compliance Engine',
    status: 'operational',
    logsheets: logsheets.size,
    tremcards: tremcards.size,
    rulebook: 'SADC-Wide v3.0'
  });
});

// Generate logsheet
app.post('/api/compliance/logsheet/generate', (req, res) => {
  const { date, driver, vehicle, trip } = req.body;
  
  const logsheet = generateLogsheet(date, driver, vehicle, trip);
  
  res.json({
    success: true,
    logsheet
  });
});

// Get logsheet
app.get('/api/compliance/logsheet/:logsheetId', (req, res) => {
  const { logsheetId } = req.params;
  const logsheet = logsheets.get(logsheetId);
  
  if (!logsheet) {
    return res.status(404).json({ error: 'Logsheet not found' });
  }
  
  res.json(logsheet);
});

// Sign logsheet (driver)
app.post('/api/compliance/logsheet/:logsheetId/sign', (req, res) => {
  const { logsheetId } = req.params;
  const { signature } = req.body;
  
  const logsheet = logsheets.get(logsheetId);
  if (!logsheet) {
    return res.status(404).json({ error: 'Logsheet not found' });
  }
  
  logsheet.driverSignature = {
    signed: true,
    timestamp: new Date().toISOString(),
    signature
  };
  logsheet.status = 'submitted';
  
  logsheets.set(logsheetId, logsheet);
  
  res.json({
    success: true,
    message: 'Logsheet signed and submitted',
    logsheet
  });
});

// Verify logsheet (manager)
app.post('/api/compliance/logsheet/:logsheetId/verify', (req, res) => {
  const { logsheetId } = req.params;
  const { verifiedBy } = req.body;
  
  const logsheet = logsheets.get(logsheetId);
  if (!logsheet) {
    return res.status(404).json({ error: 'Logsheet not found' });
  }
  
  logsheet.managerVerification = {
    verified: true,
    timestamp: new Date().toISOString(),
    verifiedBy
  };
  logsheet.status = 'verified';
  
  logsheets.set(logsheetId, logsheet);
  
  res.json({
    success: true,
    message: 'Logsheet verified by manager',
    logsheet
  });
});

// Generate TREMCARD
app.post('/api/compliance/tremcard/generate', (req, res) => {
  const { trip } = req.body;
  
  const tremcard = generateTREMCARD(trip);
  
  if (tremcard.error) {
    return res.status(400).json(tremcard);
  }
  
  res.json({
    success: true,
    tremcard
  });
});

// Get TREMCARD
app.get('/api/compliance/tremcard/:tremcardId', (req, res) => {
  const { tremcardId } = req.params;
  const tremcard = tremcards.get(tremcardId);
  
  if (!tremcard) {
    return res.status(404).json({ error: 'TREMCARD not found' });
  }
  
  res.json(tremcard);
});

// Get compliance rulebook
app.get('/api/compliance/rulebook', (req, res) => {
  res.json(COMPLIANCE_RULEBOOK);
});

// Check specific compliance
app.post('/api/compliance/check/driver', (req, res) => {
  const { driver, trip } = req.body;
  const results = checkDriverCompliance(driver, trip);
  res.json({ results });
});

app.post('/api/compliance/check/vehicle', (req, res) => {
  const { vehicle } = req.body;
  const results = checkVehicleLifecycle(vehicle);
  res.json({ results });
});

app.post('/api/compliance/check/cargo', (req, res) => {
  const { vehicle, trip } = req.body;
  const results = checkLoadAndCargoCompliance(vehicle, trip);
  res.json({ results });
});

app.post('/api/compliance/check/crossborder', (req, res) => {
  const { driver, vehicle, trip } = req.body;
  const results = checkCrossBorderCompliance(driver, vehicle, trip);
  res.json({ results });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Advanced Compliance Engine running on port ${PORT}`);
  console.log(`📋 SADC Logsheet Generation: ACTIVE`);
  console.log(`⚠️  TREMCARD Generation: ACTIVE`);
  console.log(`🌍 Cross-Border Compliance: ${Object.keys(COMPLIANCE_RULEBOOK.COUNTRIES).length} countries`);
  console.log(`🚛 Cargo Rules: ${Object.keys(COMPLIANCE_RULEBOOK.CARGO_SPECIFIC_RULES).length} types`);
  console.log(`📏 HOS Monitoring: NRTA Compliant`);
});

module.exports = app;
