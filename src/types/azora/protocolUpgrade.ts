export type ProtocolUpgradeProposal = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'open' | 'closed' | 'executed';
  affectedRules: string[]; // rule IDs from Constitution
  totalStaked: number;
};
