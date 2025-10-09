import React, { useState } from 'react';
import { useInterNation } from '../../hooks/azora/useInterNation';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

export const CrossNationProposalsWidget = () => {
  const { proposals, isLoading, error, vote } = useInterNation();
  const [stakeAmounts, setStakeAmounts] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleVote = async (proposalId: string) => {
    const amount = Number(stakeAmounts[proposalId]);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount to stake.");
      return;
    }

    setIsSubmitting(proposalId);
    try {
      await vote(proposalId, amount);
      // Clear input after successful vote
      setStakeAmounts(prev => ({ ...prev, [proposalId]: '' }));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(null);
    }
  };

  const renderLoadingState = () => (
    <div className="space-y-3">
      <Skeleton className="h-24 w-full" />
    </div>
  );

  const renderErrorState = () => (
    <p className="text-red-400 text-sm">
      Could not load proposals: {error}
    </p>
  );

  const renderProposals = () => (
    <ul className="space-y-4">
      {proposals.map(p => (
        <li key={p.id} className="glass p-4 rounded-lg space-y-3">
          <div>
            <p className="font-semibold text-white/90">{p.title}</p>
            <p className="text-xs text-white/60">From: {p.originNationId}</p>
          </div>
          <p className="text-sm text-white/70">{p.description}</p>
          <p className="text-sm font-bold">Total Staked: {p.totalStaked.toLocaleString()} REP</p>
          
          {p.status === 'open' && (
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="number"
                placeholder="Amount"
                className="flex-1 bg-white/5 border border-white/20 rounded-md px-3 py-1.5 text-white text-sm"
                value={stakeAmounts[p.id] || ''}
                onChange={e => setStakeAmounts({ ...stakeAmounts, [p.id]: e.target.value })}
                disabled={isSubmitting === p.id}
              />
              <button
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-500 disabled:bg-gray-500"
                onClick={() => handleVote(p.id)}
                disabled={isSubmitting === p.id}
              >
                {isSubmitting === p.id ? 'Staking...' : 'Stake'}
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <Card title="Cross-Nation Proposals">
       {isLoading ? renderLoadingState() : (
        error ? renderErrorState() : (
          proposals.length > 0 ? renderProposals() : (
            <p className="text-sm text-white/70">No active cross-nation proposals.</p>
          )
        )
      )}
    </Card>
  );
};
