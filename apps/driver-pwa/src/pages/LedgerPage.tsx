import React, { useState } from 'react';
import Card from '../components/atoms/Card';
import Heading from '../components/atoms/Heading';
import { useApi } from '../../hooks/azora/useApi';

type LedgerEntry = {
  uid: string;
  type: string;
  entityId: string;
  companyId?: string;
  driverId?: string;
  createdAt: string;
  hash: string;
};

export default function LedgerPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [driverId, setDriverId] = useState('');

  const query = `/api/ledger?${typeFilter ? `type=${typeFilter}&` : ''}${from ? `from=${from}&` : ''}${to ? `to=${to}&` : ''}${companyId ? `companyId=${companyId}&` : ''}${driverId ? `driverId=${driverId}` : ''}`;
  const { data, loading, error } = useApi<{ entries: LedgerEntry[] }>(query);

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Ledger</Heading>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm">Type</label>
          <select className="input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="DRIVER">Drivers</option>
            <option value="CONTRACT">Contracts</option>
            <option value="PAYMENT">Payments</option>
            <option value="PAYOUT">Payouts</option>
            <option value="ELD_LOG">ELD Logs</option>
            <option value="INVOICE">Invoices</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">From</label>
          <input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">To</label>
          <input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Company ID</label>
          <input type="text" className="input" value={companyId} onChange={e => setCompanyId(e.target.value)} placeholder="Company ID" />
        </div>
        <div>
          <label className="block text-sm">Driver ID</label>
          <input type="text" className="input" value={driverId} onChange={e => setDriverId(e.target.value)} placeholder="Driver ID" />
        </div>
      </div>

      <Card>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">Error: {error}</div>}
        {data && (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">UID</th>
                <th className="p-2">Type</th>
                <th className="p-2">Entity</th>
                <th className="p-2">Company</th>
                <th className="p-2">Driver</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e) => (
                <tr key={e.uid} className="border-t border-white/10">
                  <td className="p-2">{new Date(e.createdAt).toLocaleString('en-ZA')}</td>
                  <td className="p-2 text-xs">{e.uid}</td>
                  <td className="p-2">{e.type}</td>
                  <td className="p-2">{e.entityId}</td>
                  <td className="p-2">{e.companyId ?? '—'}</td>
                  <td className="p-2">{e.driverId ?? '—'}</td>
                  <td className="p-2">
                    <a
                      href={`/verify?uid=${encodeURIComponent(e.uid)}`}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Verify
                    </a>
                  </td>
                </tr>
              ))}
              {data.entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No ledger entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
