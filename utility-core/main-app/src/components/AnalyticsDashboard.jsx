import React, { useEffect, useState } from "react";
import { getFunnel, getHeatmap } from "../hooks/useAnalytics";

export default function AnalyticsDashboard() {
  const [funnel, setFunnel] = useState({});
  const [heatmap, setHeatmap] = useState({});
  useEffect(()=>{ getFunnel().then(setFunnel); getHeatmap().then(setHeatmap); }, []);
  return (
    <div className="card fade-in">
      <h2>Analytics Dashboard</h2>
      <h3>Funnel</h3>
      <ul>{Object.entries(funnel).map(([k,v])=><li key={k}>{k}: {v}</li>)}</ul>
      <h3>Heatmap (clicks)</h3>
      <ul>{Object.entries(heatmap).map(([k,v])=><li key={k}>{k}: {v}</li>)}</ul>
    </div>
  );
}
