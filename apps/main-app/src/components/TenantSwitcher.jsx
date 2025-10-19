import React, { useState } from "react";
import { useTenants, createTenant } from "../hooks/useTenants";
export default function TenantSwitcher({ onSwitch }) {
  const tenants = useTenants();
  const [newName, setNewName] = useState("");
  function add() {
    createTenant(newName).then(()=>window.location.reload());
  }
  return (
    <div className="card fade-in">
      <h3>Tenant Switcher</h3>
      <select className="input" onChange={e=>onSwitch(e.target.value)}>
        {tenants.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <input className="input" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New tenant name"/>
      <button className="btn-secondary" onClick={add}>Create Tenant</button>
    </div>
  );
}
