import React, { useState } from "react";

export default function FounderUpgradePanel() {
  const [email, setEmail] = useState("");
  const [coins, setCoins] = useState(0);
  const [privilege, setPrivilege] = useState("");
  const [msg, setMsg] = useState("");

  async function upgrade() {
    const res = await fetch("/api/upgrade", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, coins, privilege })
    });
    const data = await res.json();
    setMsg(`Upgraded! Balance: ${data.balance}, Privilege: ${data.privilege}`);
  }

  return (
    <div className="card fade-in">
      <h2>Founder Upgrade Panel</h2>
      <input className="input" placeholder="Email (@azora.world)" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input" type="number" placeholder="Coins to Add" value={coins} onChange={e=>setCoins(Number(e.target.value))} />
      <input className="input" placeholder="Privilege (main/regular/admin)" value={privilege} onChange={e=>setPrivilege(e.target.value)} />
      <button className="btn-primary" onClick={upgrade}>Upgrade Founder</button>
      <div style={{marginTop:8}}>{msg}</div>
    </div>
  );
}