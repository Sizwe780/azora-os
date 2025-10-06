import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

type DriverPoint = { driverId: string; lat: number; lon: number; status?: string; updatedAt?: number };
const socket = io();

export default function TrackingMap() {
  const [drivers, setDrivers] = useState<DriverPoint[]>([]);
  useEffect(() => {
    socket.on('dispatch:update', (data: DriverPoint) => {
      setDrivers((prev) => [...prev.filter((d) => d.driverId !== data.driverId), { ...data, updatedAt: Date.now() }]);
    });
    return () => { socket.off('dispatch:update'); };
  }, []);
  return (
    <div className="h-96 w-full">
      <MapContainer center={[-29.85, 31.02]} zoom={6} className="h-full w-full rounded">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {drivers.map((d) => (
          <Marker key={d.driverId} position={[d.lat, d.lon]}>
            <Popup>
              <div className="text-sm">
                <div><strong>Driver:</strong> {d.driverId}</div>
                <div><strong>Status:</strong> {d.status || 'unknown'}</div>
                <div><strong>Updated:</strong> {d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString('en-ZA') : '-'}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}