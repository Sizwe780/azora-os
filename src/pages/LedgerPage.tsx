import React from 'react';
import Card from '../components/azora/atoms/Card';
import Heading from '../components/azora/atoms/Heading';
import { useApi } from '../hooks/useApi';

type Tx = {
  reference: string;
  amountCents: number;
  currency: string;
  createdAt: string;
};

export default function LedgerPage() {
  const { data, loading, error } = useApi<{ payments: Tx[] }>('/api/payments/history/demo_company');

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Ledger</Heading>
      <Card>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">Error: {error}</div>}
        {data && (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Reference</th>
                <th className="p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((t) => (
                <tr key={t.reference} className="border-t border-white/10">
                  <td className="p-2">{new Date(t.createdAt).toLocaleDateString('en-ZA')}</td>
                  <td className="p-2">{t.reference}</td>
                  <td className="p-2">R{(t.amountCents / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}