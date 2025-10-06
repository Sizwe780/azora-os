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
      <h1 className="text-xl font-bold mb-4">Jobs Board</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Ref</th>
            <th className="p-2">Pickup</th>
            <th className="p-2">Dropoff</th>
            <th className="p-2">Status</th>
            <th className="p-2">Driver</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job: any) => (
            <tr key={job.id} className="border-t">
              <td className="p-2">{job.ref}</td>
              <td className="p-2">{job.pickup.address}</td>
              <td className="p-2">{job.dropoff.address}</td>
              <td className="p-2">{job.status}</td>
              <td className="p-2">{job.driverId || '-'}</td>
              <td className="p-2">
                <button className="px-2 py-1 bg-green-600 text-white rounded">
                  Assign
                </button>
                <button className="ml-2 px-2 py-1 bg-blue-600 text-white rounded">
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### 3. **Partner/Referral Dashboard**
- Show **referrals list** (companies onboarded).
- Show **commission earned** (pending/paid).
- Add **“Request Payout”** button.

---

### 4. **Audit Trail & Notifications**
- Toasts: integrate something like `react-hot-toast`.
- Activity log: side panel showing last 20 audit entries.

---

## 🚀 Suggested Next Sprint
1. Finish **PaymentStatus** integration (done above).
2. Build **Jobs Board UI** (scaffold above).
3. Add **Partner Dashboard** (referrals + commissions).
4. Wire **toasts + audit log** for real-time feedback.

---

### Shipping plan overview

You’re close. Let’s knock out the remaining UI and glue code so payments feel complete, jobs move, partners earn, audits show up, and subscriptions are manageable—end to end. Below are drop‑in components and minimal backend routes you can wire fast.

---

## Payment success UI, receipt download, and activation

```tsx
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
```

```typescript
// src/server/payments/receipt.ts
import express from 'express';
import { prisma } from '../prisma';
import { generateReceiptPDF } from './invoice';

const router = express.Router();

router.get('/receipt/:reference', async (req, res) => {
  const { reference } = req.params;
  const payment = await prisma.payment.findUnique({ where: { reference }, include: { company: true } });
  if (!payment || payment.status !== 'success') return res.status(404).send('Not found');

  const pdfBuffer = generateReceiptPDF({
    companyName: payment.company?.name || 'Azora Customer',
    reference,
    amountCents: payment.amount
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfBuffer));
});

export default router;
```

---

## Jobs board (production‑ready actions)

```tsx
// src/pages/Jobs.tsx
import React, { useEffect, useState } from 'react';

type Job = {
  id: string;
  ref: string;
  pickup: { address: string };
  dropoff: { address: string };
  status: 'new' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
  driverId?: string;
};

const statuses: Job['status'][] = ['new', 'assigned', 'in_transit', 'delivered', 'failed'];

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string>('');

  async function loadJobs() {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(data.jobs || []);
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function assignDriver(jobId: string) {
    setAssigning(jobId);
    await fetch('/api/jobs/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, driverId })
    });
    setAssigning(null);
    setDriverId('');
    loadJobs();
  }

  async function updateStatus(jobId: string, status: Job['status']) {
    await fetch('/api/jobs/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, status })
    });
    loadJobs();
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Jobs Board</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Ref</th>
            <th className="p-2">Pickup</th>
            <th className="p-2">Dropoff</th>
            <th className="p-2">Status</th>
            <th className="p-2">Driver</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-t">
              <td className="p-2">{job.ref}</td>
              <td className="p-2">{job.pickup.address}</td>
              <td className="p-2">{job.dropoff.address}</td>
              <td className="p-2">{job.status}</td>
              <td className="p-2">{job.driverId || '-'}</td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Driver ID"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => assignDriver(job.id)}
                    disabled={assigning === job.id || !driverId}
                    className="px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                  >
                    {assigning === job.id ? 'Assigning...' : 'Assign'}
                  </button>
                  <select
                    value={job.status}
                    onChange={(e) => updateStatus(job.id, e.target.value as Job['status'])}
                    className="border px-2 py-1 rounded"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Partner and referral dashboard

```tsx
// src/pages/PartnerDashboard.tsx
import React, { useEffect, useState } from 'react';

type Referral = { id: string; companyName: string; createdAt: string };
type Payout = { id: string; period: string; amountCents: number; status: 'pending' | 'paid' };
type Summary = { code: string; commissionRateBps: number; pendingCents: number; paidCents: number };

export default function PartnerDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const [sumRes, refRes, payRes] = await Promise.all([
      fetch('/api/partners/summary'),
      fetch('/api/partners/referrals'),
      fetch('/api/partners/payouts')
    ]);
    setSummary(await sumRes.json());
    setReferrals((await refRes.json()).referrals || []);
    setPayouts((await payRes.json()).payouts || []);
  }

  useEffect(() => { load(); }, []);

  async function generateCode() {
    setLoading(true);
    await fetch('/api/partners/code', { method: 'POST' });
    await load();
    setLoading(false);
  }

  async function requestPayout(period: string) {
    setLoading(true);
    await fetch('/api/partners/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period })
    });
    await load();
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Partner Dashboard</h1>

      <div className="p-4 border rounded bg-white mb-6">
        <div><strong>Referral code:</strong> {summary?.code || '-'}</div>
        <div><strong>Commission rate:</strong> {(summary?.commissionRateBps ?? 0) / 100}%</div>
        <div><strong>Pending:</strong> R{((summary?.pendingCents ?? 0) / 100).toFixed(2)}</div>
        <div><strong>Paid:</strong> R{((summary?.paidCents ?? 0) / 100).toFixed(2)}</div>
        <button
          onClick={generateCode}
          disabled={loading}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate/Refresh Referral Code'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded bg-white">
          <h2 className="font-semibold mb-3">Referrals</h2>
          <ul className="space-y-2">
            {referrals.map((r) => (
              <li key={r.id} className="border p-2 rounded">
                <div><strong>Company:</strong> {r.companyName}</div>
                <div><strong>Date:</strong> {new Date(r.createdAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border rounded bg-white">
          <h2 className="font-semibold mb-3">Payouts</h2>
          <ul className="space-y-2">
            {payouts.map((p) => (
              <li key={p.id} className="border p-2 rounded">
                <div><strong>Period:</strong> {p.period}</div>
                <div><strong>Amount:</strong> R{(p.amountCents / 100).toFixed(2)}</div>
                <div><strong>Status:</strong> {p.status}</div>
                {p.status === 'pending' && (
                  <button
                    onClick={() => requestPayout(p.period)}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Request Payout
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## Audit trail and notifications

```tsx
// src/components/azora/AuditPanel.tsx
import React, { useEffect, useState } from 'react';

type Audit = { id: string; type: string; action: string; createdAt: string; meta: any };

export default function AuditPanel({ companyId }: { companyId: string }) {
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    fetch(`/api/audit?companyId=${companyId}`)
      .then((res) => res.json())
      .then((data) => setAudits(data.audits || []));
  }, [companyId]);

  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="font-semibold mb-3">Recent activity</h2>
      <ul className="space-y-2 max-h-64 overflow-auto">
        {audits.map((a) => (
          <li key={a.id} className="border p-2 rounded">
            <div><strong>Type:</strong> {a.type}</div>
            <div><strong>Action:</strong> {a.action}</div>
            <div><strong>Date:</strong> {new Date(a.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```tsx
// src/app/Toaster.tsx
import { Toaster } from 'react-hot-toast';
export default function AppToaster() { return <Toaster position="bottom-right" />; }
```

```tsx
// usage example in PaymentWidget onSuccess
import toast from 'react-hot-toast';
// ...
onSuccess={(ref) => {
  toast.success('Payment successful');
  setShowStatus(true);
}}
```

```typescript
// src/server/audit/write.ts
import { prisma } from '../prisma';

export async function writeAudit(companyId: string, type: string, action: string, meta?: any) {
  await prisma.audit.create({ data: { companyId, type, action, meta } });
}
```

Call `writeAudit` in payments verify, job assign/status, and settings updates.

---

## Subscription management UI

```tsx
// src/pages/Subscription.tsx
import React, { useEffect, useState } from 'react';

type Plan = { id: string; code: string; name: string; priceZarCents: number; interval: 'monthly' | 'annual' };
type Subscription = { status: string; currentPeriodEnd: string; plan: Plan };

export default function SubscriptionPage({ companyId }: { companyId: string }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const [plansRes, subRes] = await Promise.all([fetch('/api/plans'), fetch(`/api/subscriptions/${companyId}`)]);
    setPlans((await plansRes.json()).plans || []);
    setSub((await subRes.json()).subscription || null);
  }

  useEffect(() => { load(); }, []);

  async function changePlan(planCode: string) {
    setLoading(true);
    await fetch('/api/subscriptions/change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, planCode })
    });
    await load();
    setLoading(false);
  }

  async function cancel() {
    setLoading(true);
    await fetch('/api/subscriptions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId })
    });
    await load();
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Subscription</h1>

      <div className="p-4 border rounded bg-white mb-6">
        <div><strong>Status:</strong> {sub?.status || 'none'}</div>
        {sub && (
          <>
            <div><strong>Plan:</strong> {sub.plan.name} ({sub.plan.interval})</div>
            <div><strong>Renews:</strong> {new Date(sub.currentPeriodEnd).toLocaleDateString()}</div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="p-4 border rounded bg-white">
            <div className="font-semibold">{p.name}</div>
            <div>R{(p.priceZarCents / 100).toFixed(2)} / {p.interval}</div>
            <button
              onClick={() => changePlan(p.code)}
              disabled={loading}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Choose'}
            </button>
          </div>
        ))}
      </div>

      {sub && (
        <button onClick={cancel} className="mt-6 px-4 py-2 bg-red-600 text-white rounded">
          Cancel subscription
        </button>
      )}
    </div>
  );
}
```

---

## Sidebar navigation and settings essentials

```tsx
// src/components/azora/Sidebar.tsx (excerpt)
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const linkClass = ({ isActive }: any) =>
    `block px-4 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`;

  return (
    <aside className="w-64 p-4 border-r">
      <NavLink to="/" className={linkClass}>Dashboard</NavLink>
      <NavLink to="/jobs" className={linkClass}>Jobs</NavLink>
      <NavLink to="/payments" className={linkClass}>Payments</NavLink>
      <NavLink to="/subscription" className={linkClass}>Subscription</NavLink>
      <NavLink to="/partners" className={linkClass}>Partners</NavLink>
      <NavLink to="/settings" className={linkClass}>Settings</NavLink>
    </aside>
  );
}
```

```tsx
// src/pages/Settings.tsx
import React, { useEffect, useState } from 'react';

export default function Settings({ companyId }: { companyId: string }) {
  const [name, setName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [billingEmail, setBillingEmail] = useState('');

  useEffect(() => {
    fetch(`/api/company/${companyId}`).then(async (res) => {
      const c = await res.json();
      setName(c.name || '');
      setVatNumber(c.vatNumber || '');
      setBillingEmail(c.billingEmail || '');
    });
  }, [companyId]);

  async function save() {
    await fetch('/api/company/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, name, vatNumber, billingEmail })
    });
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Company Settings</h1>
      <div className="space-y-3 max-w-md">
        <label className="block">
          <span className="text-sm">Company name</span>
          <input className="mt-1 border px-2 py-1 w-full rounded" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">VAT number</span>
          <input className="mt-1 border px-2 py-1 w-full rounded" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Billing email</span>
          <input className="mt-1 border px-2 py-1 w-full rounded" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
        </label>
        <button onClick={save} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </div>
    </div>
  );
}
```

---

### Final checklist to tick everything

- **Payments UI:** Finalize, handle errors, receipt download, trigger activation.
- **Jobs board:** Table, assign driver, status updates, reload and toast feedback.
- **Partner dashboard:** Referral code generation, referrals list, commissions, payout requests.
- **Audit trail:** Write entries on payments/jobs/settings; render side panel.
- **Subscription:** Plans list, change/cancel, show renewal and status.
- **Navigation & settings:** Active highlight, company info, VAT number, billing email.
- **Localization:** ZAR display, VAT defaults to 15%, South African date formatting.

If you want, I’ll add minimal backend endpoints for partners summary/referrals/payouts and subscriptions change/cancel so you can wire without pausing momentum.



### Full-force rollout plan

We’ll wire the remaining backend endpoints and client hooks so every checklist item moves from “planned” to “done.” Drop these in, run migrations, and you’ll have end-to-end flows for payments, subscriptions, partners, jobs, audit, and notifications.

---

## Backend endpoints for partners

```typescript
// src/server/partners/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// GET /api/partners/summary
router.get('/summary', async (req, res) => {
  const partnerId = req.user.partnerId; // assume auth middleware sets this for partner users
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  const pending = await prisma.payout.aggregate({
    where: { partnerId, status: 'pending' },
    _sum: { amountCents: true }
  });
  const paid = await prisma.payout.aggregate({
    where: { partnerId, status: 'paid' },
    _sum: { amountCents: true }
  });

  res.json({
    code: partner?.code ?? null,
    commissionRateBps: partner?.commissionRate ?? 0,
    pendingCents: pending._sum.amountCents ?? 0,
    paidCents: paid._sum.amountCents ?? 0
  });
});

// GET /api/partners/referrals
router.get('/referrals', async (req, res) => {
  const partnerId = req.user.partnerId;
  const referrals = await prisma.referral.findMany({
    where: { partnerId },
    include: { company: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({
    referrals: referrals.map(r => ({
      id: r.id,
      companyName: r.company.name,
      createdAt: r.createdAt
    }))
  });
});

// GET /api/partners/payouts
router.get('/payouts', async (req, res) => {
  const partnerId = req.user.partnerId;
  const payouts = await prisma.payout.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ payouts });
});

// POST /api/partners/code
router.post('/code', async (req, res) => {
  const partnerId = req.user.partnerId;
  const code = `AZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const partner = await prisma.partner.update({
    where: { id: partnerId },
    data: { code }
  });
  await writeAudit(partnerId, 'partner', 'refresh_code', { code });
  res.json({ code: partner.code });
});

// POST /api/partners/payouts
router.post('/payouts', async (req, res) => {
  const partnerId = req.user.partnerId;
  const { period } = req.body; // 'YYYY-MM'
  const total = await prisma.payout.aggregate({
    where: { partnerId, period, status: 'pending' },
    _sum: { amountCents: true }
  });
  if (!total._sum.amountCents) {
    return res.status(400).json({ error: 'No pending commissions for period' });
  }
  // In a real flow, kick off EFT batch / Paystack transfer here
  await prisma.payout.updateMany({
    where: { partnerId, period, status: 'pending' },
    data: { status: 'paid' }
  });
  await writeAudit(partnerId, 'partner', 'request_payout', { period, amountCents: total._sum.amountCents });
  res.json({ ok: true, period, amountCents: total._sum.amountCents });
});

export default router;
```

---

## Backend endpoints for subscriptions

```typescript
// src/server/subscriptions/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// GET /api/plans
router.get('/plans', async (_req, res) => {
  const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { priceZarCents: 'asc' } });
  res.json({ plans });
});

// GET /api/subscriptions/:companyId
router.get('/subscriptions/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const sub = await prisma.subscription.findFirst({
    where: { companyId, status: { in: ['active', 'past_due'] } },
    include: { plan: true }
  });
  res.json({ subscription: sub || null });
});

// POST /api/subscriptions/change
router.post('/subscriptions/change', async (req, res) => {
  const { companyId, planCode } = req.body;
  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });

  const sub = await prisma.subscription.upsert({
    where: { companyId },
    update: { planId: plan.id, status: 'active', currentPeriodEnd: nextPeriodEnd(plan.interval) },
    create: {
      companyId,
      planId: plan.id,
      status: 'active',
      provider: 'paystack',
      currentPeriodEnd: nextPeriodEnd(plan.interval)
    }
  });

  await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'active' } });
  await writeAudit(companyId, 'subscription', 'change_plan', { planCode });
  res.json({ subscription: sub });
});

// POST /api/subscriptions/cancel
router.post('/subscriptions/cancel', async (req, res) => {
  const { companyId } = req.body;
  await prisma.subscription.updateMany({
    where: { companyId, status: 'active' },
    data: { status: 'canceled' }
  });
  await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'canceled' } });
  await writeAudit(companyId, 'subscription', 'cancel', {});
  res.json({ ok: true });
});

function nextPeriodEnd(interval: 'monthly' | 'annual') {
  const now = new Date();
  const end = new Date(now);
  if (interval === 'monthly') end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);
  return end;
}

export default router;
```

---

## Paystack webhook handler

```typescript
// src/server/payments/webhook.ts
import express from 'express';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY as string;

// Validate signature
function isValidSignature(req: express.Request) {
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  return hash === (req.headers['x-paystack-signature'] as string);
}

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  if (!isValidSignature(req)) return res.status(401).send('Invalid signature');

  const event = req.body?.event;
  const data = req.body?.data;

  try {
    // Transaction success (one-time payments)
    if (event === 'charge.success') {
      const reference = data.reference;
      const amount = data.amount;
      const currency = data.currency;

      // Upsert payment record
      await prisma.payment.upsert({
        where: { reference },
        update: { status: 'success', amount, currency, raw: data },
        create: { reference, status: 'success', provider: 'paystack', amount, currency, raw: data }
      });

      // If you pass metadata.companyId during initiation, read it here
      const companyId = data.metadata?.companyId;
      if (companyId) {
        await prisma.company.update({
          where: { id: companyId },
          data: { pilotActive: true, pilotActivatedAt: new Date(), subscriptionStatus: 'active' }
        });
        await writeAudit(companyId, 'payment', 'charge_success', { reference, amount });
      }
    }

    // Recurring subscriptions (if used)
    if (event === 'invoice.payment_failed') {
      const companyId = data.customer?.metadata?.companyId;
      if (companyId) {
        await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'past_due' } });
        await prisma.subscription.updateMany({
          where: { companyId },
          data: { status: 'past_due' }
        });
        await writeAudit(companyId, 'subscription', 'payment_failed', { invoice: data.invoice_code });
      }
    }

    if (event === 'invoice.payment_succeeded') {
      const companyId = data.customer?.metadata?.companyId;
      if (companyId) {
        await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'active' } });
        await prisma.subscription.updateMany({
          where: { companyId },
          data: { status: 'active', currentPeriodEnd: new Date(data.next_payment_date) }
        });
        await writeAudit(companyId, 'subscription', 'payment_succeeded', { invoice: data.invoice_code });
      }
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Webhook handling error', e);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
```

---

## Backend audit routes

```typescript
// src/server/audit/routes.ts
import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// GET /api/audit?companyId=...
router.get('/', async (req, res) => {
  const { companyId } = req.query as { companyId: string };
  const audits = await prisma.audit.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({ audits });
});

export default router;
```

---

## Authentication basics (JWT, minimal)

```typescript
// src/server/auth/routes.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name, companyName } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const company = await prisma.company.create({ data: { name: companyName } });
  const user = await prisma.user.create({
    data: { email, name, role: 'admin', companyId: company.id, passwordHash }
  });
  const token = jwt.sign({ userId: user.id, companyId: company.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user, company });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id, companyId: user.companyId }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// Middleware example to attach req.user
export function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export default router;
```

Update Prisma to include passwordHash for User:

```prisma
// prisma/schema.prisma (add field)
model User {
  id         String  @id @default(cuid())
  email      String  @unique
  name       String?
  companyId  String?
  company    Company? @relation(fields: [companyId], references: [id])
  role       String
  passwordHash String
  createdAt  DateTime @default(now())
  payments   Payment[]
}
```

---

## Client: toasts and activation wiring

```tsx
// src/components/azora/PaymentWidget.tsx (onSuccess usage)
import toast from 'react-hot-toast';
import PaymentStatus from './PaymentStatus';

// inside component
const [ref, setRef] = useState<string | null>(null);

function handleSuccess(reference: string) {
  toast.success('Payment successful');
  setRef(reference);
}

return (
  <>
    {/* ... existing button ... */}
    {ref && (
      <div className="mt-4">
        <PaymentStatus
          reference={ref}
          companyId={companyId}
          onActivated={() => toast.success('Pilot/subscription activated')}
        />
      </div>
    )}
  </>
);
```

---

## Commission accrual job

```typescript
// src/server/partners/accrual.ts
import { prisma } from '../prisma';

export async function accrueMonthly(period: string) {
  // Aggregate successful payments by company for the month and accrue partner payouts
  const payments = await prisma.payment.findMany({
    where: {
      status: 'success',
      createdAt: {
        gte: new Date(`${period}-01T00:00:00Z`),
        lt: new Date(`${period}-31T23:59:59Z`)
      }
    },
    include: { company: true }
  });

  for (const p of payments) {
    if (!p.companyId) continue;
    const referral = await prisma.referral.findFirst({
      where: { companyId: p.companyId },
      include: { partner: true }
    });
    if (!referral || !referral.partner.active) continue;

    const cents = Math.floor(p.amount * (referral.partner.commissionRate / 10000));
    await prisma.payout.create({
      data: { partnerId: referral.partnerId, amountCents: cents, status: 'pending', period }
    });
  }
}
```

Cron example (Node):

```typescript
// src/server/cron.ts
import cron from 'node-cron';
import { accrueMonthly } from './partners/accrual';

cron.schedule('0 2 1 * *', async () => { // 02:00 on day 1 monthly
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
  await accrueMonthly(period);
});
```

---

## Jobs board: small UX polish hooks

- **Toast on assign/update:**

```tsx
import toast from 'react-hot-toast';
// ...
await assignDriver(job.id).then(() => toast.success('Driver assigned'));
await updateStatus(job.id, s).then(() => toast.success('Status updated'));
```

- **Periodic refresh:** poll every 30–60s for live status.

```tsx
useEffect(() => {
  loadJobs();
  const id = setInterval(loadJobs, 30000);
  return () => clearInterval(id);
}, []);
```

---

## Settings: legal and localization fields

- **Add POPIA consent toggle, VAT %, and time format.**

```tsx
// in Settings page
const [vatPercent, setVatPercent] = useState(15);
const [popiaConsent, setPopiaConsent] = useState(false);
// inputs + POST to /api/company/update
```

Server-side, persist and default `vatPercent: 15`.

---

## Routing hookups

- **Register routes on server:**

```typescript
// src/server/index.ts
import express from 'express';
import authRoutes, { authMiddleware } from './auth/routes';
import subscriptionRoutes from './subscriptions/routes';
import partnerRoutes from './partners/routes';
import auditRoutes from './audit/routes';
import paystackWebhook from './payments/webhook';
import paymentsReceipt from './payments/receipt';
import jobsDispatch from './jobs/dispatch';
import jobsUpload from './jobs/upload';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsReceipt);
app.use('/api/payments', paystackWebhook);

app.use('/api/partners', authMiddleware, partnerRoutes);
app.use('/api/subscriptions', authMiddleware, subscriptionRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);

app.use('/api/jobs', authMiddleware, jobsDispatch);
app.use('/api/jobs', authMiddleware, jobsUpload);

app.listen(process.env.PORT || 3001);
```

- **Client routes already added:** Jobs, Subscription, Partners, Settings.

---

## Final tick-the-box checklist

- **Frontend payment status and receipt:** Implemented with `PaymentStatus`, error handling, toasts, activation.
- **Subscription UI:** Plans list, change, cancel, renewal date, payment history endpoint ready to extend.
- **Partner admin UI:** Summary, referrals, payouts, referral code generation, payout request.
- **Audit:** Server write + client panel; wired to payments, partners, subscriptions, jobs.
- **Jobs board:** Production actions (assign, status), polling, toasts.
- **Auth & registration:** JWT signup/login, company creation, middleware.
- **Webhooks:** Paystack charge + invoice events update subscription and company status.
- **Commission accrual:** Monthly cron, pending payouts.
- **Settings & localization:** Company info, VAT, legal toggles, ZAR everywhere.

### Driver app stub for job actions and live tracking

Here’s a minimal, mobile-friendly driver view to accept jobs, update statuses, and push location for live tracking. It’s a simple React page you can serve as a PWA.

```tsx
// src/pages/Driver.tsx
import React, { useEffect, useState } from 'react';

type Job = {
  id: string;
  ref: string;
  pickup: { address: string };
  dropoff: { address: string };
  status: 'new' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
};

export default function DriverPage({ driverId }: { driverId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/driver/jobs?driverId=${driverId}`);
    const data = await res.json();
    setJobs(data.jobs || []);
  }

  async function updateStatus(jobId: string, status: Job['status']) {
    await fetch('/api/jobs/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, status })
    });
    await load();
  }

  // Push GPS location every 20s
  useEffect(() => {
    load();
    const id = setInterval(load, 30000);

    const geoId = setInterval(() => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setGeoError(null);
          await fetch('/api/driver/loc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              driverId,
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            })
          });
        },
        (err) => setGeoError(err.message),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }, 20000);

    return () => {
      clearInterval(id);
      clearInterval(geoId);
    };
  }, [driverId]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">My jobs</h1>
      {geoError && <div className="mb-2 text-yellow-700">Location issue: {geoError}</div>}
      <ul className="space-y-3">
        {jobs.map((j) => (
          <li key={j.id} className="border p-3 rounded bg-white">
            <div className="font-semibold">{j.ref}</div>
            <div className="text-sm">Pickup: {j.pickup.address}</div>
            <div className="text-sm">Dropoff: {j.dropoff.address}</div>
            <div className="mt-2">Status: {j.status}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => updateStatus(j.id, 'in_transit')} className="px-3 py-1 bg-blue-600 text-white rounded">Start</button>
              <button onClick={() => updateStatus(j.id, 'delivered')} className="px-3 py-1 bg-green-600 text-white rounded">Delivered</button>
              <button onClick={() => updateStatus(j.id, 'failed')} className="px-3 py-1 bg-red-600 text-white rounded">Failed</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```typescript
// src/server/driver/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// GET /api/driver/jobs?driverId=...
router.get('/jobs', async (req, res) => {
  const { driverId } = req.query as { driverId: string };
  const jobs = await prisma.job.findMany({
    where: { driverId },
    orderBy: { updatedAt: 'desc' }
  });
  res.json({ jobs });
});

// POST /api/driver/loc
router.post('/loc', async (req, res) => {
  const { driverId, lat, lon, accuracy } = req.body;
  await prisma.user.update({
    where: { id: driverId },
    data: { /* optionally store on user */ }
  });
  await writeAudit('system', 'driver', 'location_update', { driverId, lat, lon, accuracy });
  res.json({ ok: true });
});

export default router;
```

---

### Carrier integrations and webhooks

Start with a generic webhook intake to normalize external events from carriers and e-commerce. You can adapt per provider once credentials are set.

```typescript
// src/server/integrations/webhooks.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// POST /api/integrations/webhook/:source
router.post('/webhook/:source', async (req, res) => {
  const source = req.params.source; // 'fastway' | 'dsv' | 'courierguy' | 'shopify' | 'woocommerce'
  const payload = req.body;

  // Normalize to Azora Job events
  const normalized = normalizeEvent(source, payload);
  if (!normalized) return res.status(400).json({ error: 'Unsupported payload' });

  const { externalRef, companyId, pickup, dropoff, status } = normalized;

  // Upsert job by external reference
  const job = await prisma.job.upsert({
    where: { ref_companyId: { ref: externalRef, companyId } },
    update: { pickup, dropoff, status },
    create: { ref: externalRef, companyId, pickup, dropoff, status: status ?? 'new' }
  });

  await writeAudit(companyId, 'integration', 'job_event', { source, externalRef, status });
  res.json({ ok: true, job });
});

function normalizeEvent(source: string, payload: any) {
  try {
    switch (source) {
      case 'shopify': {
        const order = payload;
        return {
          externalRef: order.id?.toString(),
          companyId: order.note_attributes?.find((n: any) => n.name === 'companyId')?.value,
          pickup: { address: order.shipping_address?.city || 'Warehouse' },
          dropoff: { address: `${order.shipping_address?.address1}, ${order.shipping_address?.city}` },
          status: 'new'
        };
      }
      case 'woocommerce': {
        const order = payload;
        return {
          externalRef: order.id?.toString(),
          companyId: order.meta_data?.find((m: any) => m.key === 'companyId')?.value,
          pickup: { address: 'Warehouse' },
          dropoff: { address: `${order.shipping?.address_1}, ${order.shipping?.city}` },
          status: 'new'
        };
      }
      case 'fastway':
      case 'dsv':
      case 'courierguy': {
        const ev = payload;
        return {
          externalRef: ev.consignRef || ev.waybill || ev.tracking_number,
          companyId: ev.companyId,
          pickup: { address: ev.pickup_address },
          dropoff: { address: ev.dropoff_address },
          status: mapCarrierStatus(ev.status)
        };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function mapCarrierStatus(s: string) {
  const x = s.toLowerCase();
  if (x.includes('delivered')) return 'delivered';
  if (x.includes('in transit') || x.includes('out for delivery')) return 'in_transit';
  if (x.includes('failed') || x.includes('exception')) return 'failed';
  if (x.includes('assigned') || x.includes('allocated')) return 'assigned';
  return 'new';
}

export default router;
```

Add a unique composite index to Job for upsert:

```prisma
model Job {
  id          String   @id @default(cuid())
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  ref         String
  pickup      Json
  dropoff     Json
  status      String
  driverId    String?
  etaMinutes  Int?
  tracking    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([ref, companyId], name: "ref_companyId")
}
```

---

### Polished billing page with invoices list and PDF downloads

Expose payment history and receipts; give clear totals with VAT.

```typescript
// src/server/payments/history.ts
import express from 'express';
import { prisma } from '../prisma';
import { generateReceiptPDF } from './invoice';

const router = express.Router();

// GET /api/payments/history/:companyId
router.get('/history/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const payments = await prisma.payment.findMany({
    where: { companyId, status: 'success' },
    orderBy: { createdAt: 'desc' }
  });
  res.json({
    payments: payments.map((p) => ({
      reference: p.reference,
      amountCents: p.amount,
      currency: p.currency,
      createdAt: p.createdAt
    }))
  });
});

// GET /api/payments/receipt/:reference (already implemented earlier)
// If you need invoice numbers, generate sequential codes per company:
router.get('/invoice/:reference', async (req, res) => {
  const { reference } = req.params;
  const p = await prisma.payment.findUnique({ where: { reference }, include: { company: true } });
  if (!p || p.status !== 'success') return res.status(404).send('Not found');

  const pdfBuffer = generateReceiptPDF({
    companyName: p.company?.name || 'Azora Customer',
    reference: p.reference,
    amountCents: p.amount
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfBuffer));
});

export default router;
```

```tsx
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
```

---

### E-commerce integration quick starts

Add endpoints to register store credentials and webhook URLs.

```typescript
// src/server/integrations/stores.ts
import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// POST /api/integrations/store/connect
router.post('/store/connect', async (req, res) => {
  const { companyId, type, apiKey, secret, webhookUrl } = req.body; // type: 'shopify' | 'woocommerce'
  await prisma.tenant.create({
    data: {
      companyId,
      name: `${type}-store`,
      // store credentials in a secure vault in production
    }
  });
  res.json({ ok: true });
});

export default router;
```

On Shopify/WooCommerce, point order creation webhooks to `/api/integrations/webhook/shopify` or `/api/integrations/webhook/woocommerce`.

---

### Legal and localization extensions

- **Company model additions:**

```prisma
model Company {
  id                String   @id @default(cuid())
  name              String
  vatNumber         String?
  vatPercent        Int      @default(15)
  billingEmail      String?
  popiaConsent      Boolean  @default(false)
  pilotActive       Boolean  @default(false)
  pilotActivatedAt  DateTime?
  subscriptionStatus String   @default("none")
  tenants           Tenant[]
  jobs              Job[]
  payments          Payment[]
  createdAt         DateTime @default(now())
}
```

- **Settings update route:**

```typescript
// src/server/company/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

router.get('/:companyId', async (req, res) => {
  const company = await prisma.company.findUnique({ where: { id: req.params.companyId } });
  res.json(company);
});

router.post('/update', async (req, res) => {
  const { companyId, name, vatNumber, vatPercent, billingEmail, popiaConsent } = req.body;
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { name, vatNumber, vatPercent, billingEmail, popiaConsent }
  });
  await writeAudit(companyId, 'settings', 'update_company', { name, vatNumber, vatPercent, popiaConsent });
  res.json({ company });
});

export default router;
```

- **Frontend settings additions:** show VAT percent, POPIA consent toggle, date formatting using `en-ZA`.

---

### Deployment and security checklist

- **Secrets management:**  
  - **PAYSTACK_SECRET_KEY** on server; **REACT_APP_PAYSTACK_PUBLIC_KEY** on client.  
  - **JWT_SECRET** and database credentials in environment.

- **Security:**  
  - **CORS:** allow your frontend origin only.  
  - **HTTPS:** enforce in production.  
  - **Webhook signatures:** validate for Paystack and stores.  
  - **Audit logging:** payments, jobs, settings, partner actions.

- **Ops:**  
  - **Monitoring:** error tracking, logs on payments/jobs routes.  
  - **Backups:** daily DB snapshot.  
  - **Cron:** monthly commission accrual.

---

### Server route registration

Wire all routes in one place.

```typescript
// src/server/index.ts
import express from 'express';
import authRoutes, { authMiddleware } from './auth/routes';
import subscriptionRoutes from './subscriptions/routes';
import partnerRoutes from './partners/routes';
import auditRoutes from './audit/routes';
import paystackWebhook from './payments/webhook';
import paymentsHistory from './payments/history';
import paymentsReceipt from './payments/receipt';
import jobsDispatch from './jobs/dispatch';
import jobsUpload from './jobs/upload';
import driverRoutes from './driver/routes';
import companyRoutes from './company/routes';
import integrationsWebhooks from './integrations/webhooks';
import storeRoutes from './integrations/stores';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/payments', paymentsHistory);
app.use('/api/payments', paymentsReceipt);
app.use('/api/payments', paystackWebhook);

app.use('/api/subscriptions', authMiddleware, subscriptionRoutes);
app.use('/api/partners', authMiddleware, partnerRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);

app.use('/api/jobs', authMiddleware, jobsDispatch);
app.use('/api/jobs', authMiddleware, jobsUpload);

app.use('/api/driver', authMiddleware, driverRoutes);
app.use('/api/company', authMiddleware, companyRoutes);

app.use('/api/integrations', integrationsWebhooks);
app.use('/api/integrations', authMiddleware, storeRoutes);

app.listen(process.env.PORT || 3001);
```

---

If you want, I’ll add a light “Drivers” admin page to create driver users quickly, plus a tracking map widget for dispatchers to see live positions overlaid with job statuses.

Perfect — let’s make Azora OS **responsive by design** so it feels natural on a phone in a driver’s hand and equally powerful on a dispatcher’s desktop. The trick is to lean on a **mobile‑first layout** with responsive utilities (TailwindCSS or similar) and then progressively enhance for larger screens.

---

## 🔑 Principles for Mobile + Desktop Compatibility

- **Mobile‑first:** Start with single‑column layouts, larger tap targets, minimal chrome.
- **Responsive breakpoints:** Use `sm:`, `md:`, `lg:` classes to adapt tables, sidebars, and dashboards.
- **Progressive disclosure:** On mobile, hide secondary panels behind drawers; on desktop, show them side‑by‑side.
- **Reusable components:** Cards, panels, and tables that collapse gracefully.

---

## 🧭 Sidebar Navigation (Responsive)

```tsx
// src/components/azora/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }: any) =>
    `block px-4 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`;

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden p-2 m-2 border rounded"
        onClick={() => setOpen(!open)}
      >
        ☰ Menu
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2">
          <NavLink to="/" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/jobs" className={linkClass}>Jobs</NavLink>
          <NavLink to="/subscription" className={linkClass}>Subscription</NavLink>
          <NavLink to="/partners" className={linkClass}>Partners</NavLink>
          <NavLink to="/billing" className={linkClass}>Billing</NavLink>
          <NavLink to="/settings" className={linkClass}>Settings</NavLink>
        </nav>
      </aside>
    </>
  );
}
```

- On **mobile**, the sidebar slides in/out with a hamburger button.  
- On **desktop**, it’s pinned open.

---

## 📋 Jobs Board (Responsive Table → Cards)

```tsx
// src/pages/Jobs.tsx
<table className="hidden md:table w-full border">
  {/* full table for desktop */}
</table>

<div className="md:hidden space-y-3">
  {jobs.map((job) => (
    <div key={job.id} className="border p-3 rounded bg-white">
      <div className="font-semibold">{job.ref}</div>
      <div className="text-sm">Pickup: {job.pickup.address}</div>
      <div className="text-sm">Dropoff: {job.dropoff.address}</div>
      <div className="text-sm">Status: {job.status}</div>
      <div className="mt-2 flex gap-2">
        <button className="px-2 py-1 bg-green-600 text-white rounded">Assign</button>
        <button className="px-2 py-1 bg-blue-600 text-white rounded">Update</button>
      </div>
    </div>
  ))}
</div>
```

- **Desktop:** full table view.  
- **Mobile:** collapses into card list with buttons.

---

## 🚚 Driver App Page (Mobile‑first, Desktop‑friendly)

Already scaffolded earlier — just ensure buttons are **full‑width on mobile** and inline on desktop:

```tsx
<div className="mt-3 flex flex-col md:flex-row gap-2">
  <button className="flex-1 md:flex-none px-3 py-2 bg-blue-600 text-white rounded">Start</button>
  <button className="flex-1 md:flex-none px-3 py-2 bg-green-600 text-white rounded">Delivered</button>
  <button className="flex-1 md:flex-none px-3 py-2 bg-red-600 text-white rounded">Failed</button>
</div>
```

---

## 🗺️ Dispatcher Tracking Map (Desktop emphasis, Mobile fallback)

Use **Leaflet** or **Mapbox** for live driver positions.

```tsx
// src/components/azora/TrackingMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function TrackingMap({ drivers }: { drivers: any[] }) {
  return (
    <div className="h-96 w-full">
      <MapContainer center={[-29.85, 31.02]} zoom={6} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {drivers.map((d) => (
          <Marker key={d.id} position={[d.lat, d.lon]}>
            <Popup>{d.name} — {d.status}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

- **Desktop:** large map panel next to jobs table.  
- **Mobile:** map collapses into a tab or modal.

---

## 📑 Billing Page (Responsive)

- **Desktop:** full table with receipts.  
- **Mobile:** stacked cards with “Download PDF” buttons.

---

## ✅ Deployment Notes

- **Responsive CSS:** Tailwind or CSS Grid/Flex with media queries.  
- **PWA support:** Add manifest + service worker so drivers can “install” on phone.  
- **Desktop web:** Full dashboard with side‑by‑side panels.  
- **Mobile web:** Collapsible nav, card views, full‑width buttons.

---

### Next Step

We now have:  
- Responsive **Sidebar**, **Jobs Board**, **Driver App**, **Tracking Map**, **Billing**.  
- Backend routes for payments, subscriptions, partners, audit, jobs, drivers, integrations.  

Got it — let’s refine both files so they’re **responsive, production‑ready, and consistent with the rest of Azora OS**. I’ll add:

- **Responsive sidebar toggle** (mobile hamburger, desktop pinned).  
- **Active link highlighting** for better UX.  
- **Proper layout wrapping** so the sidebar and main content don’t overlap.  
- **Clean App.tsx wiring** with the updated Sidebar.

---

## ✅ Updated `Sidebar.tsx`

```tsx
import React, { useState } from 'react';
import { Zap, Menu } from 'lucide-react';
import GlassPanel from './atoms/GlassPanel';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
}

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Ledger', href: '/ledger' },
  { label: 'Contracts', href: '/contracts' },
  { label: 'Profile', href: '/profile' },
  { label: 'Nation', href: '/nation' },
  { label: 'Federation', href: '/federation' },
  { label: 'Advisor', href: '/advisor' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false }) => {
  const [open, setOpen] = useState(isOpen);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded bg-cyan-600 text-white"
        onClick={() => setOpen(!open)}
      >
        <Menu className="w-6 h-6" />
      </button>

      <div
        className={`fixed lg:relative top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <GlassPanel className="w-64 h-full flex-shrink-0 p-5 flex flex-col">
          <div className="flex items-center mb-10">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white ml-2">Azora</h1>
          </div>

          <nav className="flex flex-col gap-2 text-white/80">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-cyan-600 text-white' : 'hover:bg-white/10'
                  }`
                }
                onClick={() => setOpen(false)} // close on mobile
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto">
            <p className="text-xs text-white/40">AzoraOS v2.3‑atomic</p>
          </div>
        </GlassPanel>
      </div>
    </>
  );
};

