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

  const invite = async (name: string, endpoint: string) => {
    try {
      const newNation = await interNationService.inviteNation(name, endpoint);
      // Refresh data to show the new nation immediately
      await refresh();
      return newNation;
    } catch (err: any) {
      setError(err.message || 'Failed to invite nation.');
      throw err;
    }
  };

  const vote = async (proposalId: string, amount: number) => {
    try {
      await interNationService.voteOnCrossProposal(proposalId, amount);
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to vote on proposal.');
      throw err;
    }
  };

  return { nations, proposals, isLoading, error, refresh, vote, invite };
};
