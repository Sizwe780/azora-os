import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Battery, Navigation, Zap, TrendingUp, Target, Gauge, Thermometer, MapPin, Users, Cpu, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const StatCard = ({ icon: Icon, title, value, metric, color }) => (
  <div className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-4`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
    {metric && <p className="text-xs text-gray-400 mt-1">{metric}</p>}
  </div>
);

const generateMockVehicle = (id: number): Vehicle => {
  const lat = -33.9249 + (Math.random() - 0.5) * 0.1;
  const lng = 18.4241 + (Math.random() - 0.5) * 0.1;
  const statuses = ['active', 'charging', 'idle'];
  return {
    id: `AZ-${1000 + id}`,
    driver: `Driver ${100 + id}`,
    model: 'Azora One',
    status: statuses[id % 3],
    mission: `Delivery to CPT-${200 + id}`,
    location: { lat, lng, speed: Math.floor(Math.random() * 80) },
    telemetry: {
      battery: Math.floor(Math.random() * 80) + 20,
      temperature: Math.floor(Math.random() * 10) + 15,
      power_usage: parseFloat((Math.random() * 5).toFixed(1)),
      efficiency: parseFloat((Math.random() * 5 + 10).toFixed(1)),
    },
    route: {
      optimal: Math.random() > 0.2,
      waypoints: [
        { lat: lat - 0.01, lng: lng - 0.01 },
        { lat, lng },
        { lat: lat + 0.01, lng: lng + 0.01 },
      ],
    },
    ai_insights: {
      driver_score: Math.floor(Math.random() * 15) + 85,
      eco_score: Math.floor(Math.random() * 20) + 80,
      safety_score: Math.floor(Math.random() * 10) + 90,
      predicted_arrival: `${Math.floor(Math.random() * 2) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      confidence: parseFloat(Math.random().toFixed(2)),
    },
  };
};

