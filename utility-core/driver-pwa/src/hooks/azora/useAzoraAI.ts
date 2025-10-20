// src/hooks/useAzoraAI.ts
import { useState } from 'react';

export function useAzoraAI() {
  const [session, setSession] = useState<any>(null);

  async function planDay(input: any) {
    const r = await fetch('/api/ai/plan-day', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    const trip = await r.json();
    setSession({ ...session, lastTrip: trip });
    return trip;
  }

  async function startTrip(id: string) {
    await fetch(`/api/trips/${id}/start`, { method: 'POST' });
  }

  async function generateLogs(id: string) {
    const r = await fetch(`/api/trips/${id}/logs/generate`, { method: 'POST' });
    return r.json();
  }

  return { session, planDay, startTrip, generateLogs };
}
