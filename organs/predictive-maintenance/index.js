/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Predictive Maintenance Service
 * Advanced equipment failure prediction using physics, mathematics, and AI
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 */

import express from 'express';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3013;

app.use(express.json({ limit: '50mb' }));

// ============================================================================
// ADVANCED PREDICTIVE MAINTENANCE ENGINE
// ============================================================================

class PredictiveMaintenanceEngine {
  constructor() {
    this.equipmentModels = new Map(); // Equipment ID -> model data
    this.failurePatterns = new Map(); // Pattern ID -> failure signatures
    this.maintenanceSchedules = new Map(); // Equipment ID -> schedule
    this.sensorData = new Map(); // Equipment ID -> time series data
    this.failurePredictions = new Map(); // Equipment ID -> predictions
    this.maintenanceHistory = new Map(); // Equipment ID -> maintenance records
  }

  // Register equipment for predictive monitoring
  registerEquipment(equipmentId, equipmentData) {
    const equipment = {
      id: equipmentId,
      type: equipmentData.type, // 'engine', 'transmission', 'battery', 'tires', 'brakes'
      model: equipmentData.model,
      manufacturer: equipmentData.manufacturer,
      installationDate: equipmentData.installationDate || new Date(),
      expectedLifespan: equipmentData.expectedLifespan || 365 * 24 * 60 * 60 * 1000, // 1 year in ms
      operatingHours: 0,
      cycles: 0,
      mileage: 0,
      healthScore: 100,
      riskLevel: 'low',
      sensors: equipmentData.sensors || this.getDefaultSensors(equipmentData.type),
      maintenanceSchedule: this.generateMaintenanceSchedule(equipmentData.type),
      failureHistory: [],
      lastMaintenance: null,
      nextMaintenance: null,
      status: 'operational'
    };

    this.equipmentModels.set(equipmentId, equipment);
    this.initializeSensorData(equipmentId);
    return equipment;
  }

  // Get default sensors for equipment type
  getDefaultSensors(type) {
    const sensorConfigs = {
      'engine': [
        { name: 'temperature', unit: '°C', normalRange: [80, 105], criticalThreshold: 120 },
        { name: 'oil_pressure', unit: 'psi', normalRange: [25, 65], criticalThreshold: 15 },
        { name: 'rpm', unit: 'rpm', normalRange: [800, 3500], criticalThreshold: 4000 },
        { name: 'vibration', unit: 'mm/s', normalRange: [0, 2.8], criticalThreshold: 4.5 },
        { name: 'fuel_consumption', unit: 'L/h', normalRange: [8, 25], criticalThreshold: 35 }
      ],
      'transmission': [
        { name: 'fluid_temperature', unit: '°C', normalRange: [70, 110], criticalThreshold: 130 },
        { name: 'fluid_level', unit: '%', normalRange: [90, 100], criticalThreshold: 70 },
        { name: 'shift_time', unit: 'ms', normalRange: [150, 300], criticalThreshold: 500 },
        { name: 'torque_output', unit: 'Nm', normalRange: [200, 600], criticalThreshold: 150 }
      ],
      'battery': [
        { name: 'voltage', unit: 'V', normalRange: [12.4, 12.8], criticalThreshold: 11.8 },
        { name: 'current', unit: 'A', normalRange: [-50, 100], criticalThreshold: 150 },
        { name: 'temperature', unit: '°C', normalRange: [20, 45], criticalThreshold: 60 },
        { name: 'state_of_charge', unit: '%', normalRange: [20, 100], criticalThreshold: 10 },
        { name: 'internal_resistance', unit: 'mΩ', normalRange: [0.5, 2.0], criticalThreshold: 5.0 }
      ],
      'tires': [
        { name: 'pressure', unit: 'psi', normalRange: [30, 35], criticalThreshold: 25 },
        { name: 'temperature', unit: '°C', normalRange: [20, 60], criticalThreshold: 80 },
        { name: 'tread_depth', unit: 'mm', normalRange: [6, 10], criticalThreshold: 2 },
        { name: 'alignment', unit: 'degrees', normalRange: [-0.5, 0.5], criticalThreshold: 2.0 }
      ],
      'brakes': [
        { name: 'pad_thickness', unit: 'mm', normalRange: [8, 12], criticalThreshold: 3 },
        { name: 'fluid_level', unit: '%', normalRange: [90, 100], criticalThreshold: 50 },
        { name: 'stopping_distance', unit: 'm', normalRange: [25, 40], criticalThreshold: 60 },
        { name: 'temperature', unit: '°C', normalRange: [50, 200], criticalThreshold: 300 }
      ]
    };

    return sensorConfigs[type] || [];
  }

