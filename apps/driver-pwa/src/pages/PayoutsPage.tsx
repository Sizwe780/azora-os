// src/pages/PayoutsPage.tsx
import React from 'react';
import { useApi } from '../../hooks/azora/useApi';
import Card from '../components/atoms/Card';
import Heading from '../components/atoms/Heading';

type Payout = {
  id: string;
  partner: string;
  amountCents: number;
  status: string;
  period: string;
  createdAt: string;
  uid?: string | null;
};

export default function PayoutsPage() {
  const { data, loading, error } = useApi<{ payouts: Payout[] }>('/api/payouts');

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Payouts</Heading>
      <Card>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">Error: {error}</div>}
        {data && (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Partner</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Period</th>
                <th className="p-2">UID</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.payouts.map((p) => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="p-2">{p.partner}</td>
                  <td className="p-2">R{(p.amountCents / 100).toFixed(2)}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">{p.period}</td>
                  <td className="p-2 text-xs text-gray-500">{p.uid ?? '—'}</td>
                  <td className="p-2">
                    <a
                      href={`/api/payout/${p.id}/pdf`} // ✅ generic export route
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
