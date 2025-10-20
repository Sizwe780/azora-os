// TODO: Replace with real inter-nation service implementation
// Remove mock data and implement actual federation API calls

export interface Nation {
  id: string;
  name: string;
  endpoint: string;
  joinedAt: string;
}

export interface CrossNationProposal {
  id: string;
  title: string;
  description: string;
  originNationId: string;
  totalStaked: number;
  status: 'open' | 'closed';
}

// TODO: Replace with real API calls
const nations: Nation[] = [];
const crossProposals: CrossNationProposal[] = [];

// --- Service Functions ---

export const interNationService = {
  getNations: async (): Promise<Nation[]> => {
    // TODO: Implement real API call to federation service
    await new Promise(res => setTimeout(res, 500));
    return [...nations];
  },

  getProposals: async (): Promise<CrossNationProposal[]> => {
    // TODO: Implement real API call to federation service
    await new Promise(res => setTimeout(res, 500));
    return [...crossProposals];
  },

  inviteNation: async (name: string, endpoint: string): Promise<Nation> => {
    if (!name || !endpoint) throw new Error('Nation name and endpoint are required.');
    
    console.log(`[InterNation] Inviting nation ${name} at ${endpoint}`);
    const newNation: Nation = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      endpoint,
      joinedAt: new Date().toISOString(),
    };
    nations.push(newNation);
    return newNation;
  },

  voteOnCrossProposal: async (proposalId: string, amount: number): Promise<CrossNationProposal> => {
    const proposal = crossProposals.find(p => p.id === proposalId);
    if (!proposal) throw new Error('Cross-nation proposal not found.');
    if (proposal.status !== 'open') throw new Error('This proposal is not open for voting.');

    console.log(`[InterNation] Staking ${amount} REP on cross-proposal ${proposalId}`);
    proposal.totalStaked += amount;
    return { ...proposal };
  },
};
