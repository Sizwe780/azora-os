// src/pages/PaymentsPage.tsx
import React from 'react';
import { useApi } from '../../hooks/azora/useApi';
import Card from '../components/atoms/Card';
import Heading from '../components/atoms/Heading';

type Payment = {
  id: string;
  reference: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  company: string;
  uid?: string | null;
};

export default function PaymentsPage() {
  const { data, loading, error } = useApi<{ payments: Payment[] }>('/api/payments');

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Payments</Heading>
      <Card>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">Error: {error}</div>}
        {data && (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Reference</th>
                <th className="p-2">Company</th>
                <th className="p-2">Provider</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">UID</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((p) => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="p-2">{p.reference}</td>
                  <td className="p-2">{p.company}</td>
                  <td className="p-2">{p.provider}</td>
                  <td className="p-2">R{(p.amount / 100).toFixed(2)} {p.currency}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2 text-xs text-gray-500">{p.uid ?? '—'}</td>
                  <td className="p-2">
                    <a
                      href={`/api/payment/${p.id}/pdf`} // ✅ generic export route
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
