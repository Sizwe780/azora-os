/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { subDays, format } from 'date-fns';

export interface ColdChainAsset {
  id: string;
  name: string;
  type: 'Pharmaceuticals' | 'Fresh Produce' | 'Medical Samples' | 'Chemicals';
  currentTemp: number;
  location: string;
  status: 'Optimal' | 'Warning' | 'Critical';
  lastSync: string;
  imageUrl: string;
}

export interface TemperaturePredictionPoint {
  time: number; // Hours from now
  temperature: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AutonomousIntervention {
  id: string;
  assetId: string;
  assetName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timeUntilFailure: number; // in hours
  action: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  financialImpact: {
    savedAmount: number;
  };
  timestamp: string;
}

export interface EnergyData {
  dailySavings: number;
  savingsPercent: number;
  projectedAnnualSavings: number;
  schedule: { hour: number; compressorSpeed: number }[];
}

export interface BlockchainData {
    status: 'VERIFIED' | 'COMPROMISED';
    totalBlocks: number;
    integrityPercentage: number;
    lastBlockHash: string;
}

const now = new Date();

export const mockAssets: ColdChainAsset[] = [
  { id: 'AZ-CC-001', name: 'COVID-19 Vaccine Batch #74A', type: 'Pharmaceuticals', currentTemp: 2.1, location: 'CPT Warehouse', status: 'Optimal', lastSync: subDays(now, 0).toISOString(), imageUrl: '/assets/cold-chain/vaccine.jpg' },
  { id: 'AZ-CC-002', name: 'Organic Avocados Shipment', type: 'Fresh Produce', currentTemp: 4.5, location: 'En route to JHB', status: 'Optimal', lastSync: subDays(now, 0).toISOString(), imageUrl: '/assets/cold-chain/produce.jpg' },
  { id: 'AZ-CC-003', name: 'Stem Cell Research Samples', type: 'Medical Samples', currentTemp: -78.2, location: 'Stellenbosch University', status: 'Warning', lastSync: subDays(now, 0).toISOString(), imageUrl: '/assets/cold-chain/samples.jpg' },
  { id: 'AZ-CC-004', name: 'Volatile Chemical Compound', type: 'Chemicals', currentTemp: -25.0, location: 'Secure Storage Unit B', status: 'Critical', lastSync: subDays(now, 0).toISOString(), imageUrl: '/assets/cold-chain/chemicals.jpg' },
];

export const generatePredictions = (baseTemp: number): TemperaturePredictionPoint[] => {
    return Array.from({ length: 72 }, (_, i) => {
        let temperature = baseTemp + Math.sin(i / 8) * 0.5 + (Math.random() - 0.5) * 0.4;
        if (i > 60) temperature += (i - 60) * 0.1; // Simulate a drift
        
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        if (Math.abs(temperature - baseTemp) > 1.5) riskLevel = 'HIGH';
        else if (Math.abs(temperature - baseTemp) > 0.8) riskLevel = 'MEDIUM';

        return {
            time: i,
            temperature,
            riskLevel,
        };
    });
};

export const mockInterventions: AutonomousIntervention[] = [
  { id: 'INT-001', assetId: 'AZ-CC-003', assetName: 'Stem Cell Research Samples', severity: 'CRITICAL', timeUntilFailure: 1.5, action: 'Compressor Boost & Coolant Flush', status: 'Completed', financialImpact: { savedAmount: 150000 }, timestamp: subDays(now, 1).toISOString() },
  { id: 'INT-002', assetId: 'AZ-CC-001', assetName: 'COVID-19 Vaccine Batch #74A', severity: 'MEDIUM', timeUntilFailure: 12, action: 'Route Optimization to Avoid Heatwave', status: 'Completed', financialImpact: { savedAmount: 25000 }, timestamp: subDays(now, 2).toISOString() },
  { id: 'INT-003', assetId: 'AZ-CC-004', assetName: 'Volatile Chemical Compound', severity: 'HIGH', timeUntilFailure: 4, action: 'Secondary Cooling Unit Activated', status: 'In Progress', financialImpact: { savedAmount: 500000 }, timestamp: subDays(now, 0).toISOString() },
];

export const mockEnergyData: EnergyData = {
  dailySavings: 120.50,
  savingsPercent: 42.5,
  projectedAnnualSavings: 43982.50,
  schedule: Array.from({ length: 24 }, (_, i) => ({ hour: i, compressorSpeed: 50 + Math.sin(i / 4) * 30 + Math.random() * 10 })),
};

export const mockBlockchainData: BlockchainData = {
    status: 'VERIFIED',
    totalBlocks: 12478,
    integrityPercentage: 100,
    lastBlockHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join(''),
}
