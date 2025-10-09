import { ProtocolUpgradeProposal } from '../../types/azora/protocolUpgrade';

let mockUpgrades: ProtocolUpgradeProposal[] = [
  {
    id: 'upgrade_001',
    title: 'Enable AI Enforcement Rights',
    description: 'Allow AI citizens to trigger enforcement actions on reputation violations.',
    createdAt: new Date().toISOString(),
    status: 'open',
    affectedRules: ['rule_ai_enforce'],
    totalStaked: 4200,
  },
];

const simulateDelay = () => new Promise(res => setTimeout(res, 300 + Math.random() * 300));

export async function fetchProtocolUpgrades(): Promise<ProtocolUpgradeProposal[]> {
  await simulateDelay();
  return [...mockUpgrades];
}

export async function stakeOnUpgrade(proposalId: string, userId: string, amount: number) {
  await simulateDelay();
  const proposal = mockUpgrades.find(p => p.id === proposalId);
  if (!proposal || proposal.status !== 'open') throw new Error('Invalid or closed upgrade proposal');
  proposal.totalStaked += amount;
  return { success: true, proposal };
}
