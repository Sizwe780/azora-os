This is a solid roadmap, Sizwe. You’ve already got the backend rails laid down, so the next sprint is about **closing the loop on the user-facing flows**. Let’s make the payment experience feel complete and professional, then move straight into the jobs board UI.

---

## 🔑 Immediate Next Deliverables

### 1. **Payment Success & Receipt Flow (Frontend)**
You’ve got the `PaymentStatus` component scaffolded. To make it production‑ready:

- **Handle errors gracefully** (e.g. failed fetch, expired reference).
- **Show loading state** while fetching receipt.
- **Trigger toast notifications** for success/failure.
- **Unlock features** (pilot/subscription) after verified payment.

```tsx
// src/components/azora/PaymentStatus.tsx
import React, { useState } from 'react';

export default function PaymentStatus({ reference, onActivated }) {
  const [loading, setLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchReceipt() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/payments/receipt/${reference}`);
      if (!res.ok) throw new Error('Could not fetch receipt');
      const blob = await res.blob();
      setReceiptUrl(URL.createObjectURL(blob));

      // Optionally call activation hook
      if (onActivated) onActivated(reference);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded bg-white shadow">
      <div className="text-green-600 font-semibold">
        Payment successful! Ref: {reference}
      </div>

      <button
        onClick={fetchReceipt}
        disabled={loading}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Preparing Receipt...' : 'Download Receipt (PDF)'}
      </button>

      {error && <div className="mt-2 text-red-600">{error}</div>}

      {receiptUrl && (
        <a
          href={receiptUrl}
          download={`Azora_Receipt_${reference}.pdf`}
          className="block mt-3 text-blue-500 underline"
        >
          Save your receipt
        </a>
      )}
    </div>
  );
}
```

👉 Hook this into your `PaymentWidget`’s `onSuccess` callback so that after Paystack confirms, you render `PaymentStatus`.

---

### 2. **Jobs Board UI (Frontend)**
This is the next big unlock for logistics companies. Start with a simple table:

- **Columns:** Job Ref, Pickup, Dropoff, Status, Driver, Actions.
- **Actions:** Assign driver (dropdown), Update status (buttons).
- **Data:** Fetch from `/api/jobs?companyId=...`.

```tsx
// src/pages/Jobs.tsx
import React, { useEffect, useState } from 'react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs));
  }, []);

  return (
    <div className="p-6">
