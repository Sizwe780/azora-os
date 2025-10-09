import { useEffect, useState } from 'react';
import { fetchProtocolUpgrades, stakeOnUpgrade } from '../../src/services/azora/protocolUpgrade';
import { ProtocolUpgradeProposal } from '../../types/azora/protocolUpgrade';

export function useProtocolUpgrades(userId: string) {
  const [proposals, setProposals] = useState<ProtocolUpgradeProposal[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProtocolUpgrades()
      .then(data => {
        setProposals(data);
        setStatus('ready');
      })
      .catch(e => {
        setError(e.message);
        setStatus('error');
      });
  }, []);

  async function stake(proposalId: string, amount: number) {
    await stakeOnUpgrade(proposalId, userId, amount);
    const updated = await fetchProtocolUpgrades();
    setProposals(updated);
  }

  return { proposals, status, error, stake };
}
