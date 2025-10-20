export type InsuranceContract = {
    id: string;
    loanId: string;
    insurer: string;
    premium: number;
    coverage: number;
    active: boolean;
  };
  
  let contracts: InsuranceContract[] = [];
  
  export function createInsurance(loanId: string, insurer: string, premium: number, coverage: number) {
    const contract: InsuranceContract = {
      id: Math.random().toString(36).slice(2),
      loanId,
      insurer,
      premium,
      coverage,
      active: true,
    };
    contracts.push(contract);
    return contract;
  }
  
  export function triggerPayout(loanId: string) {
    const contract = contracts.find(c => c.loanId === loanId && c.active);
    if (!contract) throw new Error("No active insurance");
    contract.active = false;
    return contract.coverage;
  }
  
  export function listContracts() {
    return contracts;
  }