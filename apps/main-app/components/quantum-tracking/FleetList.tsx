import React from 'react';
import { motion } from 'framer-motion';
import { Battery, Gauge, Target } from 'lucide-react';
import { Vehicle } from '../features/quantum-tracking/mockQuantum';

interface FleetListProps {
  fleet: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

const getStatusColor = (status: string) => {
  if (status === 'active') return 'border-green-500/50 bg-green-500/20 text-green-300';
  if (status === 'charging') return 'border-yellow-500/50 bg-yellow-500/20 text-yellow-300';
  return 'border-gray-500/50 bg-gray-500/20 text-gray-300';
};

const FleetList: React.FC<FleetListProps> = ({ fleet, selectedVehicle, onSelectVehicle }) => {
  return (
    <div className="lg:col-span-1 flex flex-col min-h-0">
      <h2 className="text-xl font-bold text-white mb-4">Live Fleet</h2>
      <div className="flex-grow space-y-3 overflow-y-auto pr-2">
        {fleet.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onSelectVehicle(vehicle)}
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
  );
};

export default FleetList;