  // Initialize sensor data storage
  initializeSensorData(equipmentId) {
    const equipment = this.equipmentModels.get(equipmentId);
    if (!equipment) return;

    const sensorData = {
      equipmentId,
      readings: new Map(), // sensor_name -> time series data
      lastUpdate: new Date(),
      dataPoints: 0
    };

    // Initialize empty arrays for each sensor
    equipment.sensors.forEach(sensor => {
      sensorData.readings.set(sensor.name, []);
    });

    this.sensorData.set(equipmentId, sensorData);
  }

  // Update sensor readings
  updateSensorReadings(equipmentId, readings) {
    const equipment = this.equipmentModels.get(equipmentId);
    const sensorData = this.sensorData.get(equipmentId);

    if (!equipment || !sensorData) return null;

    const timestamp = new Date();
    const processedReadings = [];

    // Process each sensor reading
    Object.entries(readings).forEach(([sensorName, value]) => {
      const sensor = equipment.sensors.find(s => s.name === sensorName);
      if (!sensor) return;

      const reading = {
        timestamp,
        value,
        unit: sensor.unit,
        normalRange: sensor.normalRange,
        isAnomaly: this.detectAnomaly(value, sensor),
        deviation: this.calculateDeviation(value, sensor)
      };

      // Store reading in time series
      const timeSeries = sensorData.readings.get(sensorName) || [];
      timeSeries.push(reading);

      // Keep only last 1000 readings (rolling window)
      if (timeSeries.length > 1000) {
        timeSeries.shift();
      }

      sensorData.readings.set(sensorName, timeSeries);
      processedReadings.push(reading);

      // Update equipment metrics
      this.updateEquipmentMetrics(equipment, sensorName, value);
    });

    sensorData.lastUpdate = timestamp;
    sensorData.dataPoints += processedReadings.length;

    // Perform predictive analysis
    this.performPredictiveAnalysis(equipmentId);

    return processedReadings;
  }

  // Detect anomalies using statistical methods
  detectAnomaly(value, sensor) {
    const [min] = sensor.normalRange;
    const critical = sensor.criticalThreshold;

    // Simple threshold-based detection
    if (sensor.name.includes('temperature') || sensor.name.includes('pressure')) {
      return value > critical || value < (min * 0.5);
    } else if (sensor.name.includes('level') || sensor.name.includes('charge')) {
      return value < critical;
    } else {
      return value > critical || value < min * 0.7;
    }
  }

  // Calculate deviation from normal range
  calculateDeviation(value, sensor) {
    const [min, max] = sensor.normalRange;
    const center = (min + max) / 2;

    if (value < min) return (min - value) / center;
    if (value > max) return (value - max) / center;
    return 0;
  }

  // Update equipment operating metrics
  updateEquipmentMetrics(equipment, sensorName, value) {
    const now = Date.now();

    // Update operating hours (simplified)
    if (sensorName === 'rpm' && value > 500) {
      const timeDiff = now - (equipment.lastOperatingUpdate || now);
      equipment.operatingHours += timeDiff / (1000 * 60 * 60); // hours
      equipment.lastOperatingUpdate = now;
    }

    // Update cycles for applicable equipment
    if (sensorName === 'rpm' && value > 2000) {
      equipment.cycles += 1;
    }

    // Update mileage estimate (rough calculation)
    if (sensorName === 'rpm' && value > 800) {
      const speedKmh = (value * 0.005) * 60; // rough conversion
      const timeDiff = now - (equipment.lastOperatingUpdate || now);
      equipment.mileage += (speedKmh * timeDiff) / (1000 * 60 * 60); // km
    }
  }

