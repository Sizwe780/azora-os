import { Proposal } from "../../../types/azora/governance";

export function simulateProposalOutcome(
    proposal: Proposal,
    repDistribution: Record<string, number>,
    iterations = 1000
  ) {
    const userIds = Object.keys(repDistribution);
    const totalREP = Object.values(repDistribution).reduce((a, b) => a + b, 0);
  
    let passCount = 0;
    const outcomes: number[] = [];
  
    for (let i = 0; i < iterations; i++) {
      let staked = 0;
      for (const user of userIds) {
        const rep = repDistribution[user] || 0;  // Fixed: provide default 0 if undefined
        // Randomized probability of participation
        if (Math.random() < 0.6) {
          const stake = Math.random() * rep;
          staked += stake;
        }
      }
      const ratio = staked / (totalREP || 1);
      outcomes.push(ratio);
      if (ratio > 0.5) passCount++;
    }
  
    return {
      probability: passCount / iterations,
      distribution: outcomes,
    };
  }