import { useEffect, useState, useCallback } from 'react';
import { fetchProposals, voteOnProposal } from '../../services/azora/governance';
import { Proposal } from '../../types/azora/governance';

export function useGovernance(userId: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const refreshProposals = useCallback(() => {
    setStatus('loading');
    setError(null);
    fetchProposals()
      .then(data => {
        setProposals(data);
        setStatus('ready');
      })
      .catch(e => {
        setError(e.message);
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    refreshProposals();
  }, [refreshProposals]);

  const vote = useCallback(async (proposalId: string, amount: number) => {
    setStatus('loading');
    try {
        await voteOnProposal(proposalId, userId, amount);
        await refreshProposals(); // Refresh to show new total
    } catch(e: any) {
        setError(e.message);
        setStatus('error');
    }
  }, [userId, refreshProposals]);

  return { proposals, status, error, vote };
}
