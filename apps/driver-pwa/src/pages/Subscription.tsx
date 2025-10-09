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