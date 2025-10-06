// src/pages/Jobs.tsx
import React, { useEffect, useState } from 'react';

type Job = {
  id: string;
  ref: string;
  pickup: { address: string };
  dropoff: { address: string };
  status: 'new' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
  driverId?: string;
};

const statuses: Job['status'][] = ['new', 'assigned', 'in_transit', 'delivered', 'failed'];

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string>('');

  async function loadJobs() {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(data.jobs || []);
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function assignDriver(jobId: string) {
    setAssigning(jobId);
    await fetch('/api/jobs/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, driverId })
    });
    setAssigning(null);
    setDriverId('');
    loadJobs();
  }

  async function updateStatus(jobId: string, status: Job['status']) {
    await fetch('/api/jobs/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, status })
    });
    loadJobs();
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Jobs Board</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Ref</th>
            <th className="p-2">Pickup</th>
            <th className="p-2">Dropoff</th>
            <th className="p-2">Status</th>
            <th className="p-2">Driver</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-t">
              <td className="p-2">{job.ref}</td>
              <td className="p-2">{job.pickup.address}</td>
              <td className="p-2">{job.dropoff.address}</td>
              <td className="p-2">{job.status}</td>
              <td className="p-2">{job.driverId || '-'}</td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Driver ID"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => assignDriver(job.id)}
                    disabled={assigning === job.id || !driverId}
                    className="px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                  >
                    {assigning === job.id ? 'Assigning...' : 'Assign'}
                  </button>
                  <select
                    value={job.status}
                    onChange={(e) => updateStatus(job.id, e.target.value as Job['status'])}
                    className="border px-2 py-1 rounded"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
