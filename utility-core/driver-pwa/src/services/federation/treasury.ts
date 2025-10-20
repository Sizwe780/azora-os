export type TreasuryAllocation = { category: string; amount: number };

let treasuryBalance = 0;
let allocations: TreasuryAllocation[] = [];

export function addRevenue(amount: number) {
  treasuryBalance += amount;
}

export function proposeAllocation(category: string, amount: number) {
  if (amount > treasuryBalance) throw new Error("Insufficient funds");
  allocations.push({ category, amount });
}

export function finalizeBudget() {
  allocations.forEach(a => {
    treasuryBalance -= a.amount;
  });
  const result = allocations;
  allocations = [];
  return result;
}

export function getTreasuryStatus() {
  return { balance: treasuryBalance, pending: allocations };
}