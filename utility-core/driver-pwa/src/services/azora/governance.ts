import { Proposal } from '../../types/azora/governance';

// TODO: Replace with real governance API service
// Remove mock data and implement actual backend integration

const proposals: Proposal[] = [];

const simulateNetworkDelay = () => new Promise(res => setTimeout(res, 400 + Math.random() * 400));

export async function fetchProposals(): Promise<Proposal[]> {
  await simulateNetworkDelay();
  // TODO: Implement real API call to governance service
  console.log('Fetching all governance proposals.');
  return [...proposals];
}

export async function voteOnProposal(proposalId: string, userId: string, amount: number) {
  await simulateNetworkDelay();
  // TODO: Implement real API call to governance service
  console.log(`User ${userId} voting ${amount} REP on proposal ${proposalId}`);
  throw new Error('Not implemented: Real API integration required');
}
