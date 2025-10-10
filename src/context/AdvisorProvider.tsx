import React from 'react';
import { createContext, useContext, useState } from 'react';

type Insight = { id: string; severity: 'low' | 'medium' | 'high'; message: string; suggestion: string };

const AdvisorContext = createContext<{ insights: Insight[]; add: (i: Insight) => void }>({
  insights: [],
  add: () => {},
});

export function AdvisorProvider({ children }: { children: React.ReactNode }) {
  const [insights, setInsights] = useState<Insight[]>([]);

  function add(i: Insight) {
    setInsights(prev => [...prev, { ...i, id: Math.random().toString(36).slice(2) }]);
  }

  return <AdvisorContext.Provider value={{ insights, add }}>{children}</AdvisorContext.Provider>;
}

export function useAdvisor() {
  return useContext(AdvisorContext);
}
