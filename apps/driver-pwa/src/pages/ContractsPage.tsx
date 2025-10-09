import React from 'react';
import Card from '../components/atoms/Card';
import Heading from '../components/atoms/Heading';
import { useApi } from '../../hooks/azora/useApi';

type Contract = {
  id: string;
  name: string;
  version: string;
  status: string;
  lastUpdated: string;
  uid?: string | null;
};

export default function ContractsPage() {
  const { data, loading, error } = useApi<{ contracts: Contract[] }>('/api/contracts');

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Contracts</Heading>
      <Card>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">Error: {error}</div>}
        {data && (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Version</th>
                <th className="p-2">Status</th>
                <th className="p-2">Last updated</th>
                <th className="p-2">UID</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.contracts.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.version}</td>
                  <td className="p-2">{c.status}</td>
                  <td className="p-2">{new Date(c.lastUpdated).toLocaleDateString('en-ZA')}</td>
                  <td className="p-2 text-xs text-gray-500">{c.uid ?? '—'}</td>
                  <td className="p-2">
                    <a
                      href={`/api/contract/${c.id}/pdf`}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
