export type BudgetProposal = {
  id: string;
  author: string;
  allocations: Record<string, number>;
};

let proposals: BudgetProposal[] = [];

export function submitBudget(author: string, allocations: Record<string, number>) {
  const proposal: BudgetProposal = {
    id: Math.random().toString(36).slice(2),
    author,
    allocations,
  };
  proposals.push(proposal);
  return proposal;
}

export function listBudgets() {
  return proposals;
}