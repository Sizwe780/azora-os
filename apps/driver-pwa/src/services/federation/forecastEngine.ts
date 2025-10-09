export type PolicyScenario = {
    interestRate: number;
    liquidityInjection: number;
    qeAmount: number;
  };
  
  export function simulateScenario(scenario: PolicyScenario) {
    const inflation = 0.02 + scenario.liquidityInjection / 50000 + scenario.qeAmount / 100000 - scenario.interestRate * 0.01;
    const growth = 0.03 + scenario.qeAmount / 20000 - scenario.interestRate * 0.005;
    const debtRatio = 0.5 + scenario.liquidityInjection / 100000;
  
    return {
      inflation: parseFloat(inflation.toFixed(3)),
      growth: parseFloat(growth.toFixed(3)),
      debtRatio: parseFloat(debtRatio.toFixed(3)),
    };
  }