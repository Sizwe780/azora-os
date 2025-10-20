// src/components/azora/PaymentStatus.tsx
import React, { useState } from 'react';

type Props = {
  reference: string;
  companyId: string;
  onActivated?: (ref: string) => void;
};

export default function PaymentStatus({ reference, companyId, onActivated }: Props) {
  const [loading, setLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function finalizePayment() {
    try {
      setLoading(true);
      setError(null);

      // Verify + activate on server
      const verify = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, companyId })
      });
      if (!verify.ok) throw new Error('Verification failed');

      // Fetch receipt PDF
      const res = await fetch(`/api/payments/receipt/${reference}`);
      if (!res.ok) throw new Error('Could not fetch receipt');
      const blob = await res.blob();
      setReceiptUrl(URL.createObjectURL(blob));

      onActivated?.(reference);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded bg-white shadow">
      <div className="font-semibold">Payment reference: {reference}</div>
      <button
        onClick={finalizePayment}
        disabled={loading}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Finalizing...' : 'Finalize & Download Receipt'}
      </button>
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {receiptUrl && (
        <a
          href={receiptUrl}
          download={`Azora_Receipt_${reference}.pdf`}
          className="block mt-3 text-blue-500 underline"
        >
          Save your receipt (PDF)
        </a>
      )}
      <div className="mt-2 text-green-600">Pilot/subscription will unlock after verification.</div>
    </div>
  );
}
