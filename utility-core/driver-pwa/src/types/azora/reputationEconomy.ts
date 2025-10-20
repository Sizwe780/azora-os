export type ReputationBalance = {
  userId: string;
  available: number;   // free to stake
  staked: number;      // currently staked
  delegated: number;   // delegated to others
};

export type StakeAction = {
  id: string;
  fromUserId: string;
  toProposalId: string;
  amount: number;
  timestamp: string;
};

export type Delegation = {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  timestamp: string;
};
