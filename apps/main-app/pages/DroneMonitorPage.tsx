import React from 'react';
import { useState } from 'react';
import Card from '../components/azora/atoms/Card';
import Heading from '../components/azora/atoms/Heading';

// Demo drone data
const demoDrones = [
  { id: 'drone-001', status: 'active', location: 'JNB-OPS', battery: 87, lastCheck: '2025-10-09T14:22:00Z', driver: 'Sizwe', trip: 'Trip-001' },
  { id: 'drone-002', status: 'charging', location: 'CPT-CARGO', battery: 45, lastCheck: '2025-10-09T13:55:00Z', driver: 'Thandi', trip: 'Trip-002' },
  { id: 'drone-003', status: 'offline', location: 'JNB-OPS', battery: 0, lastCheck: '2025-10-09T12:10:00Z', driver: 'Mpho', trip: 'Trip-003' },
];

// Simple AI module for insights and logsheets
type Drone = {
  id: string;
  status: string;
  location: string;
  battery: number;
  lastCheck: string;
  driver: string;
  trip: string;
};

function getDroneInsight(drone: Drone) {
  if (drone.battery < 20) return `⚠️ Low battery! Recommend charging soon.`;
  if (drone.status === 'offline') return `❌ Drone offline. Check hardware or network.`;
  if (drone.status === 'charging') return `🔋 Charging. Ready for next trip soon.`;
  return `✅ All systems normal. Trip: ${drone.trip}`;
}

function generateLogsheet(drone: Drone) {
  return `Logsheet for ${drone.id}\nDriver: ${drone.driver}\nTrip: ${drone.trip}\nStatus: ${drone.status}\nBattery: ${drone.battery}%\nLocation: ${drone.location}\nLast Check: ${new Date(drone.lastCheck).toLocaleString('en-ZA')}`;
}

export default function DroneMonitorPage() {
  const [drones, setDrones] = useState(demoDrones);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  // Simulate status update
  function refreshStatus() {
    setDrones(drones => drones.map(d => ({
      ...d,
      battery: Math.max(0, d.battery - Math.floor(Math.random() * 5)),
      lastCheck: new Date().toISOString(),
      status: d.battery > 20 ? 'active' : (d.battery > 0 ? 'charging' : 'offline'),
    })));
  }

  function handleLogsheet(drone: Drone) {
    setSelectedLog(generateLogsheet(drone));
  }

  return (
    <div className="p-6 space-y-6">
      <Heading level={1}>Drone Monitoring (AI-Driven)</Heading>
      <Card>
        <button className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded" onClick={refreshStatus}>Refresh Status</button>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Drone ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Location</th>
              <th className="p-2">Battery (%)</th>
              <th className="p-2">Last Check</th>
              <th className="p-2">Driver</th>
              <th className="p-2">Trip</th>
              <th className="p-2">AI Insight</th>
              <th className="p-2">Logsheet</th>
            </tr>
          </thead>
          <tbody>
            {drones.map(d => (
              <tr key={d.id} className="border-t border-white/10">
                <td className="p-2">{d.id}</td>
                <td className="p-2">{d.status}</td>
                <td className="p-2">{d.location}</td>
                <td className="p-2">{d.battery}</td>
                <td className="p-2">{new Date(d.lastCheck).toLocaleString('en-ZA')}</td>
                <td className="p-2">{d.driver}</td>
                <td className="p-2">{d.trip}</td>
                <td className="p-2 text-xs text-indigo-700">{getDroneInsight(d)}</td>
                <td className="p-2">
                  <button className="px-2 py-1 bg-yellow-400 text-black rounded text-xs" onClick={() => handleLogsheet(d)}>
                    View Logsheet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedLog && (
          <div className="mt-6 p-4 bg-indigo-50 text-indigo-900 rounded">
            <pre>{selectedLog}</pre>
            <button className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => setSelectedLog(null)}>Close</button>
          </div>
        )}
      </Card>
    </div>
  );
}
