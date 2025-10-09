// A mock service to simulate interactions between federated nations.
// Based on Batch 17 from implement.md

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

// Mock database for nations and proposals
const mockNations: Nation[] = [
  {
    id: 'solaris',
    name: 'Solaris Nation',
    endpoint: 'https://solaris-os.vercel.app/api',
    joinedAt: new Date().toISOString(),
  }
];

const mockCrossProposals: CrossNationProposal[] = [
  {
    id: 'sol-prop-001',
    title: 'Joint AI Research Fund',
    description: 'A proposal from Solaris to co-fund research into decentralized AI governance models.',
    originNationId: 'solaris',
    totalStaked: 15000,
    status: 'open',
  },
];

// --- Service Functions ---

export const interNationService = {
  getNations: async (): Promise<Nation[]> => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));
    return [...mockNations];
  },

  getProposals: async (): Promise<CrossNationProposal[]> => {
    await new Promise(res => setTimeout(res, 500));
    return [...mockCrossProposals];
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
    mockNations.push(newNation);
    return newNation;
  },

  voteOnCrossProposal: async (proposalId: string, amount: number): Promise<CrossNationProposal> => {
    const proposal = mockCrossProposals.find(p => p.id === proposalId);
    if (!proposal) throw new Error('Cross-nation proposal not found.');
    if (proposal.status !== 'open') throw new Error('This proposal is not open for voting.');

    console.log(`[InterNation] Staking ${amount} REP on cross-proposal ${proposalId}`);
    proposal.totalStaked += amount;
    return { ...proposal };
  },
};
