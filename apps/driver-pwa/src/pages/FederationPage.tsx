import React from 'react';
import Heading from '../components/atoms/Heading';
import { useApi } from '../../hooks/azora/useApi';

type Nation = { id: string; name: string; citizens: number; reputation: number };

export default function FederationPage() {
  const { data, loading, error } = useApi<{ nations: Nation[] }>('/api/federation');

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Federation</Heading>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {data && (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Nation</th>
              <th className="p-2">Citizens</th>
              <th className="p-2">Reputation</th>
            </tr>
          </thead>
          <tbody>
            {data.nations.map((n) => (
              <tr key={n.id} className="border-t border-white/10">
                <td className="p-2">{n.name}</td>
                <td className="p-2">{n.citizens}</td>
                <td className="p-2">{n.reputation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}