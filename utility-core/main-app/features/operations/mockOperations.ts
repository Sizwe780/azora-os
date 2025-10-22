/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export interface SystemHealth {
  api: boolean;
  database: boolean;
  security: boolean;
  monitoring: boolean;
  ai_models: boolean;
  quantum_microservice: boolean;
}

export interface OperationsData {
  systemHealth: SystemHealth;
  automation: number;
  uptime: number;
  responseTime: number;
  errorRate: number;
  tasksAutomated: number;
  tasksTotal: number;
}

const generateMockData = (): OperationsData => {
  const systemHealth: SystemHealth = {
    api: Math.random() > 0.05, // 95% chance of being online
    database: Math.random() > 0.03,
    security: Math.random() > 0.01,
    monitoring: Math.random() > 0.02,
    ai_models: Math.random() > 0.1,
    quantum_microservice: Math.random() > 0.05,
  };

  // Ensure at least one system is offline for demonstration purposes occasionally
  if (Object.values(systemHealth).every(s => s) && Math.random() > 0.7) {
      const systems = Object.keys(systemHealth) as (keyof SystemHealth)[];
      const randomSystem = systems[Math.floor(Math.random() * systems.length)];
      systemHealth[randomSystem] = false;
  }


  return {
    systemHealth,
    automation: 92.3,
    uptime: 99.98,
    responseTime: Math.floor(Math.random() * 30) + 50, // 50-80ms
    errorRate: Math.random() * 0.05, // 0-0.05%
    tasksAutomated: 18460,
    tasksTotal: 20000,
  };
};

export const getMockOperationsData = (): Promise<OperationsData> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(generateMockData());
        }, 300);
    });
};
