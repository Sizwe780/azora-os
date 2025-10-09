import React, { useState } from 'react';
import { useApi } from '../../hooks/azora/useApi';
import Card from '../components/atoms/Card';
import Heading from '../components/atoms/Heading';

type ScheduledExport = {
  id: string;
  type: string;
  period: string;
  url: string;
  expiresAt: string;
  createdAt: string;
};

export default function ScheduledExportsPage() {
  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const query = `/api/scheduled-exports?${filterType ? `type=${filterType}&` : ''}${filterFrom ? `from=${filterFrom}&` : ''}${filterTo ? `to=${filterTo}` : ''}`;
  const { data, loading, error } = useApi<{ exports: ScheduledExport[] }>(query);

  // Custom export form state
  const [customType, setCustomType] = useState('CUSTOM');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Bulk selection state
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  async function regenerate(period: string, type: string) {
    const res = await fetch('/api/scheduled-exports/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, type })
    });
    const result = await res.json();
    if (result.url) {
      alert(`New export ready: ${result.url}`);
    }
  }

  async function createCustomExport() {
    if (!from || !to) {
      alert('Please select a date range');
      return;
    }
    setSubmitting(true);
    const res = await fetch('/api/scheduled-exports/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: customType, from, to })
    });
    const result = await res.json();
    setSubmitting(false);
    if (result.url) {
      alert(`Custom export ready: ${result.url}`);
    }
  }

  async function bulkDownload() {
    if (selected.length === 0) {
      alert('Please select at least one export');
      return;
    }
    setBulkLoading(true);
    const res = await fetch('/api/scheduled-exports/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected })
    });
    const result = await res.json();
    setBulkLoading(false);
    if (result.url) {
      window.open(result.url, '_blank');
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Scheduled Exports</Heading>

      {/* Filters */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Filter Exports</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm">Type</label>
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All</option>
              <option value="MONTHLY">Monthly</option>
              <option value="WEEKLY">Weekly</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">From</label>
            <input
              type="date"
              className="input"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">To</label>
            <input
              type="date"
              className="input"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Custom Export Form */}
      <Card>
        <h2 className="text-lg font-semibold mb-2">Generate Custom Export</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm">Type</label>
            <select
              className="input"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
            >
              <option value="CUSTOM">Custom</option>
              <option value="MONTHLY">Monthly</option>
              <option value="WEEKLY">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">From</label>
            <input
              type="date"
              className="input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">To</label>
            <input
              type="date"
              className="input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button
            onClick={createCustomExport}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </Card>

      {/* Scheduled Exports Table */}
      <Card>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">Error: {error}</div>}
        {data && (
          <>
            <div className="mb-2">
              <button
                onClick={bulkDownload}
                disabled={bulkLoading || selected.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
              >
                {bulkLoading ? 'Preparing…' : `Download Selected (${selected.length})`}
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2">
                    <input
                      type="checkbox"
                      checked={data.exports.length > 0 && selected.length === data.exports.length}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? data.exports.map((exp) => exp.id) : []
                        )
                      }
                    />
                  </th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Period</th>
                  <th className="p-2">Created</th>
                  <th className="p-2">Expires</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.exports.map((exp) => (
                  <tr key={exp.id} className="border-t border-white/10">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(exp.id)}
                        onChange={() => toggleSelect(exp.id)}
                      />
                    </td>
                    <td className="p-2">{exp.type}</td>
                    <td className="p-2">{exp.period}</td>
                    <td className="p-2">{new Date(exp.createdAt).toLocaleString('en-ZA')}</td>
                    <td className="p-2">{new Date(exp.expiresAt).toLocaleString('en-ZA')}</td>
                    <td className="p-2">
                      <a
                        href={exp.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => regenerate(exp.period, exp.type)}
                        className="ml-2 text-sm text-gray-600 underline"
                      >
                        Regenerate
                      </button>
                    </td>
                  </tr>
                ))}
                {data.exports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      No scheduled exports yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </Card>
    </div>
  );
}
