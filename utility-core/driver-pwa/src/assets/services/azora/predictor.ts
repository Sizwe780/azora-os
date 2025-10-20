import { Proposal } from '../../../types/azora/governance';
import { SentimentScore } from './sentimentAggregrator';

export type Prediction = {
  likelihood: number; // 0–1
  repImpact: string;
  federationImpact: string;
};

export function predictOutcome(proposal: Proposal, repDistribution: Record<string, number>): Prediction {
  const totalREP = Object.values(repDistribution).reduce((a, b) => a + b, 0);
  const avgStake = proposal.totalStaked / (totalREP || 1);

  let likelihood = avgStake; // crude proxy: more REP staked = higher chance
  if (proposal.status !== 'open') likelihood = 0;

  let repImpact = 'neutral';
  if (avgStake > 0.3) repImpact = 'strengthens majority';
  if (avgStake < 0.1) repImpact = 'unlikely to shift power';

  let federationImpact = proposal.title.toLowerCase().includes('federation')
    ? 'cross‑nation implications likely'
    : 'local only';

  return { likelihood: Math.min(1, likelihood), repImpact, federationImpact };
}

export function adjustForecastWithSentiment(baseProb: number, sentiment: SentimentScore) {
  const total = sentiment.positive + sentiment.neutral + sentiment.negative || 1;
  const sentimentBias = (sentiment.positive - sentiment.negative) / total;

  // Adjust base probability by ±20% depending on sentiment
  const adjusted = baseProb + sentimentBias * 0.2;
  return Math.max(0, Math.min(1, adjusted));
}