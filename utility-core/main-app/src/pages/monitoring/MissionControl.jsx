/**
 * @file MissionControl.jsx
 * @author Sizwe Ngwenya
 * @description A real-time dashboard visualizing the health and status of all Azora OS microservices.
 */
import React, { useState, useEffect } from 'react';

const MONITORING_WS_URL = 'ws://localhost:4100';

const StatusIndicator = ({ status }) => {
  const config = {
    online: { color: 'bg-green-500', text: 'Online' },
    offline: { color: 'bg-red-500', text: 'Offline' },
    degraded: { color: 'bg-yellow-500', text: 'Degraded' },
  };
  const current = config[status] || { color: 'bg-gray-500', text: 'Unknown' };
  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-2 ${current.color}`}></div>
      <span>{current.text}</span>
    </div>
  );
};

const MissionControl = () => {
  const [services, setServices] = useState({});

  useEffect(() => {
    const ws = new WebSocket(MONITORING_WS_URL);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'INITIAL_STATUS' || message.type === 'STATUS_UPDATE') {
        setServices(message.payload);
      }
    };
    return () => ws.close();
  }, []);

  const serviceList = Object.entries(services);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Azora OS - Mission Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {serviceList.length === 0 && <p>Awaiting status from monitoring service...</p>}
        {serviceList.map(([name, data]) => (
          <div key={name} className="bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <h2 className="font-bold text-lg truncate">{name}</h2>
            <div className="mt-2">
              <StatusIndicator status={data.status} />
            </div>
            <p className="text-xs text-gray-400 mt-2">Last Check: {new Date(data.lastCheck).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionControl;