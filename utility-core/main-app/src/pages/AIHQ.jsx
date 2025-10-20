import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AIHQ from './pages/AIHQ';

const AI_URL = import.meta?.env?.VITE_AZORA_AI_SERVICE_URL || process.env.AZORA_AI_SERVICE_URL || 'http://localhost:4096';

export default function App() {
  return (
    <Routes>
      <Route path="/ai" element={<AIHQ />} />
    </Routes>
  );
}

function AIHQ() {
  const [plan, setPlan] = useState(null);
  const [objective, setObjective] = useState('');

  const load = async () => {
    const r = await fetch(`${AI_URL}/api/ai/plan`); setPlan(await r.json());
  };
  useEffect(() => { load(); }, []);

  const replan = async () => {
    await fetch(`${AI_URL}/api/ai/plan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ objective }) });
    setObjective(''); await load();
  };

  const complete = async (id) => {
    await fetch(`${AI_URL}/api/ai/actions/${id}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ result: 'done via UI' }) });
    await load();
  };

  async function localizedCTA() {
    const r = await fetch(`${AI_URL}/api/ai/skills/localize/cta`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en-ZA', currency: 'ZAR' })
    });
    const data = await r.json();
    alert(data?.result?.title + ' — ' + data?.result?.priceExample);
  }

  if (!plan) return <div>Loading AI plan…</div>;

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
      <h1>AZORA AI HQ</h1>
      <p className="transparencyNote">AZORA AI proposes actions with full transparency and you control execution. You can opt out of any suggestion.</p>
      <p className="forUserBenefit">For your benefit: prioritized steps to grow revenue, utility, and reliability.</p>

      <h3>Objective</h3>
      <p>{plan.objective}</p>
      <input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Refine objective…" style={{ width: '100%', padding: 8 }}/>
      <button onClick={replan} style={{ marginTop: 8 }}>Replan</button>

      <h3 style={{ marginTop: 24 }}>KPIs</h3>
      <ul>{plan.kpis.map(k => <li key={k.key}>{k.key}: goal {k.goal} {k.unit}</li>)}</ul>

      <h3>Actions</h3>
      <ul>
        {plan.actions.map(a => (
          <li key={a.id} style={{ marginBottom: 8 }}>
            <strong>[{a.theme}]</strong> {a.title} {a.done ? '✅' : ''}
            <div style={{ fontSize: 12, opacity: 0.8 }} className="transparencyNote">Note: {a.transparencyNote}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }} className="forUserBenefit">Benefit: {a.forUserBenefit}</div>
            {!a.done && <button onClick={() => complete(a.id)} style={{ marginTop: 4 }}>Mark done</button>}
          </li>
        ))}
      </ul>

      <h3>Risks</h3>
      <ul>{plan.risks.map((r, i) => <li key={i}>{r.risk} — Mitigation: {r.mitigation}</li>)}</ul>

      <button onClick={localizedCTA} style={{ marginLeft: 8 }}>Localized CTA</button>
    </div>
  );
}