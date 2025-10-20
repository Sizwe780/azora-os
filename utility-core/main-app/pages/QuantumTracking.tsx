import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Navigation, Zap, TrendingUp, Users, Cpu } from 'lucide-react';
import StatCard from '../components/StatCard';
import FleetList from '../components/quantum-tracking/FleetList';
import MapView from '../components/quantum-tracking/MapView';
import VehicleDetailPanel from '../components/quantum-tracking/VehicleDetailPanel';
import { Vehicle, SwarmData, getMockFleet, getMockSwarmData } from '../features/quantum-tracking/mockQuantum';

export default function QuantumTracking() {
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [swarmData, setSwarmData] = useState<SwarmData | null>(null);
  const [isConnected, setIsConnected] = useState(true); // Mock connection status

  useEffect(() => {
    const mockFleet = getMockFleet(15);
    setFleet(mockFleet);
    setSwarmData(getMockSwarmData(mockFleet));

    const interval = setInterval(() => {
      setFleet(prevFleet => prevFleet.map(v => ({
        ...v,
        location: { ...v.location, lat: v.location.lat + (Math.random() - 0.5) * 0.0005, lng: v.location.lng + (Math.random() - 0.5) * 0.0005 },
        telemetry: { ...v.telemetry, battery: Math.max(0, v.telemetry.battery - 0.1) },
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const mapCenter = useMemo((): [number, number] => {
    if (fleet.length > 0) {
      return [fleet[0].location.lat, fleet[0].location.lng];
    }
    return [-33.9249, 18.4241];
  }, [fleet]);

  return (
    <div className="h-full flex flex-col space-y-6 p-6 bg-gray-950 text-white">
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
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
        >
          <StatCard icon={Users} title="Active Fleet" value={`${swarmData.active}/${swarmData.total_vehicles}`} color="blue" />
          <StatCard icon={Cpu} title="Swarm IQ" value={`${swarmData.coordination_score}%`} color="purple" />
          <StatCard icon={Zap} title="Energy Saved" value={`${swarmData.energy_savings}%`} color="green" />
          <StatCard icon={TrendingUp} title="Time Saved" value={`${swarmData.time_savings}%`} color="orange" />
          <StatCard icon={Activity} title="Fleet Efficiency" value={`${swarmData.fleet_efficiency}%`} color="cyan" />
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <FleetList fleet={fleet} selectedVehicle={selectedVehicle} onSelectVehicle={setSelectedVehicle} />
        <MapView fleet={fleet} selectedVehicle={selectedVehicle} center={mapCenter} onSelectVehicle={setSelectedVehicle} />
      </div>

      {/* Selected Vehicle Panel */}
      <VehicleDetailPanel vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
    </div>
  );
}
