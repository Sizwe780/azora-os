// src/components/ELDLogsheet.tsx
import React from 'react';

export function ELDLogsheet({ sheet, uid }: { sheet: any; uid?: string }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between">
        <div className="font-semibold">ELD Log · {sheet.date} · {sheet.driver}</div>
        <div className="flex items-center gap-2">
          <img src="/assets/azora-logo.png" alt="Azora" className="h-6 w-auto opacity-90" />
          {uid && <span className="text-xs text-gray-600">UID: {uid}</span>}
        </div>
      </div>

      <div className="mt-2">
        {sheet.entries.map((e: any, idx: number) => (
          <div key={idx} className="text-sm">
            <strong>{e.status}</strong>: {e.from} → {e.to} — {e.note}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
        {uid && (
          <a className="btn" href={`/verify?uid=${encodeURIComponent(uid)}`} target="_blank" rel="noreferrer">
            Verify UID
          </a>
        )}
      </div>
    </div>
  );
}
