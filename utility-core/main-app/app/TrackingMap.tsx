import React from 'react';
// src/components/azora/TrackingMap.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import { io, Socket } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios'; // For calling our new AI service

// --- Icon Fix & Setup ---
// Fix for default marker icons in webpack/vite
const defaultIconPrototype = L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string };
delete defaultIconPrototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Type Definitions ---
type DriverPoint = {
  driverId: string;
  lat: number;
  lon: number;
  status?: string;
  updatedAt?: number;
};

type Risk = {
  zoneId: string;
  location: { lat: number; lon: number };
  risk: number;
  type: string;
};

type Responder = {
  id: string;
  name: string;
  location: { lat: number; lon: number };
};

interface ServerToClientEvents {
  'dispatch:update': (data: DriverPoint) => void;
  'emergency:alert': (data: { driverId: string; location: { lat: number; lon: number } }) => void;
}
interface ClientToServerEvents {
  'driver:location': (data: DriverPoint) => void;
  'emergency:trigger': (data: { driverId: string; location: { lat: number; lon: number } }) => void;
}

// --- Component ---
const socketEnv = (typeof import.meta !== 'undefined' && 'env' in import.meta
  ? (import.meta as ImportMeta).env
  : undefined) as Record<string, string | undefined> | undefined;

const socketUrl = socketEnv?.VITE_SOCKET_URL ?? window.location.origin;

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl);

export default function TrackingMap() {
  const [drivers, setDrivers] = useState<DriverPoint[]>([]);
  const [predictedRisks, setPredictedRisks] = useState<Risk[]>([]);
  const [optimalRoute, setOptimalRoute] = useState<L.LatLngExpression[]>([]);
  const [emergency, setEmergency] = useState<{ location: L.LatLngTuple; authority: Responder; responders: Responder[] } | null>(null);

  const predictAndSetRoute = useCallback(async (driver: DriverPoint) => {
    try {
      const route = {
        start: { lat: driver.lat, lon: driver.lon },
        destination: { lat: -29.9, lon: 31.0 },
        waypoints: [[driver.lat, driver.lon], [-29.9, 31.0]],
      };
      const res = await axios.post('/api/ai-orchestrator/map/predict-risk', { route });
      setPredictedRisks(res.data.risks);
      setOptimalRoute(res.data.optimalRoute.map((p: { lat: number; lon: number }) => [p.lat, p.lon]));
    } catch (error) {
      console.error('Failed to get route prediction:', error);
    }
  }, []);

  // --- AI & Real-time Handlers ---
  useEffect(() => {
    const handleDispatchUpdate = (data: DriverPoint) => {
      setDrivers((prev) => [
        ...prev.filter((d) => d.driverId !== data.driverId),
        { ...data, updatedAt: Date.now() },
      ]);
      // Trigger predictive analysis on driver movement
      predictAndSetRoute(data);
    };

    const handleEmergencyAlert = async (data: { driverId: string; location: { lat: number; lon: number } }) => {
      // Fetch nearby responders using our AI service
      const res = await axios.post('/api/ai-orchestrator/map/responders', { location: data.location });
      setEmergency({
        location: [data.location.lat, data.location.lon],
        authority: res.data.closestAuthority,
        responders: res.data.firstResponders,
      });
    };

    socket.on('dispatch:update', handleDispatchUpdate);
    socket.on('emergency:alert', handleEmergencyAlert);
    return () => {
      socket.off('dispatch:update', handleDispatchUpdate);
      socket.off('emergency:alert', handleEmergencyAlert);
    };
  }, [predictAndSetRoute]);

  const triggerEmergency = useCallback((driverId: string) => {
    const driver = drivers.find(d => d.driverId === driverId);
    if (driver) {
      socket.emit('emergency:trigger', { driverId, location: { lat: driver.lat, lon: driver.lon } });
    }
  }, [drivers]);

  const sortedDrivers = useMemo(
    () => [...drivers].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
    [drivers]
  );

  // --- Rendering ---
  return (
    <div className="h-[600px] w-full relative">
      <div className="absolute top-2 right-2 z-[1000] bg-white/80 p-2 rounded shadow-lg">
        <h3 className="font-bold">AI Map Controls</h3>
        <button onClick={() => triggerEmergency('driver-001')} className="text-xs bg-red-500 text-white p-1 rounded">
          Simulate Emergency
        </button>
      </div>
      <MapContainer center={[-29.85, 31.02]} zoom={10} className="h-full w-full rounded-lg shadow-2xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        
        {/* Live Drivers */}
  {sortedDrivers.map((d) => (
          <Marker key={d.driverId} position={[d.lat, d.lon]}>
            <Popup>
              <strong>Driver:</strong> {d.driverId}<br/>
              <strong>Status:</strong> {d.status || 'unknown'}
            </Popup>
          </Marker>
        ))}

        {/* AI Predicted Route & Risks */}
        {optimalRoute.length > 0 && <Polyline positions={optimalRoute} color="blue" weight={5} opacity={0.7} />}
        {predictedRisks.map(risk => (
          <CircleMarker key={risk.zoneId} center={[risk.location.lat, risk.location.lon]} radius={20} color="red" fillColor="orange" fillOpacity={0.4}>
            <Popup><strong>Risk Zone:</strong> {risk.type}<br/><strong>Score:</strong> {risk.risk}</Popup>
          </CircleMarker>
        ))}

        {/* Emergency Visualization */}
        {emergency && (
          <>
            <CircleMarker center={emergency.location} radius={30} color="red" weight={5}>
              <Popup>EMERGENCY</Popup>
            </CircleMarker>
            {emergency.authority && <Marker position={[emergency.authority.location.lat, emergency.authority.location.lon]}><Popup>Authority: {emergency.authority.name}</Popup></Marker>}
            {emergency.responders.map(r => <Marker key={r.id} position={[r.location.lat, r.location.lon]}><Popup>First Responder: {r.name}</Popup></Marker>)}
          </>
        )}
      </MapContainer>
    </div>
  );
}