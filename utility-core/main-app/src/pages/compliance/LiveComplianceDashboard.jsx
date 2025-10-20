import React, { useState, useEffect } from 'react';

const COMPLIANCE_WS_URL = 'ws://localhost:4090';

const LiveComplianceDashboard = () => {
  const [events, setEvents] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    const ws = new WebSocket(COMPLIANCE_WS_URL);

    ws.onopen = () => {
      setConnectionStatus('Live');
    };

    ws.onmessage = (event) => {
      const newEvent = JSON.parse(event.data);
      setEvents(prevEvents => [newEvent, ...prevEvents.slice(0, 49)]); // Keep last 50 events
    };

    ws.onclose = () => {
      setConnectionStatus('Disconnected');
    };

    ws.onerror = () => {
      setConnectionStatus('Error');
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []); // Empty dependency array ensures this runs only once

  const getStatusColor = () => {
    if (connectionStatus === 'Live') return 'text-green-400';
    if (connectionStatus === 'Connecting...') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen font-mono">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Live Compliance Event Stream</h1>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor().replace('text-', 'bg-')}`}></div>
          <span className={getStatusColor()}>{connectionStatus}</span>
        </div>
      </div>
      <div className="bg-black rounded-lg p-4 h-[75vh] overflow-y-auto">
        {events.length === 0 && (
          <p className="text-gray-500">Awaiting incoming compliance events...</p>
        )}
        {events.map((event) => (
          <div key={event.eventId} className="border-b border-gray-700 py-2 text-sm">
            <p><span className="text-gray-400">Timestamp:</span> {new Date(event.timestamp).toLocaleTimeString()}</p>
            <p><span className="text-gray-400">Action:</span> <span className="text-cyan-400">{event.action}</span></p>
            <p><span className="text-gray-400">Subject ID:</span> {event.subjectId}</p>
            <p><span className="text-gray-400">Details:</span> {JSON.stringify(event.details)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveComplianceDashboard;