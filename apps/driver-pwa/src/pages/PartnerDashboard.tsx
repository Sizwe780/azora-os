// src/pages/PartnerDashboard.tsx
import React from 'react';
import { useApi } from '../../hooks/azora/useApi';
import Card from '../components/atoms/Card';
import Heading from '../components/atoms/Heading';
import toast from 'react-hot-toast';

type Summary = {
  code: string | null;
  commissionRateBps: number;
  pendingCents: number;
  paidCents: number;
};

type Referral = { id: string; companyName: string; createdAt: string };
type Payout = { id: string; amountCents: number; status: string; period: string; createdAt: string };

export default function PartnerDashboard() {
  const { data: summary, loading: loadingSummary } = useApi<Summary>('/api/partners/summary');
  const { data: referrals, loading: loadingReferrals } = useApi<{ referrals: Referral[] }>('/api/partners/referrals');
  const { data: payouts, loading: loadingPayouts } = useApi<{ payouts: Payout[] }>('/api/partners/payouts');

  async function refreshCode() {
    try {
      const res = await fetch('/api/partners/code', { method: 'POST' });
      const json = await res.json();
      toast.success(`New code: ${json.code}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Partner Dashboard</Heading>

      <Card>
        {loadingSummary ? (
          <div>Loading summary…</div>
        ) : summary ? (
          <div className="space-y-2">
            <div>Referral code: <span className="font-mono">{summary.code ?? 'None'}</span></div>
            <div>Commission rate: {summary.commissionRateBps / 100}%</div>
            <div>Pending: R{(summary.pendingCents / 100).toFixed(2)}</div>
            <div>Paid: R{(summary.paidCents / 100).toFixed(2)}</div>
            <button onClick={refreshCode} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">
              Refresh Code
            </button>
          </div>
        ) : (
          <div>No summary available</div>
        )}
      </Card>

      <Card>
        <Heading level={2}>Referrals</Heading>
        {loadingReferrals ? (
          <div>Loading…</div>
        ) : (
          <ul className="space-y-1">
            {referrals?.referrals.map(r => (
              <li key={r.id} className="border-b border-white/10 py-1">
                {r.companyName} — {new Date(r.createdAt).toLocaleDateString('en-ZA')}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <Heading level={2}>Payouts</Heading>
        {loadingPayouts ? (
          <div>Loading…</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Period</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts?.payouts.map(p => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="p-2">{p.period}</td>
                  <td className="p-2">R{(p.amountCents / 100).toFixed(2)}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">{new Date(p.createdAt).toLocaleDateString('en-ZA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
