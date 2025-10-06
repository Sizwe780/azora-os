// src/pages/Settings.tsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Company = {
  id: string;
  name: string;
  vatNumber?: string;
  vatPercent: number;
  billingEmail?: string;
  popiaConsent: boolean;
};

export default function Settings({ companyId }: { companyId: string }) {
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetch(`/api/company/${companyId}`)
      .then(res => res.json())
      .then(setCompany);
  }, [companyId]);

  async function save() {
    try {
      await fetch('/api/company/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (!company) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-3 max-w-md">
      <h1 className="text-xl font-bold mb-4">Company Settings</h1>
      <label className="block">
        <span className="text-sm">Company name</span>
        <input
          className="mt-1 border px-2 py-1 w-full rounded"
          value={company.name}
          onChange={e => setCompany({ ...company, name: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-sm">VAT number</span>
        <input
          className="mt-1 border px-2 py-1 w-full rounded"
          value={company.vatNumber || ''}
          onChange={e => setCompany({ ...company, vatNumber: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-sm">VAT percent</span>
        <input
          type="number"
          className="mt-1 border px-2 py-1 w-full rounded"
          value={company.vatPercent}
          onChange={e => setCompany({ ...company, vatPercent: +e.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-sm">Billing email</span>
        <input
          className="mt-1 border px-2 py-1 w-full rounded"
          value={company.billingEmail || ''}
          onChange={e => setCompany({ ...company, billingEmail: e.target.value })}
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={company.popiaConsent}
          onChange={e => setCompany({ ...company, popiaConsent: e.target.checked })}
        />
        <span className="text-sm">POPIA consent</span>
      </label>
      <button onClick={save} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        Save
      </button>
    </div>
  );
}
