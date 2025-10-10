import React from 'react';
import { useAlerts } from '../../context/AlertProvider';

export function AlertBanner() {
  const { alerts, dismiss } = useAlerts();
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {alerts.map(a => (
        <div
          key={a.id}
          className={`px-4 py-2 rounded shadow text-sm cursor-pointer ${
            a.type === 'error'
              ? 'bg-red-600 text-white'
              : a.type === 'warning'
              ? 'bg-yellow-500 text-black'
              : 'bg-indigo-600 text-white'
          }`}
          onClick={() => dismiss(a.id)}
        >
          {a.message}
        </div>
      ))}
    </div>
  );
}
