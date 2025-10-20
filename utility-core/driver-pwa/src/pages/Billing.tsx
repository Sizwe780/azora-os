// src/pages/Billing.tsx
import React, { useEffect, useState } from 'react';

type Payment = { reference: string; amountCents: number; currency: string; createdAt: string };

export default function Billing({ companyId }: { companyId: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/payments/history/${companyId}`);
    const data = await res.json();
    setPayments(data.payments || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [companyId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Billing</h1>
      {loading ? <div>Loading...</div> : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Date</th>
              <th className="p-2">Reference</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.reference} className="border-t">
                <td className="p-2">{new Date(p.createdAt).toLocaleDateString('en-ZA')}</td>
                <td className="p-2">{p.reference}</td>
                <td className="p-2">R{(p.amountCents / 100).toFixed(2)}</td>
                <td className="p-2">
                  <a
                    href={`/api/payments/receipt/${p.reference}`}
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
    </div>
  );
}