export default function QuantumTracking() {
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [swarmData, setSwarmData] = useState(null);
  const [isConnected, setIsConnected] = useState(true); // Mock connection status

  useEffect(() => {
    const mockFleet = Array.from({ length: 15 }, (_, i) => generateMockVehicle(i));
    setFleet(mockFleet);
    setSwarmData({
      active: mockFleet.filter(v => v.status === 'active').length,
      total_vehicles: mockFleet.length,
      coordination_score: 98.5,
      energy_savings: 12.3,
      time_savings: 8.7,
      fleet_efficiency: 95.2,
    });

    const interval = setInterval(() => {
      setFleet(prevFleet => prevFleet.map(v => ({
        ...v,
        location: { ...v.location, lat: v.location.lat + (Math.random() - 0.5) * 0.0005, lng: v.location.lng + (Math.random() - 0.5) * 0.0005 },
        telemetry: { ...v.telemetry, battery: Math.max(0, v.telemetry.battery - 0.1) },
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'border-green-500/50 bg-green-500/20 text-green-300';
    if (status === 'charging') return 'border-yellow-500/50 bg-yellow-500/20 text-yellow-300';
    return 'border-gray-500/50 bg-gray-500/20 text-gray-300';
  };

  const mapCenter = useMemo(() => {
    if (fleet.length > 0) {
      return [fleet[0].location.lat, fleet[0].location.lng];
    }
    return [-33.9249, 18.4241];
  }, [fleet]);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Navigation className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Quantum Tracking</h1>
              <p className="text-cyan-300">Real-time fleet intelligence and swarm optimization.</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>
      </motion.div>

      {/* Swarm Stats */}
      {swarmData && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} title="Active Fleet" value={`${swarmData.active}/${swarmData.total_vehicles}`} color="blue" />
          <StatCard icon={Cpu} title="Swarm IQ" value={`${swarmData.coordination_score}%`} color="purple" />
          <StatCard icon={Zap} title="Energy Saved" value={`${swarmData.energy_savings}%`} color="green" />
          <StatCard icon={TrendingUp} title="Time Saved" value={`${swarmData.time_savings}%`} color="orange" />
          <StatCard icon={Activity} title="Fleet Efficiency" value={`${swarmData.fleet_efficiency}%`} color="cyan" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Fleet List */}
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <h2 className="text-xl font-bold text-white mb-4">Live Fleet</h2>
          <div className="flex-grow space-y-3 overflow-y-auto pr-2">
            {fleet.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedVehicle?.id === vehicle.id ? 'bg-gray-700/50 border-blue-500' : 'bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white">{vehicle.id}</p>
                    <p className="text-sm text-gray-400">{vehicle.driver}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>{vehicle.status}</span>
                </div>
                <div className="flex justify-between items-end mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Battery className="w-4 h-4 text-green-400" />
                    <span className="text-white">{vehicle.telemetry.battery.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="w-4 h-4 text-blue-400" />
                    <span className="text-white">{vehicle.location.speed} km/h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-white">{vehicle.ai_insights.driver_score}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-700/50 relative">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', backgroundColor: '#111827' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CartoDB' />
            {fleet.map((vehicle) => (
              <Marker key={vehicle.id} position={[vehicle.location.lat, vehicle.location.lng]} icon={icon} eventHandlers={{ click: () => setSelectedVehicle(vehicle) }}>
                <Popup>{vehicle.id}: {vehicle.driver}</Popup>
              </Marker>
            ))}
            {selectedVehicle && (
              <>
                <Polyline positions={selectedVehicle.route.waypoints.map(w => [w.lat, w.lng])} color={selectedVehicle.route.optimal ? '#3b82f6' : '#ef4444'} dashArray={selectedVehicle.route.optimal ? null : '5, 5'} />
                <Circle center={[selectedVehicle.location.lat, selectedVehicle.location.lng]} radius={200} color="#3b82f6" fillOpacity={0.2} />
              </>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Selected Vehicle Panel */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 w-[380px] bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl z-[1000]"
          >
            <button onClick={() => setSelectedVehicle(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="mb-4">
              <p className="text-2xl font-bold text-white">{selectedVehicle.id}</p>
              <p className="text-gray-400">{selectedVehicle.model}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Driver</span><span className="text-white">{selectedVehicle.driver}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Mission</span><span className="text-white">{selectedVehicle.mission}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Status</span><span className={`font-semibold ${getStatusColor(selectedVehicle.status).split(' ')[2]}`}>{selectedVehicle.status}</span></div>
            </div>
            <div className="my-4 h-px bg-gray-700" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><Battery className="w-5 h-5 text-green-400" /><span className="text-gray-400">Battery:</span><span className="font-bold text-white">{selectedVehicle.telemetry.battery.toFixed(0)}%</span></div>
              <div className="flex items-center gap-2"><Gauge className="w-5 h-5 text-blue-400" /><span className="text-gray-400">Speed:</span><span className="font-bold text-white">{selectedVehicle.location.speed} km/h</span></div>
              <div className="flex items-center gap-2"><Thermometer className="w-5 h-5 text-orange-400" /><span className="text-gray-400">Temp:</span><span className="font-bold text-white">{selectedVehicle.telemetry.temperature}°C</span></div>
              <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-purple-400" /><span className="text-gray-400">Power:</span><span className="font-bold text-white">{selectedVehicle.telemetry.power_usage} kW</span></div>
            </div>
            <div className="my-4 h-px bg-gray-700" />
            <h3 className="text-base font-bold text-white mb-3">AI Insights</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-800/50 p-2 rounded-lg"><p className="text-xs text-gray-400">Driver</p><p className="font-bold text-lg text-green-400">{selectedVehicle.ai_insights.driver_score}</p></div>
              <div className="bg-gray-800/50 p-2 rounded-lg"><p className="text-xs text-gray-400">Eco</p><p className="font-bold text-lg text-yellow-400">{selectedVehicle.ai_insights.eco_score}</p></div>
              <div className="bg-gray-800/50 p-2 rounded-lg"><p className="text-xs text-gray-400">Safety</p><p className="font-bold text-lg text-purple-400">{selectedVehicle.ai_insights.safety_score}</p></div>
            </div>
            <div className="mt-4 text-center bg-gray-800/50 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Predicted Arrival</p>
              <p className="text-2xl font-bold text-cyan-400">{selectedVehicle.ai_insights.predicted_arrival}</p>
              <p className="text-xs text-gray-500">Confidence: {(selectedVehicle.ai_insights.confidence * 100).toFixed(0)}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