  // Perform predictive analysis using multiple algorithms
  performPredictiveAnalysis(equipmentId) {
    const equipment = this.equipmentModels.get(equipmentId);
    const sensorData = this.sensorData.get(equipmentId);

    if (!equipment || !sensorData) return;

    const predictions = {
      equipmentId,
      timestamp: new Date(),
      failureProbabilities: {},
      remainingUsefulLife: {},
      recommendedActions: [],
      confidence: 0,
      riskLevel: 'low'
    };

    // Analyze each sensor for failure patterns
    equipment.sensors.forEach(sensor => {
      const timeSeries = sensorData.readings.get(sensor.name) || [];
      if (timeSeries.length < 10) return; // Need minimum data

      const failureProb = this.calculateFailureProbability(timeSeries, sensor);
      const rul = this.predictRemainingUsefulLife(timeSeries, sensor, equipment);

      predictions.failureProbabilities[sensor.name] = failureProb;
      predictions.remainingUsefulLife[sensor.name] = rul;
    });

    // Calculate overall health score
    const healthScore = this.calculateHealthScore(predictions);
    equipment.healthScore = healthScore;

    // Determine risk level
    predictions.riskLevel = this.determineRiskLevel(healthScore, predictions);
    equipment.riskLevel = predictions.riskLevel;

    // Generate recommendations
    predictions.recommendedActions = this.generateMaintenanceRecommendations(equipment, predictions);

    // Calculate confidence
    predictions.confidence = this.calculatePredictionConfidence(sensorData);

    // Update next maintenance date
    equipment.nextMaintenance = this.scheduleNextMaintenance(equipment, predictions);

    this.failurePredictions.set(equipmentId, predictions);
    return predictions;
  }

  // Calculate failure probability using statistical methods
  calculateFailureProbability(timeSeries, sensor) {
    if (timeSeries.length < 20) return 0;

    // Calculate trend using linear regression
    const values = timeSeries.map(r => r.value);
    const trend = this.calculateLinearTrend(values);

    // Calculate variance and standard deviation
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Failure probability based on trend and deviation
    let probability = 0;

    // If trending towards critical values
    if (sensor.criticalThreshold) {
      const distanceToCritical = Math.abs(sensor.criticalThreshold - values[values.length - 1]);
      const criticalTrend = trend > 0 ? sensor.criticalThreshold - values[0] : values[0] - sensor.criticalThreshold;

      if (criticalTrend > 0 && trend > 0) {
        probability = Math.min(0.9, (criticalTrend / distanceToCritical) * 0.5);
      }
    }

    // Add variance component
    probability += (stdDev / mean) * 0.3;

    // Add anomaly component
    const anomalyRate = timeSeries.filter(r => r.isAnomaly).length / timeSeries.length;
    probability += anomalyRate * 0.4;

    return Math.min(1.0, Math.max(0, probability));
  }

  // Predict remaining useful life using degradation modeling
  predictRemainingUsefulLife(timeSeries, sensor, equipment) {
    if (timeSeries.length < 30) return null;

    const values = timeSeries.map(r => r.value);
    const trend = this.calculateLinearTrend(values);

    if (Math.abs(trend) < 0.001) return null; // No significant trend

    // Calculate time to failure based on trend
    let timeToFailure = null;

    if (sensor.criticalThreshold) {
      const currentValue = values[values.length - 1];
      const distanceToFailure = sensor.criticalThreshold - currentValue;

      if ((trend > 0 && distanceToFailure > 0) || (trend < 0 && distanceToFailure < 0)) {
        timeToFailure = Math.abs(distanceToFailure / trend);
      }
    }

    // Convert to useful time units
    if (timeToFailure) {
      return {
        hours: timeToFailure,
        days: timeToFailure / 24,
        cycles: equipment.type === 'engine' ? timeToFailure * 0.1 : null, // rough estimate
        confidence: this.calculateRULConfidence(timeSeries)
      };
    }

    return null;
  }

