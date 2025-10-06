import React from 'react';

export interface AdvisorInsight {
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
}

export interface AdvisorPanelProps {
  insights?: AdvisorInsight[];
}

const MOCK_INSIGHTS: AdvisorInsight[] = [
  {
    id: "1",
    severity: "high",
    message: "Compliance risk detected in the latest proposal.",
    suggestion: "Review contract terms and improve error handling."
  },
  {
    id: "2",
    severity: "low",
    message: "Federation activity surge.",
    suggestion: "Monitor cross‑nation proposals for alignment."
  }
];

const AdvisorPanel: React.FC<AdvisorPanelProps> = ({ insights = MOCK_INSIGHTS }) => (
  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
    <div className="font-bold text-indigo-300">Governance Advisor</div>
    {insights.length === 0 && (
      <div className="text-white/60 text-sm">No insights at the moment.</div>
    )}
    <ul className="space-y-2">
      {insights.map(i => (
        <li key={i.id} className="text-sm">
          <div className={`font-semibold ${
            i.severity === 'high' ? 'text-red-400' :
            i.severity === 'medium' ? 'text-yellow-300' :
            'text-cyan-300'
          }`}>
            {i.message}
          </div>
          <div className="text-white/70">{i.suggestion}</div>
        </li>
      ))}
    </ul>
  </div>
);

export default AdvisorPanel;
export { AdvisorPanel };
