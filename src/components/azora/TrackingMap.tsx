// src/components/azora/TrackingMap.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io, Socket } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons (important for Webpack/Vite builds)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Define event payloads
type DriverPoint = {
  driverId: string;
  lat: number;
  lon: number;
  status?: string;
  updatedAt?: number;
};

// Strongly type your socket events
interface ServerToClientEvents {
  'dispatch:update': (data: DriverPoint) => void;
}
interface ClientToServerEvents {
  'driver:location': (data: DriverPoint) => void;
}

// Connect to backend (use env var for flexibility)
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.REACT_APP_SOCKET_URL || window.location.origin
);

export default function TrackingMap() {
  const [drivers, setDrivers] = useState<DriverPoint[]>([]);

  useEffect(() => {
    const handler = (data: DriverPoint) => {
      setDrivers((prev) => [
        ...prev.filter((d) => d.driverId !== data.driverId),
        { ...data, updatedAt: Date.now() },
      ]);
    };

    socket.on('dispatch:update', handler);
    return () => {
      socket.off('dispatch:update', handler);
    };
  }, []);

  return (
    <div className="h-96 w-full">
      <MapContainer
        center={[-29.85, 31.02]} // Durban as default center
        zoom={6}
        className="h-full w-full rounded"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {drivers.map((d) => (
          <Marker key={d.driverId} position={[d.lat, d.lon]}>
            <Popup>
              <div className="text-sm">
                <div>
                  <strong>Driver:</strong> {d.driverId}
                </div>
                <div>
                  <strong>Status:</strong> {d.status || 'unknown'}
                </div>
                <div>
                  <strong>Updated:</strong>{' '}
                  {d.updatedAt
                    ? new Date(d.updatedAt).toLocaleTimeString('en-ZA')
                    : '-'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