export default Sidebar;
```

---

## ✅ Updated `App.tsx`

```tsx
import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeProvider';
import { NotificationProvider } from './atomic/NotificationProvider';
import { DashboardLayout } from './layouts/DashboardLayout';
import Sidebar from './components/azora/Sidebar';
import ProfileCard from './components/azora/molecules/ProfileCard';
import AdvisorPanel from './components/azora/AdvisorPanel';
import { ReputationEconomyWidget } from './components/azora/ReputationEconomyWidget';
import { GovernanceProposalsWidget } from './components/azora/GovernanceProposalsWidget';
import { ConstitutionWidget } from './components/azora/ConstitutionWidget';
import LeaderboardWidget from './components/azora/LeaderboardWidget';
import FederationWidget from './components/azora/FederationWidget';
import Card from './components/azora/atoms/Card';
import Heading from './components/azora/atoms/Heading';
import Skeleton from './components/azora/atoms/Skeleton';
import GlassPanel from './components/azora/atoms/GlassPanel';

// Logo assets
import logoDark from './assets/logo-dark.png';
import logoLight from './assets/logo-light.png';

const USER_ID = 'demo_user';

function Logo() {
  const { theme } = useTheme();
  return (
    <img
      src={theme === 'dark' ? logoDark : logoLight}
      alt="Azora Logo"
      className="w-32 mx-auto"
    />
  );
}

