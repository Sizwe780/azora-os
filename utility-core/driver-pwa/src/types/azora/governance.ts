export type Proposal = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'open' | 'closed' | 'executed';
  totalStaked: number;
};
