export type MonetaryPolicy = {
    baseRate: number;
    liquidityPool: number;
    inflationRate: number;
  };
  
  let policy: MonetaryPolicy = {
    baseRate: 0.05,
    liquidityPool: 10000,
    inflationRate: 0.02,
  };
  
  export function adjustBaseRate(newRate: number) {
    policy.baseRate = newRate;
  }
  
  export function injectLiquidity(amount: number) {
    policy.liquidityPool += amount;
    policy.inflationRate += amount / 50000;
  }
  
  export function runQE(purchaseAmount: number) {
    policy.liquidityPool += purchaseAmount;
    policy.baseRate -= 0.01;
    policy.inflationRate += purchaseAmount / 100000;
  }
  
  export function getPolicyStatus() {
    return policy;
  }