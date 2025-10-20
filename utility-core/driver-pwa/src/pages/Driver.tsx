import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io();

type Job = {
  id: string;
  ref: string;
  pickup: { address: string };
  dropoff: { address: string };
  status: 'new' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
};

export default function DriverPage({ driverId }: { driverId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/driver/jobs?driverId=${driverId}`);
    const data = await res.json();
    setJobs(data.jobs || []);
  }

  async function updateStatus(jobId: string, status: Job['status']) {
    await fetch('/api/jobs/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, status })
    });
    await load();
  }

  // Push GPS location every 20s
  useEffect(() => {
    load();
    const id = setInterval(load, 30000);

    const geoId = setInterval(() => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setGeoError(null);
          socket.emit('driver:location', {
            driverId,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            status: 'in_transit'
          });
        },
        (err) => setGeoError(err.message),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }, 20000);

    return () => {
      clearInterval(id);
      clearInterval(geoId);
    };
  }, [driverId]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">My jobs</h1>
      {geoError && <div className="mb-2 text-yellow-700">Location issue: {geoError}</div>}
      <ul className="space-y-3">
        {jobs.map((j) => (
          <li key={j.id} className="border p-3 rounded bg-white">
            <div className="font-semibold">{j.ref}</div>
            <div className="text-sm">Pickup: {j.pickup.address}</div>
            <div className="text-sm">Dropoff: {j.dropoff.address}</div>
            <div className="mt-2">Status: {j.status}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => updateStatus(j.id, 'in_transit')} className="px-3 py-1 bg-blue-600 text-white rounded">Start</button>
              <button onClick={() => updateStatus(j.id, 'delivered')} className="px-3 py-1 bg-green-600 text-white rounded">Delivered</button>
              <button onClick={() => updateStatus(j.id, 'failed')} className="px-3 py-1 bg-red-600 text-white rounded">Failed</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}