  // Calculate linear trend
  calculateLinearTrend(values) {
    const n = values.length;
    if (n < 2) return 0;

    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  // Calculate health score from predictions
  calculateHealthScore(predictions) {
    const failureProbs = Object.values(predictions.failureProbabilities);
    if (failureProbs.length === 0) return 100;

    const avgFailureProb = failureProbs.reduce((sum, p) => sum + p, 0) / failureProbs.length;
    const maxFailureProb = Math.max(...failureProbs);

    // Health score inversely related to failure probability
    const healthScore = 100 * (1 - Math.max(avgFailureProb, maxFailureProb * 0.7));
    return Math.max(0, Math.min(100, healthScore));
  }

  // Determine risk level
  determineRiskLevel(healthScore, predictions) {
    const maxFailureProb = Math.max(...Object.values(predictions.failureProbabilities));

    if (healthScore < 30 || maxFailureProb > 0.8) return 'critical';
    if (healthScore < 50 || maxFailureProb > 0.6) return 'high';
    if (healthScore < 70 || maxFailureProb > 0.4) return 'medium';
    return 'low';
  }

  // Generate maintenance recommendations
  generateMaintenanceRecommendations(equipment, predictions) {
    const recommendations = [];

    // Immediate actions for critical issues
    if (predictions.riskLevel === 'critical') {
      recommendations.push({
        priority: 'immediate',
        action: 'Schedule emergency maintenance',
        reason: 'Critical failure risk detected',
        estimatedCost: this.estimateMaintenanceCost(equipment, 'emergency')
      });
    }

    // Preventive maintenance scheduling
    if (predictions.riskLevel === 'high') {
      recommendations.push({
        priority: 'high',
        action: 'Schedule preventive maintenance within 7 days',
        reason: 'High failure risk detected',
        estimatedCost: this.estimateMaintenanceCost(equipment, 'preventive')
      });
    }

    // Component-specific recommendations
    Object.entries(predictions.failureProbabilities).forEach(([sensor, prob]) => {
      if (prob > 0.5) {
        recommendations.push({
          priority: prob > 0.8 ? 'immediate' : 'high',
          action: `Inspect ${sensor.replace('_', ' ')} system`,
          reason: `${(prob * 100).toFixed(1)}% failure probability`,
          estimatedCost: this.estimateComponentCost(sensor)
        });
      }
    });

    // Schedule regular maintenance if overdue
    const daysSinceLastMaintenance = equipment.lastMaintenance
      ? (Date.now() - equipment.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    if (daysSinceLastMaintenance > 90) {
      recommendations.push({
        priority: 'medium',
        action: 'Schedule regular maintenance check',
        reason: `${Math.round(daysSinceLastMaintenance)} days since last maintenance`,
        estimatedCost: this.estimateMaintenanceCost(equipment, 'regular')
      });
    }

    return recommendations;
  }

  // Schedule next maintenance
  scheduleNextMaintenance(equipment, predictions) {
    const now = new Date();
    let nextMaintenance = new Date(now);

    // Base schedule on risk level
    switch (predictions.riskLevel) {
      case 'critical':
        nextMaintenance.setHours(now.getHours() + 24); // Within 24 hours
        break;
      case 'high':
        nextMaintenance.setDate(now.getDate() + 7); // Within 1 week
        break;
      case 'medium':
        nextMaintenance.setDate(now.getDate() + 30); // Within 1 month
        break;
      default:
        nextMaintenance.setDate(now.getDate() + 90); // Within 3 months
    }

    return nextMaintenance;
  }

  // Calculate prediction confidence
  calculatePredictionConfidence(sensorData) {
    const totalReadings = Array.from(sensorData.readings.values())
      .reduce((sum, readings) => sum + readings.length, 0);

    const avgReadings = totalReadings / sensorData.readings.size;

    // Confidence based on data quantity and quality
    let confidence = Math.min(0.9, avgReadings / 100); // Max 90% confidence

    // Reduce confidence if data is sparse
    if (avgReadings < 50) confidence *= 0.7;
    if (avgReadings < 20) confidence *= 0.5;

    return confidence;
  }

  // Calculate RUL confidence
  calculateRULConfidence(timeSeries) {
    const dataPoints = timeSeries.length;
    const anomalies = timeSeries.filter(r => r.isAnomaly).length;
    const anomalyRate = anomalies / dataPoints;

    // High confidence with lots of data and few anomalies
    let confidence = Math.min(0.95, dataPoints / 200);
    confidence *= (1 - anomalyRate * 0.5);

    return Math.max(0.1, confidence);
  }

  // Estimate maintenance costs
  estimateMaintenanceCost(equipment, type) {
    const baseCosts = {
      'engine': { emergency: 15000, preventive: 3000, regular: 800 },
      'transmission': { emergency: 12000, preventive: 2500, regular: 600 },
      'battery': { emergency: 3000, preventive: 800, regular: 200 },
      'tires': { emergency: 2000, preventive: 400, regular: 150 },
      'brakes': { emergency: 2500, preventive: 500, regular: 180 }
    };

    return baseCosts[equipment.type]?.[type] || 1000;
  }

  // Estimate component costs
  estimateComponentCost(sensorName) {
    const componentCosts = {
      'temperature': 500,
      'oil_pressure': 800,
      'rpm': 1200,
      'vibration': 600,
      'fuel_consumption': 400,
      'fluid_temperature': 700,
      'fluid_level': 300,
      'shift_time': 1500,
      'torque_output': 1000,
      'voltage': 400,
      'current': 500,
      'state_of_charge': 600,
      'internal_resistance': 800,
      'pressure': 200,
      'tread_depth': 150,
      'alignment': 250,
      'pad_thickness': 300,
      'stopping_distance': 400
    };

    return componentCosts[sensorName] || 300;
  }

  // Generate maintenance schedule
  generateMaintenanceSchedule(type) {
    const schedules = {
      'engine': [
        { interval: 5000, type: 'oil_change', description: 'Engine oil and filter change' },
        { interval: 15000, type: 'inspection', description: 'Full engine inspection' },
        { interval: 30000, type: 'major_service', description: 'Major engine service' },
        { interval: 60000, type: 'overhaul', description: 'Engine overhaul consideration' }
      ],
      'transmission': [
        { interval: 30000, type: 'fluid_change', description: 'Transmission fluid change' },
        { interval: 60000, type: 'inspection', description: 'Transmission inspection' },
        { interval: 100000, type: 'rebuild', description: 'Transmission rebuild consideration' }
      ],
      'battery': [
        { interval: 6, type: 'test', description: 'Battery capacity test', unit: 'months' },
        { interval: 24, type: 'replacement', description: 'Battery replacement consideration', unit: 'months' }
      ],
      'tires': [
        { interval: 10000, type: 'rotation', description: 'Tire rotation' },
        { interval: 40000, type: 'replacement', description: 'Tire replacement consideration' }
      ],
      'brakes': [
        { interval: 15000, type: 'inspection', description: 'Brake inspection' },
        { interval: 30000, type: 'pad_replacement', description: 'Brake pad replacement' },
        { interval: 60000, type: 'system_overhaul', description: 'Complete brake system overhaul' }
      ]
    };

    return schedules[type] || [];
  }

  // Record maintenance completion
  recordMaintenance(equipmentId, maintenanceData) {
    const equipment = this.equipmentModels.get(equipmentId);
    if (!equipment) return null;

    const maintenance = {
      id: `MAINT_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      equipmentId,
      type: maintenanceData.type,
      description: maintenanceData.description,
      performedBy: maintenanceData.performedBy,
      cost: maintenanceData.cost,
      parts: maintenanceData.parts || [],
      findings: maintenanceData.findings || [],
      completedAt: new Date(),
      nextDue: maintenanceData.nextDue
    };

    // Update equipment
    equipment.lastMaintenance = maintenance.completedAt;
    equipment.healthScore = Math.min(100, equipment.healthScore + 20); // Maintenance improves health
    equipment.operatingHours = 0; // Reset counters after major maintenance

    // Store maintenance history
    if (!this.maintenanceHistory.has(equipmentId)) {
      this.maintenanceHistory.set(equipmentId, []);
    }
    this.maintenanceHistory.get(equipmentId).push(maintenance);

    return maintenance;
  }
}

// ============================================================================
// MAINTENANCE SCHEDULING ENGINE
// ============================================================================

class MaintenanceSchedulingEngine {
  constructor() {
    this.schedules = new Map(); // Equipment ID -> schedule
    this.workOrders = new Map(); // Work order ID -> details
    this.technicians = new Map(); // Technician ID -> availability
    this.parts = new Map(); // Part ID -> inventory
  }

  // Create maintenance schedule
  createSchedule(equipmentId, scheduleData) {
    const schedule = {
      id: `SCHED_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      equipmentId,
      type: scheduleData.type,
      frequency: scheduleData.frequency,
      tasks: scheduleData.tasks || [],
      priority: scheduleData.priority || 'medium',
      estimatedDuration: scheduleData.estimatedDuration || 2, // hours
      requiredParts: scheduleData.requiredParts || [],
      assignedTechnician: null,
      status: 'scheduled',
      createdAt: new Date(),
      dueDate: scheduleData.dueDate,
      completedAt: null
    };

    if (!this.schedules.has(equipmentId)) {
      this.schedules.set(equipmentId, []);
    }
    this.schedules.get(equipmentId).push(schedule);

    return schedule;
  }

  // Optimize maintenance scheduling
  optimizeSchedule(equipmentList, technicianList, _constraints) {
    const optimization = {
      schedule: [],
      conflicts: [],
      efficiency: 0,
      totalCost: 0,
      completionTime: 0
    };

    // Simple scheduling algorithm (can be enhanced with more sophisticated algorithms)
    const sortedEquipment = equipmentList.sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    let currentTime = new Date();

    sortedEquipment.forEach(equipment => {
      const availableTechnician = this.findAvailableTechnician(technicianList, currentTime, equipment.estimatedDuration);

      if (availableTechnician) {
        const workOrder = {
          equipmentId: equipment.id,
          technicianId: availableTechnician.id,
          startTime: currentTime,
          endTime: new Date(currentTime.getTime() + equipment.estimatedDuration * 60 * 60 * 1000),
          tasks: equipment.tasks,
          status: 'scheduled'
        };

        optimization.schedule.push(workOrder);
        optimization.totalCost += equipment.estimatedCost || 1000;

        // Update technician availability
        availableTechnician.nextAvailable = workOrder.endTime;

        currentTime = new Date(Math.max(currentTime.getTime(), workOrder.endTime.getTime()));
      } else {
        optimization.conflicts.push({
          equipmentId: equipment.id,
          reason: 'No available technician',
          suggestedTime: this.findNextAvailableSlot(technicianList, currentTime)
        });
      }
    });

    optimization.completionTime = (currentTime - new Date()) / (1000 * 60 * 60); // hours
    optimization.efficiency = this.calculateSchedulingEfficiency(optimization);

    return optimization;
  }

  // Find available technician
  findAvailableTechnician(technicians, startTime, _durationHours) {
    return technicians.find(tech => {
      const nextAvailable = tech.nextAvailable || startTime;
      return nextAvailable <= startTime;
    });
  }

  // Find next available slot
  findNextAvailableSlot(technicians, afterTime) {
    const availableTimes = technicians.map(tech => tech.nextAvailable || afterTime);
    return new Date(Math.min(...availableTimes.map(t => t.getTime())));
  }

  // Calculate scheduling efficiency
  calculateSchedulingEfficiency(optimization) {
    const scheduled = optimization.schedule.length;
    const total = scheduled + optimization.conflicts.length;

    if (total === 0) return 1.0;

    const efficiency = scheduled / total;
    const timeEfficiency = Math.max(0.5, 1 - (optimization.completionTime / 168)); // 168 hours = 1 week

    return (efficiency + timeEfficiency) / 2;
  }
}

// ============================================================================
// MAIN SERVICE INSTANCE
// ============================================================================

const predictiveMaintenance = new PredictiveMaintenanceEngine();
const maintenanceScheduling = new MaintenanceSchedulingEngine();

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Predictive Maintenance Service',
    status: 'operational',
    version: '1.0.0',
    capabilities: [
      'Advanced failure prediction algorithms',
      'Real-time equipment monitoring',
      'Remaining useful life estimation',
      'Automated maintenance scheduling',
      'Cost optimization',
      'Risk assessment and mitigation'
    ]
  });
});

