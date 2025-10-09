import { analyzeSentiment } from './sentiment';
import { summarizeProposal } from './proposalSummarizer';
import { predictOutcome } from './predictor';
import { simulateProposalOutcome } from './simulator';
import { adjustForecastWithSentiment } from './predictor';
import { aggregateSentiment } from './sentimentAggregator';
import { collectiveIntelligenceSummary } from './advisor';

export function analyzeProposalText(proposal: { title: string; description: string }) {
  const sentiment = analyzeSentiment(proposal.description);
  const summary = summarizeProposal(proposal.title, proposal.description);

  let suggestion = '';
  if (sentiment === 'negative') {
    suggestion = '⚠️ This proposal contains risk-laden language. Citizens should review carefully.';
  } else if (sentiment === 'positive') {
    suggestion = '✅ This proposal emphasizes benefits and opportunities.';
  } else {
    suggestion = 'ℹ️ Neutral tone detected. Review details before staking.';
  }

  return { summary, sentiment, suggestion };
}

export function analyzeProposalGovernance(proposal: any, existing: any[]) {
  // Implementation from implement.md
}

export function forecastProposal(proposal: any, repDistribution: any) {
  const { probability, distribution } = simulateProposalOutcome(proposal, repDistribution, 500);
  const avg = distribution.reduce((a, b) => a + b, 0) / distribution.length;

  return {
    probability,
    avgStake: avg,
    message: `Forecast: ${(probability * 100).toFixed(0)}% chance of passing. Avg REP stake: ${(avg * 100).toFixed(1)}%.`,
  };
}

export function collectiveIntelligenceSummary(sentiment: any, forecast: any, repDistribution: any, federation: any) {
  return `
    Citizen mood: ${sentiment.positive} 👍 / ${sentiment.negative} 👎
    REP balance: ${Object.keys(repDistribution).length} active citizens
    Forecast: ${(forecast.probability * 100).toFixed(0)}% chance of passing
    Federation: ${federation} cross-nation events
  `;
}