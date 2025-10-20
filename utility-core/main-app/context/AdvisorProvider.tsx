import React from 'react';
import { createContext, useContext, useState } from 'react';

type Insight = { id: string; severity: 'low' | 'medium' | 'high'; message: string; suggestion: string };

const AdvisorContext = createContext<{ insights: Insight[]; add: (i: Insight) => void }>({
  insights: [],
  add: () => {},
});

let advisorIdCounter = 0;
const nextAdvisorId = () => {
  advisorIdCounter += 1;
  return `advisor-${advisorIdCounter}`;
};

export function AdvisorProvider({ children }: { children: React.ReactNode }) {
  const [insights, setInsights] = useState<Insight[]>([]);

  function add(i: Insight) {
    setInsights(prev => [...prev, { ...i, id: nextAdvisorId() }]);
  }

  return <AdvisorContext.Provider value={{ insights, add }}>{children}</AdvisorContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdvisor() {
  return useContext(AdvisorContext);
}
