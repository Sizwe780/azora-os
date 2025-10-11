import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Activity, Clock } from 'lucide-react';
import { Anomaly } from '../../features/attendance/mockAttendanceData';
import { formatDistanceToNow } from 'date-fns';

interface AnomaliesDashboardProps {
  anomalies: Anomaly[];
}

const SEVERITY_MAP = {
  high: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-500/30' },
  medium: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-500/30' },
  low: { icon: Activity, color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-500/30' },
};

const AnomalyCard: React.FC<{ anomaly: Anomaly, index: number }> = ({ anomaly, index }) => {
  const { icon: Icon, color, bg } = SEVERITY_MAP[anomaly.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`flex items-start gap-4 p-4 rounded-lg ${bg}`}
    >
      <div className={`p-2 rounded-full ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <p className="font-semibold text-white">{anomaly.employeeName}</p>
            <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(anomaly.timestamp), { addSuffix: true })}
            </span>
        </div>
        <p className="text-sm text-gray-300">{anomaly.description}</p>
        <div className="mt-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${bg} ${color}`}>{anomaly.type}</span>
        </div>
      </div>
      <img src={anomaly.employeeAvatar} alt={anomaly.employeeName} className="w-10 h-10 rounded-full border-2 border-gray-600" />
    </motion.div>
  );
};

const AnomaliesDashboard: React.FC<AnomaliesDashboardProps> = ({ anomalies }) => {
  if (anomalies.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        <span>Anomalies Detected</span>
      </h2>
      <div className="space-y-3">
        {anomalies.map((anomaly, index) => (
          <AnomalyCard key={index} anomaly={anomaly} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default AnomaliesDashboard;
