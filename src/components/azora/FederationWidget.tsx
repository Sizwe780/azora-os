import React from 'react';

export interface Nation {
  id: string;
  name: string;
  citizens: number;
  reputation: number;
}

export interface FederationWidgetProps {
  userId?: string;
}

const MOCK_NATIONS: Nation[] = [
  { id: "nation_1", name: "Azora Core", citizens: 12, reputation: 5640 },
  { id: "nation_2", name: "Azora Trade", citizens: 8, reputation: 2800 },
  { id: "nation_3", name: "Azora Research", citizens: 5, reputation: 1960 }
];

const FederationWidget: React.FC<FederationWidgetProps> = ({ userId }) => (
  <div className="rounded-xl bg-slate-900/70 border border-white/10 p-6">
    <h2 className="text-lg font-bold text-cyan-300 mb-4">Federation Overview</h2>
    <table className="w-full text-left">
      <thead>
        <tr>
          <th className="text-white/70 py-2">Nation</th>
          <th className="text-white/70 py-2">Citizens</th>
          <th className="text-white/70 py-2">Reputation</th>
        </tr>
      </thead>
      <tbody>
        {MOCK_NATIONS.map(nation => (
          <tr key={nation.id} className="border-b border-white/10">
            <td className="py-2 font-semibold text-cyan-200">{nation.name}</td>
            <td className="py-2">{nation.citizens}</td>
            <td className="py-2">{nation.reputation.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {userId && (
      <div className="mt-4 text-xs text-white/60">
        Your User ID: <span className="font-mono">{userId}</span>
      </div>
    )}
  </div>
);

export default FederationWidget;