import React from 'react';
/**
 * 🎯 QUANTUM TRACKING COMMAND CENTER
 * 
 * The most advanced fleet tracking interface ever built.
 * Makes Tesla's interface look like a calculator from the 90s.
 */

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Battery, Navigation, Zap, TrendingUp, AlertTriangle,
  Target, Gauge, Thermometer, Wind, Cloud, MapPin, Users, Cpu
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export default function QuantumTracking() {
  // Type definitions
  type Vehicle = {
    id: string;
    driver: string;
    model: string;
    status: string;
    mission: string;
    location: {
      lat: number;
      lng: number;
      speed: number;
    };
    telemetry: {
      battery: number;
      temperature: number;
      power_usage: number;
      efficiency: number;
    };
    route: {
      optimal: boolean;
      waypoints: { lat: number; lng: number }[];
    };
    ai_insights: {
      driver_score: number;
      eco_score: number;
      safety_score: number;
      predicted_arrival: string;
      confidence: number;
    };
  };

  type SwarmData = {
    active: number;
    total_vehicles: number;
    coordination_score: number;
    energy_savings: number;
    time_savings: number;
    fleet_efficiency: number;
  };

  type Prediction = {
    lat: number;
    lng: number;
    confidence: number;
  };

  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [swarmData, setSwarmData] = useState<SwarmData | null>(null);
  const [predictions, setPredictions] = useState<{ [vehicleId: string]: Prediction[] }>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4040');
    
    ws.onopen = () => {
      console.log('🔗 Connected to Quantum Tracking Engine');
      setIsConnected(true);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'initial' || data.type === 'update') {
        setFleet(data.fleet);
        setSwarmData(data.swarm);
        if (data.predictions) {
          setPredictions(data.predictions);
        }
      }
    };
    
    ws.onclose = () => {
      console.log('🔌 Disconnected from Quantum Tracking Engine');
      setIsConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    wsRef.current = ws;
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'charging': return 'text-yellow-400 bg-yellow-500/20';
      case 'idle': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getDriverScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Quantum Tracking Command Center
            </h1>
            <p className="text-gray-400 mt-2">Tesla × 100 - Real-time fleet intelligence</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Update Rate</div>
              <div className="text-xl font-bold text-cyan-400">1000 Hz</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Swarm Intelligence Stats */}
      {swarmData && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid grid-cols-5 gap-4 mb-6"
        >
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Active Vehicles</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">{swarmData.active}/{swarmData.total_vehicles}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Swarm IQ</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{swarmData.coordination_score.toFixed(1)}%</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Energy Saved</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{swarmData.energy_savings}%</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-400">Time Saved</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">{swarmData.time_savings}%</div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-400">Fleet Efficiency</span>
            </div>
            <div className="text-3xl font-bold text-cyan-400">{swarmData.fleet_efficiency.toFixed(1)}%</div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Fleet List */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            Live Fleet
          </h2>
          
          <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
            {fleet.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border ${selectedVehicle?.id === vehicle.id ? 'border-blue-500' : 'border-gray-700'} rounded-xl p-4 cursor-pointer transition-all`}
              >
                {/* Vehicle Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-lg">{vehicle.id}</div>
                    <div className="text-sm text-gray-400">{vehicle.driver}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.toUpperCase()}
                  </div>
                </div>

                {/* Mission */}
                <div className="text-sm text-gray-300 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  {vehicle.mission}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                    <div className="text-blue-400 font-bold">{vehicle.location.speed} km/h</div>
                    <div className="text-gray-500">Speed</div>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-2 text-center">
                    <div className="text-green-400 font-bold">{vehicle.telemetry.battery}%</div>
                    <div className="text-gray-500">Battery</div>
                  </div>
                  <div className={`rounded-lg p-2 text-center ${vehicle.route.optimal ? 'bg-purple-500/10' : 'bg-red-500/10'}`}>
                    <div className={`font-bold ${vehicle.route.optimal ? 'text-purple-400' : 'text-red-400'}`}>
                      {vehicle.route.optimal ? '✓' : '✗'}
                    </div>
                    <div className="text-gray-500">Route</div>
                  </div>
                </div>

                {/* AI Score */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-400">AI Score</span>
                  <span className={`font-bold ${getDriverScoreColor(vehicle.ai_insights.driver_score)}`}>
                    {vehicle.ai_insights.driver_score}/100
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="col-span-2">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-cyan-400" />
            Quantum Precision Tracking
          </h2>
          
          <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700 rounded-xl p-4 h-[calc(100vh-350px)]">
            <MapContainer
              center={[-33.9249, 18.4241]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {/* Vehicles */}
              {fleet.map((vehicle) => (
                <Marker
                  key={vehicle.id}
                  position={[vehicle.location.lat, vehicle.location.lng]}
                  eventHandlers={{
                    click: () => setSelectedVehicle(vehicle)
                  }}
                >
                  <Popup>
                    <div className="text-black">
                      <div className="font-bold">{vehicle.id}</div>
                      <div className="text-sm">{vehicle.driver}</div>
                      <div className="text-xs text-gray-600 mt-1">{vehicle.mission}</div>
                      <div className="mt-2 text-xs">
                        <div>Speed: {vehicle.location.speed} km/h</div>
                        <div>Battery: {vehicle.telemetry.battery}%</div>
                        <div>Score: {vehicle.ai_insights.driver_score}/100</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Route lines */}
              {fleet.map((vehicle) => (
                vehicle.route.waypoints.length > 0 && (
                  <Polyline
                    key={`route-${vehicle.id}`}
                    positions={vehicle.route.waypoints.map(w => [w.lat, w.lng])}
                    color={vehicle.route.optimal ? '#3b82f6' : '#ef4444'}
                    weight={3}
                    opacity={0.7}
                    dashArray={vehicle.route.optimal ? undefined : '10, 10'}
                  />
                )
              ))}

              {/* Predictions */}
              {selectedVehicle && predictions[selectedVehicle.id] && (
                <>
                  {predictions[selectedVehicle.id]?.map((pred, idx) => (
                    <Circle
                      key={`pred-${idx}`}
                      center={[pred.lat, pred.lng]}
                      radius={50}
                      pathOptions={{
                        color: '#a78bfa',
                        fillColor: '#a78bfa',
                        fillOpacity: pred.confidence * 0.3,
                        weight: 2
                      }}
                    />
                  ))}
                  <Polyline
                    positions={predictions[selectedVehicle.id]?.map(p => [p.lat, p.lng]) ?? []}
                    color="#a78bfa"
                    weight={2}
                    opacity={0.5}
                    dashArray="5, 10"
                  />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Selected Vehicle Detail Panel */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 w-96 bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-xl border border-gray-700 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold">{selectedVehicle.id}</div>
                <div className="text-gray-400">{selectedVehicle.model}</div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Telemetry */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Battery className="w-4 h-4" />
                  Battery
                </span>
                <span className="font-bold text-green-400">{selectedVehicle.telemetry.battery}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Gauge className="w-4 h-4" />
                  Speed
                </span>
                <span className="font-bold text-blue-400">{selectedVehicle.location.speed} km/h</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Thermometer className="w-4 h-4" />
                  Temperature
                </span>
                <span className="font-bold text-orange-400">{selectedVehicle.telemetry.temperature}°C</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Zap className="w-4 h-4" />
                  Power
                </span>
                <span className="font-bold text-purple-400">{selectedVehicle.telemetry.power_usage} kW</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  Efficiency
                </span>
                <span className="font-bold text-cyan-400">{selectedVehicle.telemetry.efficiency} km/kWh</span>
              </div>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="text-sm text-gray-400 mb-2">AI Insights</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-blue-500/10 rounded p-2">
                    <div className={`font-bold ${getDriverScoreColor(selectedVehicle.ai_insights.driver_score)}`}>
                      {selectedVehicle.ai_insights.driver_score}
                    </div>
                    <div className="text-gray-500">Driver</div>
                  </div>
                  <div className="bg-green-500/10 rounded p-2">
                    <div className={`font-bold ${getDriverScoreColor(selectedVehicle.ai_insights.eco_score)}`}>
                      {selectedVehicle.ai_insights.eco_score}
                    </div>
                    <div className="text-gray-500">Eco</div>
                  </div>
                  <div className="bg-purple-500/10 rounded p-2">
                    <div className={`font-bold ${getDriverScoreColor(selectedVehicle.ai_insights.safety_score)}`}>
                      {selectedVehicle.ai_insights.safety_score}
                    </div>
                    <div className="text-gray-500">Safety</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="text-sm text-gray-400 mb-1">Predicted Arrival</div>
                <div className="text-2xl font-bold text-cyan-400">{selectedVehicle.ai_insights.predicted_arrival}</div>
                <div className="text-xs text-gray-500">Confidence: {(selectedVehicle.ai_insights.confidence * 100).toFixed(1)}%</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.5);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.5);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.8);
          }
        `}
      </style>
    </div>
  );
}
