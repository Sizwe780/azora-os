import React from 'react';
import Heading from '../components/azora/atoms/Heading';
import { useApi } from '../hooks/useApi';

type Insight = { id: string; severity: string; message: string; suggestion: string };

export default function AdvisorPage() {
  const { data, loading, error } = useApi<{ insights: Insight[] }>('/api/advisor');

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Advisor</Heading>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {data && (
        <ul className="space-y-2">
          {data.insights.map((i) => (
            <li key={i.id} className="p-2 border rounded">
              <div className="font-semibold">{i.message}</div>
              <div className="text-sm text-gray-600">{i.suggestion}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}