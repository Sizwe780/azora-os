export type Investment = {
    id: string;
    name: string;
    cost: number;
    expectedReturn: number;
    status: 'pending' | 'active' | 'completed' | 'failed';
  };
  
  let investments: Investment[] = [];
  
  export function proposeInvestment(name: string, cost: number, expectedReturn: number) {
    const inv: Investment = { id: Math.random().toString(36).slice(2), name, cost, expectedReturn, status: 'pending' };
    investments.push(inv);
    return inv;
  }
  
  export function completeInvestment(id: string, success: boolean) {
    const inv = investments.find(i => i.id === id);
    if (!inv) throw new Error("Investment not found");
    inv.status = success ? 'completed' : 'failed';
    return inv;
  }
  
  export function listInvestments() {
    return investments;
  }