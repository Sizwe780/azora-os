import React, { useEffect, useState } from "react";
import { getDevices, sendCommand } from "../hooks/useIoT";

export default function DeviceDashboard() {
  const [devices, setDevices] = useState({});
  useEffect(()=>{ getDevices().then(setDevices); }, []);
  function handleCommand(deviceId) {
    sendCommand(deviceId, "reboot").then(()=>alert("Command sent!"));
  }
  return (
    <div className="card fade-in">
      <h3>Device Dashboard</h3>
      <ul>
        {Object.entries(devices).map(([id,meta])=>
          <li key={id}>
            <b>{id}</b>: {meta.status} 
            <button onClick={()=>handleCommand(id)} className="btn-secondary">Reboot</button>
          </li>
        )}
      </ul>
    </div>
  );
}
