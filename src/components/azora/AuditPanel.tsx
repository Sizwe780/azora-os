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
