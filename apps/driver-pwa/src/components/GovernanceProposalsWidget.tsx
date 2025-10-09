import React, { useState } from 'react';
import { useGovernance } from '../hooks/azora/useGovernance';
import { Card } from './atoms/Card';
import { Heading } from './atoms/Heading';
import { Skeleton } from './atoms/Skeleton';

const GlassPanel = ({ className = '', children }) => (
  <div className={`rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow ${className}`}>{children}</div>
);

export function GovernanceProposalsWidget({ userId }: { userId: string }) {
  const { proposals, status, error, vote } = useGovernance(userId);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const handleVote = (proposalId: string) => {
      const amount = Number(amounts[proposalId]);
      if (amount > 0) {
          vote(proposalId, amount);
          setAmounts(prev => ({ ...prev, [proposalId]: '' }));
      }
  }

  const renderContent = () => {
    if (status === 'loading' && proposals.length === 0) return <Skeleton lines={5} />;
    if (status === 'error') return <div className="p-4 text-red-400">Error: {error}</div>;

    return (
        <div className="space-y-4">
            {proposals.map(p => (
                <GlassPanel key={p.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white/90">{p.title}</h4>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === 'open' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}`}>
                            {p.status}
                        </span>
                    </div>
                    <p className="text-sm text-white/60">{p.description}</p>
                    <div className="text-xs text-white/50 pt-2 border-t border-white/10">
                        Total Staked: <span className="font-bold text-cyan-300">{p.totalStaked.toLocaleString()} REP</span>
                    </div>
                    {p.status === 'open' && (
                        <div className="flex gap-2 pt-2">
                            <input
                                className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                type="number"
                                placeholder="Amount to Stake"
                                value={amounts[p.id] ?? ''}
                                onChange={e => setAmounts({ ...amounts, [p.id]: e.target.value })}
                                disabled={status === 'loading'}
                            />
                            <button
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                                onClick={() => handleVote(p.id)}
                                disabled={status === 'loading'}
                            >
                                Stake
                            </button>
                        </div>
                    )}
                </GlassPanel>
            ))}
        </div>
    );
  };

  return (
    <Card>
      <Heading>Governance Proposals</Heading>
      {renderContent()}
    </Card>
  );
}
