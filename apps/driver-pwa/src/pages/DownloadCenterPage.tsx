// src/pages/DownloadCenterPage.tsx
import React, { useState } from 'react';
import { useApi } from '../../hooks/azora/useApi';
import Card from '../components/atoms/Card';
import Heading from '../components/atoms/Heading';

type ExportEntry = {
  uid: string;
  type: string;
  entityId: string;
  companyId?: string;
  driverId?: string;
  createdAt: string;
  hash: string;
};

export default function DownloadCenterPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [useUnified, setUseUnified] = useState(true); // toggle unified vs direct

  const query = `/api/exports?${typeFilter ? `type=${typeFilter}&` : ''}${from ? `from=${from}&` : ''}${to ? `to=${to}` : ''}`;
  const { data, loading, error } = useApi<{ exports: ExportEntry[] }>(query);

  function buildDownloadUrl(e: ExportEntry) {
    if (useUnified) {
      return `/api/${e.type.toLowerCase()}/${e.entityId}/pdf`;
    }
    // fallback direct routes
    switch (e.type) {
      case 'CONTRACT': return `/api/contracts/${e.entityId}/pdf`;
      case 'PAYMENT':
      case 'INVOICE': return `/api/payments/${e.entityId}/pdf`;
      case 'PAYOUT': return `/api/payouts/${e.entityId}/pdf`;
      case 'ELD_LOG': return `/api/logs/${e.entityId}/pdf`;
      default: return '#';
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Download Center</Heading>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm">Type</label>
          <select className="input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All</option>
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
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={useUnified} onChange={e => setUseUnified(e.target.checked)} />
          <label className="text-sm">Use unified route</label>
        </div>
      </div>

      <Card>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">Error: {error}</div>}
        {data && (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">UID</th>
                <th className="p-2">Type</th>
                <th className="p-2">Company</th>
                <th className="p-2">Driver</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.exports.map((e) => (
                <tr key={e.uid} className="border-t border-white/10">
                  <td className="p-2 text-xs">{e.uid}</td>
                  <td className="p-2">{e.type}</td>
                  <td className="p-2">{e.companyId ?? '—'}</td>
                  <td className="p-2">{e.driverId ?? '—'}</td>
                  <td className="p-2">{new Date(e.createdAt).toLocaleString('en-ZA')}</td>
                  <td className="p-2">
                    <a
                      href={buildDownloadUrl(e)}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF
                    </a>
                    <a
                      href={`/verify?uid=${encodeURIComponent(e.uid)}`}
                      className="ml-2 text-gray-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Verify
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
