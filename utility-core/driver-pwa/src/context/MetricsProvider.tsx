import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Job } from "../features/jobs/jobsBoard";

// Based on the Python API's PerformanceMetrics model
export interface PerformanceMetrics {
  trips_completed: number;
  trips_missed: number;
  reputation_score: number;
  profit: number;
  target_profit: number;
}

interface MetricsContextType {
  metrics: PerformanceMetrics;
  updateMetricsFromJobs: (jobs: Job[]) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider = ({ children }: { children: ReactNode }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    trips_completed: 0,
    trips_missed: 0,
    reputation_score: 80, // Start with a baseline score
    profit: 7500,
    target_profit: 10000,
  });

  // This function would calculate metrics based on job history
  const updateMetricsFromJobs = useCallback((jobs: Job[]) => {
    const completed = jobs.filter(j => j.status === 'completed').length;
    const missed = jobs.filter(j => j.status === 'canceled').length; // Assuming canceled = missed for now

    // More complex logic for reputation and profit would go here
    setMetrics(prev => ({
      ...prev,
      trips_completed: completed,
      trips_missed: missed,
      // Example: reputation slightly changes based on performance
      reputation_score: Math.max(0, Math.min(100, prev.reputation_score + completed - missed * 2)),
    }));
  }, []);

  return (
    <MetricsContext.Provider value={{ metrics, updateMetricsFromJobs }}>
      {children}
    </MetricsContext.Provider>
  );
};

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error("useMetrics must be used within a MetricsProvider");
  }
  return context;
};