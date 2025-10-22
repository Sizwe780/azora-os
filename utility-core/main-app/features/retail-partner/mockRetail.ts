/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export interface InventoryItem {
  sku: string;
  name: string;
  stock: number;
  demand: 'High' | 'Medium' | 'Low';
  suggestedReorder: number;
}

export interface WellnessData {
  totalEmployees: number;
  highFatigueCount: number;
  averageFatigue: number;
  recommendation: string;
}

export interface CustomerFlowPoint {
  hour: string;
  predictedCustomers: number;
}

export interface RetailData {
  inventory: InventoryItem[];
  customerFlow: CustomerFlowPoint[];
  wellness: WellnessData;
  aiInsight: string;
  revenueToday: number;
}

export const getMockRetailData = (): RetailData => {
  const inventory: InventoryItem[] = [
    { sku: 'AZ-QCHIP-01', name: 'Quantum Chip', stock: 42, demand: 'High', suggestedReorder: 50 },
    { sku: 'AZ-NANO-BATT', name: 'Nano Battery', stock: 15, demand: 'High', suggestedReorder: 40 },
    { sku: 'AZ-DRV-CORE', name: 'Drive Core', stock: 120, demand: 'Medium', suggestedReorder: 100 },
    { sku: 'AZ-SEN-ARRAY', name: 'Sensor Array', stock: 75, demand: 'Medium', suggestedReorder: 80 },
    { sku: 'AZ-BIO-GEL', name: 'Bio-Gel Pack', stock: 200, demand: 'Low', suggestedReorder: 150 },
    { sku: 'AZ-PLT-SHELL', name: 'Plasteel Shell', stock: 5, demand: 'High', suggestedReorder: 20 },
  ];

  const customerFlow: CustomerFlowPoint[] = Array.from({ length: 12 }, (_, i) => ({
    hour: `${(i + 9).toString().padStart(2, '0')}`,
    predictedCustomers: Math.floor(Math.random() * 50) + 10 + i * 5,
  }));

  const wellness: WellnessData = {
    totalEmployees: 78,
    highFatigueCount: 6,
    averageFatigue: 38,
    recommendation: 'High fatigue detected in logistics. Suggest rotating staff and scheduling a mandatory 15-minute break.',
  };

  return {
    inventory,
    customerFlow,
    wellness,
    aiInsight: 'Customer flow is predicted to peak at 2 PM. High demand for Nano Batteries suggests a potential stockout in 48 hours. Recommend initiating a flash sale on Bio-Gel Packs to balance inventory.',
    revenueToday: 24530.75,
  };
};
