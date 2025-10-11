import React from 'react';
import { createContext, useContext, useState } from 'react';
import { Job } from '../features/jobs/jobsBoard';

export type Metrics = {
  proposals: number;
  repDistribution: Record<string, number>;
  delegations: { from: string; to: string; amount: number }[];
  federationTraffic: number;
};

const MetricsContext = createContext<{
  metrics: Metrics;
  update: (m: Partial<Metrics>) => void;
  updateMetricsFromJobs: (jobs: Job[]) => void;
}>({ metrics: { proposals: 0, repDistribution: {}, delegations: [], federationTraffic: 0 }, update: () => {}, updateMetricsFromJobs: () => {} });

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

  function updateMetricsFromJobs(jobs: Job[]) {
    // Update metrics based on jobs data
    const completedJobs = jobs.filter(job => job.status === 'completed').length;
    const inProgressJobs = jobs.filter(job => job.status === 'in_progress').length;
    // For now, just update federationTraffic as a proxy for activity
    update({ federationTraffic: completedJobs + inProgressJobs });
  }

  return <MetricsContext.Provider value={{ metrics, update, updateMetricsFromJobs }}>{children}</MetricsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMetrics() {
  return useContext(MetricsContext);
}
