import { useEffect, useState } from 'react';
import { fetchReputationBalance, stakeReputation, delegateReputation } from '../../services/azora/reputationEconomy';
import { ReputationBalance } from '../../types/azora/reputationEconomy';

export function useReputationEconomy(userId: string) {
  const [balance, setBalance] = useState<ReputationBalance | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReputationBalance(userId)
      .then(b => {
        setBalance(b);
        setStatus('ready');
      })
      .catch(e => {
        setError(e.message);
        setStatus('error');
      });
  }, [userId]);

  async function stake(proposalId: string, amount: number) {
    if (!balance) return;
    await stakeReputation(userId, proposalId, amount);
    const updated = await fetchReputationBalance(userId);
    setBalance(updated);
  }

  async function delegate(toUserId: string, amount: number) {
    if (!balance) return;
    await delegateReputation(userId, toUserId, amount);
    const updated = await fetchReputationBalance(userId);
    setBalance(updated);
  }

  return { balance, status, error, stake, delegate };
}
