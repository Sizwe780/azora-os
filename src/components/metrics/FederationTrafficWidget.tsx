import React from 'react';
import { useMetrics } from '../../context/MetricsProvider';

export function FederationTrafficWidget() {
  const { metrics } = useMetrics();
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="font-bold text-white/90">Federation Traffic</div>
      <div className="text-3xl font-mono text-cyan-400">{metrics.federationTraffic}</div>
      <div className="text-xs text-white/50">Cross‑nation proposals/votes exchanged</div>
    </div>
  );
}
