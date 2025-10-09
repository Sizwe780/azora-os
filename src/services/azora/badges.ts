export type Badge = { id: string; name: string; description: string; icon: string };

const badges: Badge[] = [
  { id: 'first-proposal', name: 'Initiator', description: 'Created your first proposal', icon: '📜' },
  { id: 'rep-100', name: 'Investor', description: 'Staked 100 REP', icon: '💎' },
  { id: 'federation-builder', name: 'Diplomat', description: 'Voted on a cross-nation proposal', icon: '🌐' },
];

export function checkBadges(citizen: any, actions: any[]): Badge[] {
  const earned: Badge[] = [];
  if (actions.some(a => a.type === 'createProposal')) earned.push(badges[0]);
  if (actions.some(a => a.type === 'stake' && a.amount >= 100)) earned.push(badges[1]);
  if (actions.some(a => a.type === 'crossVote')) earned.push(badges[2]);
  return earned;
}