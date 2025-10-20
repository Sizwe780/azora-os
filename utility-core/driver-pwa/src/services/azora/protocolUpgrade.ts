import { ProtocolUpgradeProposal } from '../../types/azora/protocolUpgrade';

// TODO: Replace with real protocol upgrade API service
// Remove mock data and implement actual backend integration

const upgrades: ProtocolUpgradeProposal[] = [];

const simulateDelay = () => new Promise(res => setTimeout(res, 300 + Math.random() * 300));

export async function fetchProtocolUpgrades(): Promise<ProtocolUpgradeProposal[]> {
  await simulateDelay();
  // TODO: Implement real API call to protocol upgrade service
  return [...upgrades];
}

export async function stakeOnUpgrade(proposalId: string, userId: string, amount: number) {
  await simulateDelay();
  // TODO: Implement real API call to protocol upgrade service
  console.log(`User ${userId} staking ${amount} REP on upgrade ${proposalId}`);
  throw new Error('Not implemented: Real API integration required');
}
