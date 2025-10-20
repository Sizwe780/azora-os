import { ReputationBalance, StakeAction, Delegation } from '../../types/azora/reputationEconomy';

// --- MOCK API ---
// In a real scenario, these would be authenticated API calls to a secure backend.
// For now, we simulate the backend logic and latency.

let mockBalance: ReputationBalance = {
    userId: '0xAZORA',
    available: 10000,
    staked: 2500,
    delegated: 500,
};

const simulateNetworkDelay = () => new Promise(res => setTimeout(res, 500 + Math.random() * 500));

export async function fetchReputationBalance(userId: string): Promise<ReputationBalance> {
  await simulateNetworkDelay();
  console.log(`[API STUB] Fetching reputation balance for ${userId}`);
  return { ...mockBalance, userId };
}

export async function stakeReputation(userId: string, proposalId: string, amount: number): Promise<StakeAction> {
  await simulateNetworkDelay();
  if (amount > mockBalance.available) {
    throw new Error('Insufficient available reputation to stake.');
  }
  mockBalance.available -= amount;
  mockBalance.staked += amount;
  console.log(`[API STUB] ${userId} staked ${amount} REP on proposal ${proposalId}`);
  const action: StakeAction = {
    id: crypto.randomUUID(),
    fromUserId: userId,
    toProposalId: proposalId,
    amount,
    timestamp: new Date().toISOString(),
  };
  return action;
}

export async function delegateReputation(fromUserId: string, toUserId: string, amount: number): Promise<Delegation> {
  await simulateNetworkDelay();
   if (amount > mockBalance.available) {
    throw new Error('Insufficient available reputation to delegate.');
  }
  mockBalance.available -= amount;
  mockBalance.delegated += amount;
  console.log(`[API STUB] ${fromUserId} delegated ${amount} REP to ${toUserId}`);
  const delegation: Delegation = {
      id: crypto.randomUUID(),
      fromUserId,
      toUserId,
      amount,
      timestamp: new Date().toISOString(),
  };
  return delegation;
}
