import React from 'react';
import Card from '../components/azora/atoms/Card';
import Heading from '../components/azora/atoms/Heading';
import { useApi } from '../hooks/azora/useApi';

type KPIs = { citizens: number; activeProposals: number; reputation: number; federations: number };

export default function NationPage() {
  const { data, loading, error } = useApi<KPIs>('/api/nation/kpis');

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Nation</Heading>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data).map(([label, value]) => (
            <Card key={label}>
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-2xl font-bold">{value}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}