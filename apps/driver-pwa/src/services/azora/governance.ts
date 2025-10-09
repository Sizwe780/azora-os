import { Proposal } from '../../types/azora/governance';

// --- MOCK API ---
// Simulating a backend for governance proposals.

let mockProposals: Proposal[] = [
    { id: 'prop_001', title: 'Protocol Upgrade v2.1', description: 'Integrate the next-gen AI Copilot module.', createdAt: new Date().toISOString(), status: 'open', totalStaked: 12500 },
    { id: 'prop_002', title: 'Adjust Profit Pool Distribution', description: 'Allocate a higher percentage to top 10% contributors.', createdAt: new Date().toISOString(), status: 'open', totalStaked: 8700 },
    { id: 'prop_003', title: 'Fund Community Initiative \"Azora LIFT\"', description: 'Fund a mentorship program for new citizens.', createdAt: new Date().toISOString(), status: 'closed', totalStaked: 25000 },
];

const simulateNetworkDelay = () => new Promise(res => setTimeout(res, 400 + Math.random() * 400));

export async function fetchProposals(): Promise<Proposal[]> {
  await simulateNetworkDelay();
  console.log('[API STUB] Fetching all governance proposals.');
  return [...mockProposals];
}

export async function voteOnProposal(proposalId: string, userId: string, amount: number) {
  await simulateNetworkDelay();
  const proposal = mockProposals.find(p => p.id === proposalId);
  if (!proposal) {
      throw new Error('Proposal not found.');
  }
  if (proposal.status !== 'open') {
      throw new Error('This proposal is not open for voting.');
  }

  proposal.totalStaked += amount;
  console.log(`[API STUB] User ${userId} voted ${amount} REP on proposal ${proposalId}. New total: ${proposal.totalStaked}`);
  
  return { success: true, proposal };
}