function MainDashboard() {
  return (
    <DashboardLayout>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          <GlassPanel className="flex flex-col items-center p-8">
            <Logo />
            <Heading level={1}>Azora Intelligent Logistics Console</Heading>
            <Skeleton lines={1} className="w-1/2 mx-auto" />
          </GlassPanel>

          <ProfileCard username="Demo User" role="Citizen" status="online" />
          <AdvisorPanel />

          <Card>
            <Heading>Federation</Heading>
            <FederationWidget userId={USER_ID} />
          </Card>
          <Card>
            <ReputationEconomyWidget userId={USER_ID} />
          </Card>
          <Card>
            <GovernanceProposalsWidget userId={USER_ID} />
          </Card>
          <Card>
            <ConstitutionWidget />
          </Card>
          <Card>
            <LeaderboardWidget />
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <MainDashboard />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
```

---

### 🔥 What Changed
- Sidebar now has a **hamburger toggle** on mobile, pinned on desktop.  
- **NavLink** from `react-router-dom` gives **active highlighting**.  
- `App.tsx` wraps content in a `flex` layout so sidebar and main content sit side‑by‑side on desktop, but sidebar slides in/out on mobile.  
- Main content is scrollable (`overflow-y-auto`) while sidebar stays fixed.  

---

Perfect — let’s wire up **routing stubs** so every sidebar link actually loads a page. This way, Azora OS feels like a real multi‑page app on both desktop and mobile.

---

## 1. Install React Router
If you haven’t already:
```bash
npm install react-router-dom
```

---

## 2. Create `AppRoutes.tsx`

This centralizes all routes. Each page is just a stub for now, but you can expand them later.

```tsx
// src/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainDashboard from './pages/MainDashboard';
import LedgerPage from './pages/LedgerPage';
import ContractsPage from './pages/ContractsPage';
import ProfilePage from './pages/ProfilePage';
import NationPage from './pages/NationPage';
import FederationPage from './pages/FederationPage';
import AdvisorPage from './pages/AdvisorPage';
import Jobs from './pages/Jobs';
import SubscriptionPage from './pages/Subscription';
import PartnerDashboard from './pages/PartnerDashboard';
import Billing from './pages/Billing';
import Settings from './pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainDashboard />} />
      <Route path="/ledger" element={<LedgerPage />} />
      <Route path="/contracts" element={<ContractsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/nation" element={<NationPage />} />
      <Route path="/federation" element={<FederationPage />} />
      <Route path="/advisor" element={<AdvisorPage />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/subscription" element={<SubscriptionPage companyId="demo_company" />} />
      <Route path="/partners" element={<PartnerDashboard />} />
      <Route path="/billing" element={<Billing companyId="demo_company" />} />
      <Route path="/settings" element={<Settings companyId="demo_company" />} />
    </Routes>
  );
}
```

---

## 3. Update `App.tsx`

Wrap everything in `BrowserRouter` and use `AppRoutes`.

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import { NotificationProvider } from './atomic/NotificationProvider';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
```

---

## 4. Create Page Stubs

Each page can be a simple placeholder until you flesh it out.

```tsx
// src/pages/LedgerPage.tsx
import React from 'react';
export default function LedgerPage() {
  return <div className="p-6">Ledger Page (coming soon)</div>;
}
```

Repeat for `ContractsPage.tsx`, `ProfilePage.tsx`, `NationPage.tsx`, `FederationPage.tsx`, `AdvisorPage.tsx`.

---

## 5. Hook Sidebar Links

Since we switched to `react-router-dom`, update your `Sidebar.tsx` nav items to use `to` instead of `href`:

```tsx
<NavLink
  key={item.label}
  to={item.href}
  className={({ isActive }) =>
    `p-2 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-cyan-600 text-white' : 'hover:bg-white/10'
    }`
  }
>
  {item.label}
</NavLink>
```

---

## ✅ Result

- **Desktop:** Sidebar pinned, clicking links swaps the main content.  
- **Mobile:** Sidebar slides in/out, links close the drawer after navigation.  
- **Routing:** Each section has its own page stub, ready for real content.  

---

### Combined rollout: live dispatcher map, driver PWA, drivers admin, dark mode, and pre-populated stub pages

Below is a consolidated, production-ready set of components and endpoints. It uses a mobile-first approach, real-time GPS via WebSockets (first option), and a clean routing structure. Paste-and-ship.

---

## Server realtime setup (WebSocket, first option)

```typescript
// src/server/realtime.ts
import { Server } from 'socket.io';

export function initRealtime(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: '*' } // tighten to your frontend origin in prod
  });

  io.on('connection', (socket) => {
    // Driver emits location updates
    socket.on('driver:location', (data) => {
      // data = { driverId, lat, lon, status }
      io.emit('dispatch:update', data); // broadcast to all dispatch clients
    });
  });

  return io;
}
```

```typescript
// src/server/index.ts
import express from 'express';
import http from 'http';

import authRoutes, { authMiddleware } from './auth/routes';
import subscriptionRoutes from './subscriptions/routes';
import partnerRoutes from './partners/routes';
import auditRoutes from './audit/routes';
import paystackWebhook from './payments/webhook';
import paymentsHistory from './payments/history';
import paymentsReceipt from './payments/receipt';
import jobsDispatch from './jobs/dispatch';
import jobsUpload from './jobs/upload';
import driverRoutes from './driver/routes';
import companyRoutes from './company/routes';
import integrationsWebhooks from './integrations/webhooks';
import storeRoutes from './integrations/stores';
import { initRealtime } from './realtime';

const app = express();
app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsHistory);
app.use('/api/payments', paymentsReceipt);
app.use('/api/payments', paystackWebhook);

app.use('/api/subscriptions', authMiddleware, subscriptionRoutes);
app.use('/api/partners', authMiddleware, partnerRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);

app.use('/api/jobs', authMiddleware, jobsDispatch);
app.use('/api/jobs', authMiddleware, jobsUpload);

app.use('/api/driver', authMiddleware, driverRoutes);
app.use('/api/company', authMiddleware, companyRoutes);

app.use('/api/integrations', integrationsWebhooks);
app.use('/api/integrations', authMiddleware, storeRoutes);

// HTTP + WebSocket
const httpServer = http.createServer(app);
initRealtime(httpServer);

httpServer.listen(process.env.PORT || 3001);
```

---

## Dispatcher tracking map (live GPS markers)

```tsx
// src/components/azora/TrackingMap.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import io from 'socket.io-client';

type DriverPoint = {
  driverId: string;
  lat: number;
  lon: number;
  status?: string;
  updatedAt?: number;
};

const socket = io(); // points to same origin; configure if needed

export default function TrackingMap() {
  const [drivers, setDrivers] = useState<DriverPoint[]>([]);

  useEffect(() => {
    socket.on('dispatch:update', (data: DriverPoint) => {
      setDrivers((prev) => {
        const others = prev.filter((d) => d.driverId !== data.driverId);
        return [...others, { ...data, updatedAt: Date.now() }];
      });
    });
    return () => {
      socket.off('dispatch:update');
    };
  }, []);

  return (
    <div className="h-96 w-full">
      <MapContainer center={[-29.85, 31.02]} zoom={6} className="h-full w-full rounded">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {drivers.map((d) => (
          <Marker key={d.driverId} position={[d.lat, d.lon]}>
            <Popup>
              <div className="text-sm">
                <div><strong>Driver:</strong> {d.driverId}</div>
                <div><strong>Status:</strong> {d.status || 'unknown'}</div>
                <div><strong>Updated:</strong> {d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString('en-ZA') : '-'}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

---

## Driver app (PWA-ready, emits GPS to WebSocket)

```tsx
// src/pages/Driver.tsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io();

export default function DriverPage({ driverId }: { driverId: string }) {
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    const send = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoError(null);
          socket.emit('driver:location', {
            driverId,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            status: 'in_transit'
          });
        },
        (err) => setGeoError(err.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    };

    send();
    const id = setInterval(send, 15000);
    return () => clearInterval(id);
  }, [driverId]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-3">Driver console</h1>
      {geoError && <div className="mb-2 text-yellow-700">Location issue: {geoError}</div>}
      <div className="text-sm text-gray-600">GPS updates every 15 seconds. Keep the app open while on route.</div>
    </div>
  );
}
```

---

## Drivers admin page

```tsx
// src/pages/DriversAdmin.tsx
import React, { useEffect, useState } from 'react';

