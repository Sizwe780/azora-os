import React from 'react';
import { useConstitution } from '../hooks/azora/useConstitution';

const Panel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow ${className}`}>{children}</div>
);

export function ConstitutionWidget() {
  const { rules, logs, status, error, toggle, constitution } = useConstitution();

  const handleToggle = (ruleId: string, enforced: boolean) => {
    toggle(ruleId, !enforced);
  };

  const safeRules = Array.isArray(rules) ? rules : [];
  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <Panel className="p-4 space-y-6">
      <div className="font-bold text-white/90">Constitution</div>
      <div className="whitespace-pre-wrap text-white mb-4">{constitution}</div>
      {status === 'error' && <div className="text-red-400">Error: {error}</div>}

      {/* Rules */}
      <div className="space-y-2">
        <div className="text-sm text-white/70">Active Rules</div>
        <ul className="space-y-2">
          {safeRules.map(r => (
            <li key={r.id} className="border border-white/10 rounded-md p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-white/90">{r.title}</div>
                  <div className="text-xs text-white/60">{r.description}</div>
                  <div className="text-xs text-white/50">Applies to: {r.appliesTo}</div>
                </div>
                <button
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    r.enforced ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'
                  }`}
                  onClick={() => handleToggle(r.id, r.enforced)}
                >
                  {r.enforced ? 'Enforced' : 'Inactive'}
                </button>
              </div>
            </li>
          ))}
          {safeRules.length === 0 && <li className="text-white/60">No rules defined yet.</li>}
        </ul>
      </div>

      {/* Enforcement Logs */}
      <div className="space-y-2">
        <div className="text-sm text-white/70">Enforcement Logs</div>
        <ul className="space-y-2">
          {safeLogs.map(l => (
            <li key={l.timestamp + l.ruleId} className="border border-white/10 rounded-md p-3">
              <div className="text-sm text-white/80">{l.actionTaken}</div>
              <div className="text-xs text-white/60">
                Rule: {l.ruleId} • Triggered by: {l.triggeredBy}
              </div>
              <div className="text-xs text-white/50">{new Date(l.timestamp).toLocaleString()}</div>
            </li>
          ))}
          {safeLogs.length === 0 && <li className="text-white/60">No enforcement actions yet.</li>}
        </ul>
      </div>
    </Panel>
  );
}