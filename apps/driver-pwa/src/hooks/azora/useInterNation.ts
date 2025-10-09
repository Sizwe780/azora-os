import { useState, useEffect, useCallback } from 'react';
import {
  interNationService,
  Nation,
  CrossNationProposal,
} from '../../services/azora/interNation';

export const useInterNation = () => {
  const [nations, setNations] = useState<Nation[]>([]);
  const [proposals, setProposals] = useState<CrossNationProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedNations, fetchedProposals] = await Promise.all([
        interNationService.getNations(),
        interNationService.getProposals(),
      ]);
      setNations(fetchedNations);
      setProposals(fetchedProposals);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch federation data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const vote = async (proposalId: string, amount: number) => {
    try {
      await interNationService.voteOnCrossProposal(proposalId, amount);
      // Refresh data to show the updated stake
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to vote on proposal.');
      // Re-throw to be caught in the component if needed
      throw err;
    }
  };

  return { nations, proposals, isLoading, error, refresh, vote };
};