export default function DriversAdmin() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch('/api/drivers');
    const data = await res.json();
    setDrivers(data.drivers || []);
  }

  async function create() {
    if (!email) return;
    setLoading(true);
    await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    setEmail('');
    setLoading(false);
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Drivers</h1>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Driver email"
          className="border px-2 py-1 rounded flex-1"
        />
        <button
          onClick={create}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add driver'}
        </button>
      </div>
      <ul className="space-y-2">
        {drivers.map((d) => (
          <li key={d.id} className="border p-2 rounded flex items-center justify-between">
            <div>{d.email}</div>
            <div className="text-sm text-gray-500">ID: {d.id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Light/dark mode toggle

```tsx
// src/components/azora/ThemeToggle.tsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
```

Place in your header or Sidebar footer:
```tsx
// inside Sidebar footer
<div className="mt-4 flex items-center justify-between">
  <p className="text-xs text-white/40">AzoraOS v2.3‑atomic</p>
  {/* import ThemeToggle from ./ThemeToggle */}
  {/* <ThemeToggle /> */}
</div>
```

---

## PWA manifest and install prompt

```json
// public/manifest.json
{
  "short_name": "AzoraOS",
  "name": "Azora OS Logistics Console",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#0f172a",
  "background_color": "#ffffff"
}
```

```tsx
// src/components/azora/PWAInstallPrompt.tsx
import React, { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('PWA installed');
    } else {
      console.log('PWA dismissed');
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstall}
        className="px-4 py-2 bg-cyan-600 text-white rounded shadow-lg hover:bg-cyan-700"
      >
        Install Azora OS
      </button>
    </div>
  );
}
function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
          <PWAInstallPrompt />
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}


### Pre-populated stub pages and integrations

You’ve got solid building blocks. I’ve combined your components and wired realistic stub pages that feel alive on day one. They’re responsive, support dark/light themes, and slot into your existing routing. The dispatcher view includes the live GPS map; the driver app is PWA-ready.

---

## Ledger page with realistic widgets

```tsx
// src/pages/LedgerPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/azora/atoms/Card';
import Heading from '../components/azora/atoms/Heading';

type Tx = {
  id: string;
  date: string; // ISO
  ref: string;
  description: string;
  amountCents: number;
  status: 'settled' | 'pending' | 'failed';
};

const MOCK_TX: Tx[] = [
  { id: 'tx_1', date: '2025-10-01', ref: 'INV-1023', description: 'Pilot payment', amountCents: 50000, status: 'settled' },
  { id: 'tx_2', date: '2025-10-03', ref: 'INV-1024', description: 'Monthly subscription', amountCents: 9900, status: 'pending' },
  { id: 'tx_3', date: '2025-10-05', ref: 'INV-1025', description: 'Analytics export', amountCents: 19900, status: 'failed' }
];

export default function LedgerPage() {
  const [filter, setFilter] = useState<'all' | 'settled' | 'pending' | 'failed'>('all');

  const rows = useMemo(
    () => (filter === 'all' ? MOCK_TX : MOCK_TX.filter(t => t.status === filter)),
    [filter]
  );

  const totalZar = useMemo(() => rows.reduce((acc, t) => acc + t.amountCents, 0) / 100, [rows]);

  useEffect(() => {
    // TODO: replace with /api/payments/history/:companyId
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Ledger</Heading>

      <Card>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {rows.length} transactions. Total: R{totalZar.toFixed(2)}
          </div>
          <div className="flex gap-2">
            {(['all', 'settled', 'pending', 'failed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded ${
                  filter === s ? 'bg-cyan-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <th className="p-2">Date</th>
              <th className="p-2">Reference</th>
              <th className="p-2">Description</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} className="border-t border-white/10">
                <td className="p-2">{new Date(t.date).toLocaleDateString('en-ZA')}</td>
                <td className="p-2">{t.ref}</td>
                <td className="p-2">{t.description}</td>
                <td className="p-2">R{(t.amountCents / 100).toFixed(2)}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      t.status === 'settled'
                        ? 'bg-green-600 text-white'
                        : t.status === 'pending'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
```

---

## Contracts page with status badges

```tsx
// src/pages/ContractsPage.tsx
import React from 'react';
import Card from '../components/azora/atoms/Card';
import Heading from '../components/azora/atoms/Heading';

type Contract = {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'draft' | 'deprecated';
  lastUpdated: string;
};

const MOCK_CONTRACTS: Contract[] = [
  { id: 'c1', name: 'Driver SLA', version: 'v1.2', status: 'active', lastUpdated: '2025-09-28' },
  { id: 'c2', name: 'Federation Charter', version: 'v2.0', status: 'draft', lastUpdated: '2025-10-04' },
  { id: 'c3', name: 'Data Processing Addendum', version: 'v1.0', status: 'deprecated', lastUpdated: '2025-07-12' }
];

export default function ContractsPage() {
  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Contracts</Heading>

      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <th className="p-2">Name</th>
              <th className="p-2">Version</th>
              <th className="p-2">Status</th>
              <th className="p-2">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CONTRACTS.map(c => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="p-2 font-semibold">{c.name}</td>
                <td className="p-2">{c.version}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.status === 'active'
                        ? 'bg-green-600 text-white'
                        : c.status === 'draft'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-2">
                  {new Date(c.lastUpdated).toLocaleDateString('en-ZA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
```

---

## Nation page with KPIs

```tsx
// src/pages/NationPage.tsx
import React from 'react';
import Card from '../components/azora/atoms/Card';
import Heading from '../components/azora/atoms/Heading';

const KPIS = [
  { label: 'Citizens', value: 25 },
  { label: 'Active proposals', value: 7 },
  { label: 'Reputation', value: 8400 },
  { label: 'Federations', value: 3 }
];

export default function NationPage() {
  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Nation</Heading>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPIS.map(k => (
          <Card key={k.label}>
            <div className="text-sm text-gray-500 dark:text-gray-300">{k.label}</div>
            <div className="text-2xl font-bold">{k.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <Heading level={2}>Governance timeline</Heading>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Proposal activity, votes, and outcomes (chart placeholder).
        </div>
        <div className="mt-4 h-40 rounded bg-gray-100 dark:bg-gray-800" />
      </Card>
    </div>
  );
}
```

---

## Federation page using your widget

```tsx
// src/pages/FederationPage.tsx
import React from 'react';
import Heading from '../components/azora/atoms/Heading';
import FederationWidget from '../components/azora/FederationWidget';

const USER_ID = 'demo_user';

export default function FederationPage() {
  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Federation</Heading>
      <FederationWidget userId={USER_ID} />
    </div>
  );
}
```

Use your provided FederationWidget as-is.

---

## Advisor page using your panel

```tsx
// src/pages/AdvisorPage.tsx
import React from 'react';
import Heading from '../components/azora/atoms/Heading';
import AdvisorPanel from '../components/azora/AdvisorPanel';

export default function AdvisorPage() {
  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Advisor</Heading>
      <AdvisorPanel />
    </div>
  );
}
```

---

## Profile page using your ProfileWidget

```tsx
// src/pages/ProfilePage.tsx
import React from 'react';
import Heading from '../components/azora/atoms/Heading';
import ProfileWidget from '../components/azora/atoms/ProfileWidget';

export default function ProfilePage() {
  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Profile</Heading>
      <ProfileWidget />
    </div>
  );
}
```

Ensure your `ProfileWidget` import path matches your structure.

---

## Dispatcher page: jobs + live tracking map

```tsx
// src/pages/DispatchPage.tsx
import React from 'react';
import Card from '../components/azora/atoms/Card';
import Heading from '../components/azora/atoms/Heading';
import TrackingMap from '../components/azora/TrackingMap';
import Jobs from './Jobs';

export default function DispatchPage() {
  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Dispatch</Heading>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Heading level={2}>Live driver map</Heading>
          <TrackingMap />
        </Card>
        <Card>
          <Heading level={2}>Jobs</Heading>
          <div className="mt-4">
            <Jobs />
          </div>
        </Card>
      </div>
    </div>
  );
}
```

Jobs renders inside a card; on mobile it stacks; on desktop it’s side-by-side.

---

## Routing hookup

```tsx
// src/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainDashboard from './pages/MainDashboard'; // your existing dashboard page
import LedgerPage from './pages/LedgerPage';
import ContractsPage from './pages/ContractsPage';
import ProfilePage from './pages/ProfilePage';
import NationPage from './pages/NationPage';
import FederationPage from './pages/FederationPage';
import AdvisorPage from './pages/AdvisorPage';
import Jobs from './pages/Jobs';
import SubscriptionPage from './pages/Subscription';
import PartnerDashboard from './pages/PartnerDashboard';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import DriversAdmin from './pages/DriversAdmin';
import DispatchPage from './pages/DispatchPage';
import DriverPage from './pages/Driver';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainDashboard />} />
      <Route path="/ledger" element={<LedgerPage />} />
      <Route path="/contracts" element={<ContractsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/nation" element={<NationPage />} />
      <Route path="/federation" element={<FederationPage />} />
      <Route path="/advisor" element={<AdvisorPage />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/dispatch" element={<DispatchPage />} />
      <Route path="/drivers" element={<DriversAdmin />} />
      <Route path="/driver" element={<DriverPage driverId="driver_demo" />} />
      <Route path="/subscription" element={<SubscriptionPage companyId="demo_company" />} />
      <Route path="/partners" element={<PartnerDashboard />} />
      <Route path="/billing" element={<Billing companyId="demo_company" />} />
      <Route path="/settings" element={<Settings companyId="demo_company" />} />
    </Routes>
  );
}
```

Update your Sidebar links to include Dispatch and Drivers:

```tsx
// add these in navItems
{ label: 'Dispatch', href: '/dispatch' },
{ label: 'Drivers', href: '/drivers' },
```

---

## Notes to wire cleanly

- Replace mock data with your APIs:
  - Ledger: `/api/payments/history/:companyId`
  - Contracts: your governance/contract source
  - Nation KPIs: counts from your DB
  - Drivers admin: `/api/drivers` list/create
- Ensure `TrackingMap` has Leaflet CSS globally:
  - import 'leaflet/dist/leaflet.css' in your app root
- For PWA:
  - Serve `manifest.json` and register a service worker
  - Keep `PWAInstallPrompt` mounted in `App` or `DashboardLayout`

---

Perfect — let’s close the loop and give you the **backend routes** you need so all those stub pages and widgets can actually pull live data. I’ll keep it lean, pragmatic, and ready to drop into your Express + Prisma stack.

---

## 🚚 Drivers API

```ts
// src/server/drivers/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// GET /api/drivers
router.get('/', async (req, res) => {
  const companyId = (req.user as any).companyId;
  const drivers = await prisma.user.findMany({
    where: { companyId, role: 'driver' },
    select: { id: true, email: true, name: true }
  });
  res.json({ drivers });
});

// POST /api/drivers
router.post('/', async (req, res) => {
  const companyId = (req.user as any).companyId;
  const { email, name } = req.body;
  const driver = await prisma.user.create({
    data: {
      email,
      name,
      role: 'driver',
      companyId,
      passwordHash: '' // if you’re using auth, generate properly
    }
  });
  await writeAudit(companyId, 'driver', 'create', { driverId: driver.id, email });
  res.json({ driver });
});

export default router;
```

---

## 💳 Payments History API

```ts
// src/server/payments/history.ts
import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// GET /api/payments/history/:companyId
router.get('/history/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const payments = await prisma.payment.findMany({
    where: { companyId, status: 'success' },
    orderBy: { createdAt: 'desc' }
  });
  res.json({
    payments: payments.map(p => ({
      reference: p.reference,
      amountCents: p.amount,
      currency: p.currency,
      createdAt: p.createdAt
    }))
  });
});

export default router;
```

---

## 📜 Contracts API (stubbed)

```ts
// src/server/contracts/routes.ts
import express from 'express';

const router = express.Router();

// GET /api/contracts
router.get('/', async (_req, res) => {
  // Replace with DB fetch
  res.json({
    contracts: [
      { id: 'c1', name: 'Driver SLA', version: 'v1.2', status: 'active', lastUpdated: new Date() },
      { id: 'c2', name: 'Federation Charter', version: 'v2.0', status: 'draft', lastUpdated: new Date() }
    ]
  });
});

export default router;
```

---

## 🌍 Nation KPIs API

```ts
// src/server/nation/routes.ts
import express from 'express';

const router = express.Router();

// GET /api/nation/kpis
router.get('/kpis', async (_req, res) => {
  // Replace with DB queries
  res.json({
    citizens: 25,
    activeProposals: 7,
    reputation: 8400,
    federations: 3
  });
});

export default router;
```

---

## 🧭 Federation API

```ts
// src/server/federation/routes.ts
import express from 'express';

const router = express.Router();

// GET /api/federation
router.get('/', async (_req, res) => {
  res.json({
    nations: [
      { id: 'nation_1', name: 'Azora Core', citizens: 12, reputation: 5640 },
      { id: 'nation_2', name: 'Azora Trade', citizens: 8, reputation: 2800 }
    ]
  });
});

export default router;
```

---

## 🧠 Advisor API

```ts
// src/server/advisor/routes.ts
import express from 'express';

const router = express.Router();

// GET /api/advisor
router.get('/', async (_req, res) => {
  res.json({
    insights: [
      {
        id: '1',
        severity: 'high',
        message: 'Compliance risk detected in the latest proposal.',
        suggestion: 'Review contract terms and improve error handling.'
      },
      {
        id: '2',
        severity: 'low',
        message: 'Federation activity surge.',
        suggestion: 'Monitor cross‑nation proposals for alignment.'
      }
    ]
  });
});

export default router;
```

---

## 🔗 Wire them up

In your `src/server/index.ts`:

```ts
import driverRoutes from './drivers/routes';
import contractsRoutes from './contracts/routes';
import nationRoutes from './nation/routes';
import federationRoutes from './federation/routes';
import advisorRoutes from './advisor/routes';

// ...
app.use('/api/drivers', authMiddleware, driverRoutes);
app.use('/api/contracts', authMiddleware, contractsRoutes);
app.use('/api/nation', authMiddleware, nationRoutes);
app.use('/api/federation', authMiddleware, federationRoutes);
app.use('/api/advisor', authMiddleware, advisorRoutes);
```

---

## ✅ What this gives you

- `/api/drivers` → list/create drivers (used by DriversAdmin page).  
- `/api/payments/history/:companyId` → ledger page.  
- `/api/contracts` → contracts page.  
- `/api/nation/kpis` → nation KPIs.  
- `/api/federation` → federation overview.  
- `/api/advisor` → governance advisor insights.  

All stub pages can now fetch real JSON instead of mocks.

---

Would you like me to also **show the React hooks** (`useEffect` + `fetch`) for each stub page so they automatically pull from these endpoints instead of using the mock arrays? That way, you can flip the switch from demo to live in one go.

Excellent — let’s clean this up with a **shared `useApi` hook** so all your pages fetch data the same way, with built‑in loading and error handling. This will keep your codebase DRY and consistent.

---

## 🔧 Shared Hook: `useApi`

```tsx
// src/hooks/useApi.ts
import { useEffect, useState } from 'react';

export function useApi<T = any>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url, options)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unknown error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}
```

---

## 🧾 Example: Ledger Page with `useApi`

```tsx
// src/pages/LedgerPage.tsx
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
```

---

## 📜 Contracts Page with `useApi`

```tsx
// src/pages/ContractsPage.tsx
import React from 'react';
import Card from '../components/azora/atoms/Card';
import Heading from '../components/azora/atoms/Heading';
import { useApi } from '../hooks/useApi';

type Contract = { id: string; name: string; version: string; status: string; lastUpdated: string };

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
              </tr>
            </thead>
            <tbody>
              {data.contracts.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.version}</td>
                  <td className="p-2">{c.status}</td>
                  <td className="p-2">{new Date(c.lastUpdated).toLocaleDateString('en-ZA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
```

---

## 🌍 Nation Page with `useApi`

```tsx
// src/pages/NationPage.tsx
import React from 'react';
import Card from '../components/azora/atoms/Card';
import Heading from '../components/azora/atoms/Heading';
import { useApi } from '../hooks/useApi';

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
```

---

## 🏛 Federation Page with `useApi`

```tsx
// src/pages/FederationPage.tsx
import React from 'react';
import Heading from '../components/azora/atoms/Heading';
import { useApi } from '../hooks/useApi';

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
```

---

## 🧠 Advisor Page with `useApi`

```tsx
// src/pages/AdvisorPage.tsx
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
```

---

## ✅ Benefits

- **Consistent pattern**: every page uses `useApi`.
- **Built-in states**: `loading`, `error`, `data`.
- **Easy to extend**: add auth headers, retries, caching
