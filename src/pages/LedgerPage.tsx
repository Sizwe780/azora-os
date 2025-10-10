import React from 'react';
import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useApi } from '../hooks/azora/useApi';
import axios from 'axios';

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
  const [aiResult, setAiResult] = useState<{ uid: string; insight: string } | null>(null);
  const [printing, setPrinting] = useState<string | null>(null);

  const query = `/api/ledger?${typeFilter ? `type=${typeFilter}&` : ''}${from ? `from=${from}&` : ''}${to ? `to=${to}&` : ''}${companyId ? `companyId=${companyId}&` : ''}${driverId ? `driverId=${driverId}` : ''}`;
  const { data, loading, error } = useApi<{ entries: LedgerEntry[] }>(query);

  // AI analysis handler
  async function handleAnalyze(uid: string) {
    setAiResult(null);
    // Simulate AI call (replace with real endpoint)
    try {
        const res = await axios.post('/api/ai/analyze-ledger', { uid });
        setAiResult({ uid, insight: res.data.insight });
    } catch (e) {
        console.error("AI analysis failed", e);
        setAiResult({ uid, insight: "AI analysis failed. Please try again later." });
    }
  }

  // Print document handler
  function handlePrint(uid: string) {
    setPrinting(uid);
    window.open(`/api/ledger/${uid}/print`, '_blank');
    setTimeout(() => setPrinting(null), 2000);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Ledger</h1>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
            {/* Filter inputs */}
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-400">Error: {error}</div>}
        {data && (
          <table className="w-full text-left text-white">
            <thead>
              <tr className="border-b border-white/20">
                <th className="p-2">Date</th>
                <th className="p-2">UID</th>
                <th className="p-2">Type</th>
                <th className="p-2">Entity</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e) => (
                <tr key={e.uid} className="border-t border-white/10">
                  <td className="p-2">{new Date(e.createdAt).toLocaleString('en-ZA')}</td>
                  <td className="p-2 text-xs font-mono">{e.uid}</td>
                  <td className="p-2">{e.type}</td>
                  <td className="p-2 text-xs font-mono">{e.entityId}</td>
                  <td className="p-2 space-x-2">
                    <button
                      className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-500"
                      onClick={() => handleAnalyze(e.uid)}
                      disabled={!!(aiResult && aiResult.uid === e.uid)}
                    >
                      {aiResult && aiResult.uid === e.uid ? 'Analyzed' : 'AI Analyze'}
                    </button>
                    <button
                      className="px-2 py-1 bg-yellow-400 text-black rounded text-xs hover:bg-yellow-500"
                      onClick={() => handlePrint(e.uid)}
                      disabled={printing === e.uid}
                    >
                      {printing === e.uid ? 'Printing...' : 'Print PDF'}
                    </button>
                  </td>
                </tr>
              ))}
              {data.entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-white/70">
                    No ledger entries found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {aiResult && (
          <div className="mt-4 p-4 bg-indigo-500/20 text-white rounded">
            <strong>AI Insight for UID {aiResult.uid.substring(0, 12)}...:</strong> {aiResult.insight}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
