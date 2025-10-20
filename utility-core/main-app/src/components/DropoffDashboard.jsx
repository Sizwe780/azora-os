import React, { useEffect, useState } from "react";
import { getDropoffs } from "../hooks/useUserJourney";
export default function DropoffDashboard() {
  const [dropoffs, setDropoffs] = useState({});
  useEffect(()=>{ getDropoffs().then(setDropoffs); }, []);
  return (
    <div className="card fade-in">
      <h3>Drop-off Analysis</h3>
      <ul>{Object.entries(dropoffs).map(([p,c]) => <li key={p}>{p}: {c}</li>)}</ul>
    </div>
  );
}
