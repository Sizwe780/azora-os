import React, { useEffect, useState } from 'react';

type Driver = {
  id: string;
  email: string;
  uid?: string | null;
  createdAt?: string;
};

export default function DriversAdmin() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch('/api/drivers');
    const data = await res.json();
    setDrivers(data.drivers || []);
  }

  async function create() {
    if (!email) return;
    setLoading(true);
    await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    setEmail('');
    setLoading(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm('Remove this driver?')) return;
    await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Drivers</h1>

      <div className="flex flex-col md:flex-row gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Driver email"
          className="border px-2 py-1 rounded flex-1"
        />
        <button
          onClick={create}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add driver'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left mt-4">
          <thead>
            <tr>
              <th className="p-2">Email</th>
              <th className="p-2">UID</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-t border-white/10">
                <td className="p-2">{d.email}</td>
                <td className="p-2 text-xs text-gray-500">{d.uid ?? '—'}</td>
                <td className="p-2">{d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-ZA') : '—'}</td>
                <td className="p-2">
                  <button
                    onClick={() => remove(d.id)}
                    className="text-red-600 underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No drivers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
