import { Zap, User, DollarSign, Package, BarChart, BrainCircuit, Network } from 'lucide-react';

export type GenesisProposal = {
  proposalId: string;
  title: string;
  summary: string;
  targetOperator: { name: string; klippLevel: number };
  genesisPackage: {
    seedCapital: { amount: number; currency: string };
    assetAllocation: { assetId: string; type: string }[];
    networkOrchestration: { service: string; task: string }[];
  };
  projectedImpact: { firstMonthRevenue: string; timeToProfitability: string };
  status: 'awaiting_approval' | 'approved' | 'rejected';
};

export const getGenesisChamberData = (): { proposal: GenesisProposal | null } => ({
  proposal: {
    proposalId: 'GEN-PROP-2025-001',
    title: 'Quantum Cold Chain for Rural Pharmacies',
    summary: 'Establish a micro-franchise for a drone-based cold chain delivery service, targeting independent pharmacies in the Eastern Cape. This proposal seeds the first operator with a drone, a mobile power station, and initial operating capital.',
    targetOperator: {
      name: 'Thabo Mbeki Rural Health Initiative',
      klippLevel: 4,
    },
    genesisPackage: {
      seedCapital: {
        amount: 250000,
        currency: 'ZAR',
      },
      assetAllocation: [
        { assetId: 'DRN-042', type: 'Delivery Drone' },
        { assetId: 'PWR-STN-019', type: 'Mobile Power Station' },
      ],
      networkOrchestration: [
        { service: 'ai-trip-planning', task: 'GenerateInitialRoutes' },
        { service: 'autonomous-operations', task: 'RegisterNewOperator' },
        { service: 'marketplace-service', task: 'OnboardPharmacyClients' },
      ],
    },
    projectedImpact: {
      firstMonthRevenue: 'R 35,000',
      timeToProfitability: '4 Months',
    },
    status: 'awaiting_approval',
  }
});

export const ICONS = {
    Zap, User, DollarSign, Package, BarChart, BrainCircuit, Network
}
