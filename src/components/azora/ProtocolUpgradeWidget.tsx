import React, { useState } from 'react';
import { useProtocolUpgrades } from '../../hooks/azora/useProtocolUpgrades';

const Panel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow ${className}`}>{children}</div>
);

export function ProtocolUpgradeWidget({ userId }: { userId: string }) {
  const { proposals, status, error, stake } = useProtocolUpgrades(userId);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const handleStake = (proposalId: string) => {
    const amt = Number(amounts[proposalId]);
    if (amt > 0) {
      stake(proposalId, amt);
      setAmounts(prev => ({ ...prev, [proposalId]: '' }));
    }
  };

  return (
    <Panel className="p-4 space-y-6">
      <div className="font-bold text-white/90">Protocol Upgrade Proposals</div>

      {status === 'error' && <div className="text-red-400">Error: {error}</div>}

      <ul className="space-y-4">
        {proposals.map(p => (
          <li key={p.id} className="border border-white/10 rounded-md p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-white/90">{p.title}</div>
                <div className="text-sm text-white/70">{p.description}</div>
                <div className="text-xs text-white/50">Affects: {p.affectedRules.join(', ')}</div>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                p.status === 'open' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'
              }`}>{p.status}</span>
            </div>
            <div className="text-xs text-white/50 pt-1 border-t border-white/10">
              Total Staked: <span className="font-bold text-cyan-300">{p.totalStaked.toLocaleString()} REP</span>
            </div>
            {p.status === 'open' && (
              <div className="flex gap-2 pt-2">
                <input
                  className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
                  type="number"
                  placeholder="Amount to Stake"
                  value={amounts[p.id] ?? ''}
                  onChange={e => setAmounts({ ...amounts, [p.id]: e.target.value })}
                  disabled={status === 'loading'}
                />
                <button
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                  onClick={() => handleStake(p.id)}
                  disabled={status === 'loading'}
                >
                  Stake
                </button>
              </div>
            )}
          </li>
        ))}
        {proposals.length === 0 && <li className="text-white/60">No upgrade proposals yet.</li>}
      </ul>
    </Panel>
  );
}