// Register equipment
app.post('/equipment/register', (req, res) => {
  const { equipmentId, equipmentData } = req.body;
  const equipment = predictiveMaintenance.registerEquipment(equipmentId, equipmentData);
  res.json({ success: true, equipment });
});

// Update sensor readings
app.post('/equipment/:equipmentId/sensors', (req, res) => {
  const { equipmentId } = req.params;
  const readings = req.body;
  const processedReadings = predictiveMaintenance.updateSensorReadings(equipmentId, readings);
  res.json({ success: true, readings: processedReadings });
});

// Get equipment status
app.get('/equipment/:equipmentId', (req, res) => {
  const equipment = predictiveMaintenance.equipmentModels.get(req.params.equipmentId);
  const predictions = predictiveMaintenance.failurePredictions.get(req.params.equipmentId);

  if (!equipment) {
    return res.status(404).json({ error: 'Equipment not found' });
  }

  res.json({ equipment, predictions });
});

// Get maintenance recommendations
app.get('/equipment/:equipmentId/recommendations', (req, res) => {
  const predictions = predictiveMaintenance.failurePredictions.get(req.params.equipmentId);

  if (!predictions) {
    return res.status(404).json({ error: 'No predictions available' });
  }

  res.json({ recommendations: predictions.recommendedActions });
});

