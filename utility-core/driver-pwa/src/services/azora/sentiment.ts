export type Sentiment = 'positive' | 'neutral' | 'negative';

export function analyzeSentiment(text: string): Sentiment {
  const lower = text.toLowerCase();
  if (lower.includes('urgent') || lower.includes('crisis') || lower.includes('risk')) return 'negative';
  if (lower.includes('opportunity') || lower.includes('growth') || lower.includes('benefit')) return 'positive';
  return 'neutral';
}