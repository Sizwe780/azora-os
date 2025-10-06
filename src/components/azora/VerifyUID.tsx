// src/pages/VerifyUID.tsx
import { useEffect, useState } from 'react';

export default function VerifyUID() {
  const [uid, setUid] = useState(new URLSearchParams(location.search).get('uid') ?? '');
  const [result, setResult] = useState<any>(null);

  async function handleVerify() {
    const r = await fetch(`/api/ledger/verify/${uid}`);
    const json = await r.json();
    setResult(json);
  }

  useEffect(() => { if (uid) handleVerify(); }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Verify Azora Document</h1>
      <div className="flex gap-2">
        <input className="input" value={uid} onChange={e => setUid(e.target.value)} placeholder="Enter UID (e.g., AZORA-LOG-20251006-ABC123)" />
        <button className="btn btn-primary" onClick={handleVerify}>Verify</button>
      </div>
      {result && (
        <div className="mt-4">
          {result.valid ? (
            <div className="rounded bg-green-50 p-3 text-green-700">
              ✅ Valid · Type: {result.entry.type} · Company: {result.entry.companyId} · Driver: {result.entry.driverId}
              <div className="text-xs text-gray-600">Hash: {result.entry.hash}</div>
            </div>
          ) : (
            <div className="rounded bg-red-50 p-3 text-red-700">❌ Invalid UID</div>
          )}
        </div>
      )}
    </div>
  );
}
