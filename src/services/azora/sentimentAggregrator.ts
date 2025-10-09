export type SentimentScore = { positive: number; neutral: number; negative: number };

export function aggregateSentiment(messages: string[]): SentimentScore {
  let score: SentimentScore = { positive: 0, neutral: 0, negative: 0 };
  for (const msg of messages) {
    const lower = msg.toLowerCase();
    if (lower.includes('support') || lower.includes('good') || lower.includes('yes')) score.positive++;
    else if (lower.includes('oppose') || lower.includes('bad') || lower.includes('no')) score.negative++;
    else score.neutral++;
  }
  return score;
}