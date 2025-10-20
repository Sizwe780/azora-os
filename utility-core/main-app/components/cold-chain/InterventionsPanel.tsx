import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, ShieldCheck } from 'lucide-react';
import { AutonomousIntervention } from '../../features/cold-chain/mockColdChainData';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_MAP = {
  CRITICAL: { icon: AlertTriangle, color: 'text-red-400', border: 'border-red-500', bg: 'bg-red-900/30' },
  HIGH: { icon: Zap, color: 'text-orange-400', border: 'border-orange-500', bg: 'bg-orange-900/30' },
  MEDIUM: { icon: ShieldCheck, color: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-900/30' },
};

const InterventionCard: React.FC<{ item: AutonomousIntervention }> = ({ item }) => {
  const { icon: Icon, color, border, bg } = SEVERITY_MAP[item.severity];

  return (
    <div className={`p-3 rounded-lg border-l-4 ${border} ${bg}`}>
      <p className="font-bold text-white text-sm">{item.assetName}</p>
      <p className="text-sm text-gray-300">{item.action}</p>
      <div className="flex justify-between items-end mt-1">
        <div>
            <p className={`text-xs ${color}`}>Predicted failure in {item.timeUntilFailure}h</p>
            <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
        </div>
        <p className="text-sm font-bold text-green-400">Saved: ${item.financialImpact.savedAmount.toLocaleString()}</p>
      </div>
    </div>
  );
};

const InterventionsPanel: React.FC<{ interventions: AutonomousIntervention[] }> = ({ interventions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 h-full"
    >
      <h3 className="text-xl font-bold text-white mb-4">Autonomous Interventions</h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {interventions.map((item) => (
          <InterventionCard key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
};

export default InterventionsPanel;
