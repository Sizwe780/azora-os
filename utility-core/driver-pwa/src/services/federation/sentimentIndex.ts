export function calculateESI({ moodScore, repVelocity, proposalCount, federationVolume }: any) {
    const moodWeight = moodScore * 0.4;
    const velocityWeight = Math.min(repVelocity / 1000, 1) * 0.3;
    const proposalWeight = Math.min(proposalCount / 50, 1) * 0.2;
    const federationWeight = Math.min(federationVolume / 100, 1) * 0.1;
  
    const index = (moodWeight + velocityWeight + proposalWeight + federationWeight) * 100;
    return Math.round(index);
  }