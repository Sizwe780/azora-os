import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import { WellnessData } from '../../features/retail-partner/mockRetail';

interface WellnessPanelProps {
  wellness: WellnessData;
}

const WellnessPanel: React.FC<WellnessPanelProps> = ({ wellness }) => {
  return (
    <motion.div 
      className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
      <div className="flex items-center gap-3 mb-4">
        <HeartPulse className="w-7 h-7 text-red-400" />
        <h2 className="text-2xl font-bold text-white">Employee Wellness Monitor</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <p className="text-gray-400">Total Monitored</p>
          <p className="text-5xl font-bold text-cyan-300">{wellness.totalEmployees}</p>
        </div>
        <div>
          <p className="text-gray-400">High Fatigue Alerts</p>
          <p className="text-5xl font-bold text-red-300">{wellness.highFatigueCount}</p>
        </div>
      </div>
      <div className={`mt-4 p-4 rounded-xl border ${wellness.highFatigueCount > 0 ? 'bg-red-900/30 border-red-500/40' : 'bg-green-900/30 border-green-500/40'}`}>
        <p className="font-semibold text-white">Aura Recommendation:</p>
        <p className="text-gray-300">{wellness.recommendation}</p>
      </div>
    </motion.div>
  );
};

export default WellnessPanel;
