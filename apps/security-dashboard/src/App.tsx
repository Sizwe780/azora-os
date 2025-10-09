import React, { useEffect, useState } from "react";
import "./styles.css";
type Alert = { alertId:string; type:string; severity:string; tillId:string; cameraId:string; ts:string; status:string; details:{bagged:number; scanned:number; delta:number; confidence:number} };
export default function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]); const [filter, setFilter] = useState<"all"|"warning"|"critical">("all");
  async function load() { const res = await fetch(`http://localhost:${import.meta.env.VITE_CORE_PORT || 4022}/alerts`); setAlerts(await res.json()); }
  useEffect(() => { load(); const t=setInterval(load,3000); return ()=>clearInterval(t); }, []);
  async function resolve(id:string){ await fetch(`http://localhost:${import.meta.env.VITE_CORE_PORT || 4022}/alerts/${id}/resolve`, { method:"POST" }); load(); }
  const list = alerts.filter(a => filter==="all" ? true : a.severity===filter).slice().reverse();
  return (<div className="container">
    <header className="header"><h1>Azora Security — Woolworths</h1><p>Live shrink alerts with audit trails</p></header>
    <div className="controls"><button className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>All</button><button className={filter==="warning"?"active":""} onClick={()=>setFilter("warning")}>Warning</button><button className={filter==="critical"?"active":""} onClick={()=>setFilter("critical")}>Critical</button></div>
    <ul className="list">{list.map(a => (<li key={a.alertId} className={`item ${a.severity}`}>
      <div className="row"><div className="title">{a.type} — {a.tillId}</div><div className="meta">{new Date(a.ts).toLocaleTimeString()} • Cam {a.cameraId}</div></div>
      <div className="details">Bagged {a.details.bagged}, Scanned {a.details.scanned}, Δ {a.details.delta} • {(a.details.confidence*100).toFixed(0)}%</div>
      <div className="actions"><span className={`status ${a.status.toLowerCase()}`}>{a.status}</span>{a.status==="OPEN" && <button onClick={()=>resolve(a.alertId)}>Resolve</button>}</div>
    </li>))}</ul>
  </div>);
}
