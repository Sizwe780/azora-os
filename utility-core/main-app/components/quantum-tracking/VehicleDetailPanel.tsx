import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Battery, Gauge, Thermometer, Zap } from 'lucide-react';
import { Vehicle } from '../../features/quantum-tracking/mockQuantum';

interface VehicleDetailPanelProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  if (status === 'active') return 'text-green-300';
  if (status === 'charging') return 'text-yellow-300';
  return 'text-gray-300';
};

const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({ vehicle, onClose }) => {
  return (
    <AnimatePresence>
      {vehicle && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 w-[380px] bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl z-[1000]"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
          <div className="mb-4">
            <p className="text-2xl font-bold text-white">{vehicle.id}</p>
            <p className="text-gray-400">{vehicle.model}</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Driver</span><span className="text-white">{vehicle.driver}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Mission</span><span className="text-white">{vehicle.mission}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status</span><span className={`font-semibold ${getStatusColor(vehicle.status)}`}>{vehicle.status}</span></div>
          </div>
          <div className="my-4 h-px bg-gray-700" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2"><Battery className="w-5 h-5 text-green-400" /><span className="text-gray-400">Battery:</span><span className="font-bold text-white">{vehicle.telemetry.battery.toFixed(0)}%</span></div>
            <div className="flex items-center gap-2"><Gauge className="w-5 h-5 text-blue-400" /><span className="text-gray-400">Speed:</span><span className="font-bold text-white">{vehicle.location.speed} km/h</span></div>
            <div className="flex items-center gap-2"><Thermometer className="w-5 h-5 text-orange-400" /><span className="text-gray-400">Temp:</span><span className="font-bold text-white">{vehicle.telemetry.temperature}°C</span></div>
            <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-purple-400" /><span className="text-gray-400">Power:</span><span className="font-bold text-white">{vehicle.telemetry.power_usage} kW</span></div>
          </div>
          <div className="my-4 h-px bg-gray-700" />
          <h3 className="text-base font-bold text-white mb-3">AI Insights</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-800/50 p-2 rounded-lg"><p className="text-xs text-gray-400">Driver</p><p className="font-bold text-lg text-green-400">{vehicle.ai_insights.driver_score}</p></div>
            <div className="bg-gray-800/50 p-2 rounded-lg"><p className="text-xs text-gray-400">Eco</p><p className="font-bold text-lg text-yellow-400">{vehicle.ai_insights.eco_score}</p></div>
            <div className="bg-gray-800/50 p-2 rounded-lg"><p className="text-xs text-gray-400">Safety</p><p className="font-bold text-lg text-purple-400">{vehicle.ai_insights.safety_score}</p></div>
          </div>
          <div className="mt-4 text-center bg-gray-800/50 p-3 rounded-lg">
            <p className="text-sm text-gray-400">Predicted Arrival</p>
            <p className="text-2xl font-bold text-cyan-400">{vehicle.ai_insights.predicted_arrival}</p>
            <p className="text-xs text-gray-500">Confidence: {(vehicle.ai_insights.confidence * 100).toFixed(0)}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VehicleDetailPanel;