// Record maintenance
app.post('/maintenance/record', (req, res) => {
  const maintenanceData = req.body;
  const maintenance = predictiveMaintenance.recordMaintenance(maintenanceData.equipmentId, maintenanceData);
  res.json({ success: true, maintenance });
});

// Create maintenance schedule
app.post('/schedule/create', (req, res) => {
  const { equipmentId, scheduleData } = req.body;
  const schedule = maintenanceScheduling.createSchedule(equipmentId, scheduleData);
  res.json({ success: true, schedule });
});

// Optimize maintenance schedule
app.post('/schedule/optimize', (req, res) => {
  const { equipment, technicians, constraints } = req.body;
  const optimization = maintenanceScheduling.optimizeSchedule(equipment, technicians, constraints);
  res.json({ success: true, optimization });
});

// Get all equipment status
app.get('/equipment', (req, res) => {
  const equipment = Array.from(predictiveMaintenance.equipmentModels.values());
  const summary = equipment.map(eq => ({
    id: eq.id,
    type: eq.type,
    healthScore: eq.healthScore,
    riskLevel: eq.riskLevel,
    nextMaintenance: eq.nextMaintenance,
    status: eq.status
  }));

  res.json({ equipment: summary });
});

// Get maintenance history
app.get('/maintenance/:equipmentId/history', (req, res) => {
  const history = predictiveMaintenance.maintenanceHistory.get(req.params.equipmentId) || [];
  res.json({ history });
});

// ============================================================================
// START SERVICE
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🔧 Predictive Maintenance Service');
  console.log('==================================');
  console.log(`Port: ${PORT}`);
  console.log('Status: Online');
  console.log('');
  console.log('Capabilities:');
  console.log('  ✅ Advanced failure prediction algorithms');
  console.log('  ✅ Real-time equipment monitoring');
  console.log('  ✅ Remaining useful life estimation');
  console.log('  ✅ Automated maintenance scheduling');
  console.log('  ✅ Cost optimization');
  console.log('  ✅ Risk assessment and mitigation');
  console.log('');
  console.log('🇿🇦 Built by Sizwe Ngwenya for Azora World');
  console.log('Predicting the future of equipment reliability!');
  console.log('');
});