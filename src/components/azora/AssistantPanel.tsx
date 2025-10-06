// src/components/AssistantPanel.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAzoraAI } from '../../hooks/azora/useAzoraAI';

export function AssistantPanel() {
  const { planDay, startTrip, generateLogs } = useAzoraAI();
  const [form, setForm] = useState({ companyId: '', driverId: '', currentCycleUsedHrs: 12, current: {}, pickup: {}, drop: {} });

  async function handlePlan() {
    try {
      const trip = await planDay(form);
      toast.success(`Trip planned. ETA ~${trip?.routeSummary?.durationMin} min`);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to plan');
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input className="input" placeholder="Company ID" onChange={e => setForm({ ...form, companyId: e.target.value })} />
        <input className="input" placeholder="Driver ID" onChange={e => setForm({ ...form, driverId: e.target.value })} />
        <input className="input" type="number" placeholder="Cycle Hours Used" value={form.currentCycleUsedHrs}
               onChange={e => setForm({ ...form, currentCycleUsedHrs: Number(e.target.value) })} />
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={handlePlan}>Plan day</button>
        <button className="btn" onClick={async () => { const id = prompt('Trip ID to start') || ''; if (id) { await startTrip(id); toast.success('Trip started'); } }}>Start trip</button>
        <button className="btn" onClick={async () => { const id = prompt('Trip ID for logs') || ''; if (id) { const log = await generateLogs(id); toast.success(`Log ready for ${log?.date}`); } }}>Generate logs</button>
      </div>
    </div>
  );
}
