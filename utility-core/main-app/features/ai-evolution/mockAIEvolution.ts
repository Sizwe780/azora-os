export interface EvolutionStats {
  generation: number;
  bestFitness: number;
  populationSize: number;
  mutationRate: number;
  evolutionHistory: { generation: number; bestFitness: number }[];
}

export interface ImprovementStats {
  totalImprovements: number;
  metricsAnalyzed: number;
  patchesApplied: number;
  isLearning: boolean;
  latestPatch: {
    id: string;
    description: string;
    timestamp: Date;
  };
}

export interface RegionalIntegration {
  name: string;
  status: 'Integrated' | 'Partial' | 'Pending';
  compliance: { name: string; level: string | number }[];
  features: string[];
}

export interface AIEvolutionData {
  evolution: EvolutionStats;
  improvement: ImprovementStats;
  regional: RegionalIntegration;
}

export const getMockAIEvolutionData = (): AIEvolutionData => ({
  evolution: {
    generation: 1337,
    bestFitness: 0.9812,
    populationSize: 500,
    mutationRate: 0.05,
    evolutionHistory: Array.from({ length: 30 }, (_, i) => ({
      generation: 1308 + i,
      bestFitness: 0.85 + Math.sin(i / 5) * 0.05 + i * 0.004,
    })),
  },
  improvement: {
    totalImprovements: 542,
    metricsAnalyzed: 1200523,
    patchesApplied: 128,
    isLearning: false,
    latestPatch: {
      id: 'PATCH-202408-0128',
      description: 'Optimized routing algorithm for dense urban areas.',
      timestamp: new Date(),
    },
  },
  regional: {
    name: 'South Africa',
    status: 'Integrated',
    compliance: [
      { name: 'POPIA', level: 'Fully Compliant' },
      { name: 'B-BBEE', level: 1 },
    ],
    features: ['11 Official Languages', '9 Provinces Coverage', 'Local Payment Gateways'],
  },
});
