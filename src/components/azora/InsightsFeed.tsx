// src/components/InsightsFeed.tsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function InsightsFeed({ tripId }: { tripId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    const socket = io();
    socket.emit('trip:join', tripId);
    socket.on('insight', (ev: any) => setEvents(prev => [ev, ...prev]));
    return () => { socket.disconnect(); };
  }, [tripId]);

  return (
    <div className="space-y-2">
      {events.map((ev, i) => (
        <div key={i} className="rounded p-2 bg-gray-100 dark:bg-gray-800">
          <div className="text-xs text-gray-500">{ev.type} · {ev.severity}</div>
          <div className="text-sm">{ev.message}</div>
        </div>
      ))}
    </div>
  );
}
