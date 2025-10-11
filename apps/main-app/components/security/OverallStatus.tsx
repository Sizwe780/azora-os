import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface OverallStatusProps {
  allLayersGreen: boolean;
  criticalAlarmsCount: number;
}

const OverallStatus: React.FC<OverallStatusProps> = ({ allLayersGreen, criticalAlarmsCount }) => {
  const isSecure = allLayersGreen && criticalAlarmsCount === 0;

  return (
    <motion.div
      className={`rounded-2xl p-6 border-2 ${
        isSecure
          ? 'bg-green-900/30 border-green-500/50'
          : 'bg-red-900/30 border-red-500/50 animate-pulse'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Shield className={`w-10 h-10 ${isSecure ? 'text-green-400' : 'text-red-400'}`} />
          <div>
            <h2 className={`text-2xl font-bold ${isSecure ? 'text-white' : 'text-red-300'}`}>
              {isSecure ? 'System Secure' : 'SECURITY ALERT'}
            </h2>
            <p className={`text-sm ${isSecure ? 'text-green-300' : 'text-red-300'}`}>
              {isSecure ? 'All systems operational and secure.' : 'Immediate attention required.'}
            </p>
          </div>
        </div>
        {isSecure ? (
          <CheckCircle className="w-12 h-12 text-green-400" />
        ) : (
          <AlertTriangle className="w-12 h-12 text-red-400" />
        )}
      </div>
    </motion.div>
  );
};

export default OverallStatus;
