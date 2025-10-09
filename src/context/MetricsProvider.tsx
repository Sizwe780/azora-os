import React, { createContext, useContext, useState } from 'react';

export type Metrics = {
  proposals: number;
  repDistribution: Record<string, number>;
  delegations: { from: string; to: string; amount: number }[];
  federationTraffic: number;
};

const MetricsContext = createContext<{
  metrics: Metrics;
  update: (m: Partial<Metrics>) => void;
}>({ metrics: { proposals: 0, repDistribution: {}, delegations: [], federationTraffic: 0 }, update: () => {} });

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<Metrics>({
    proposals: 0,
    repDistribution: {},
    delegations: [],
    federationTraffic: 0,
  });

  function update(m: Partial<Metrics>) {
    setMetrics(prev => ({ ...prev, ...m }));
  }

  return <MetricsContext.Provider value={{ metrics, update }}>{children}</MetricsContext.Provider>;
}

export function useMetrics() {
  return useContext(MetricsContext);
}
