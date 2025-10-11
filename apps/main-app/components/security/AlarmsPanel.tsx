import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { SecurityAlarm } from '../../features/security/mockSecurity';
import { formatDistanceToNow } from 'date-fns';

interface AlarmsPanelProps {
  alarms: SecurityAlarm[];
}

const severityConfig = {
  critical: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-900/30' },
  high: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-900/30' },
  medium: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  low: { icon: AlertTriangle, color: 'text-blue-400', bg: 'bg-blue-900/30' },
};

const AlarmsPanel: React.FC<AlarmsPanelProps> = ({ alarms }) => {
  const activeAlarms = alarms.filter(a => !a.resolved);
  const resolvedAlarms = alarms.filter(a => a.resolved);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Security Alarms</h2>
      {activeAlarms.length === 0 ? (
        <div className="text-center py-8 bg-green-900/20 rounded-lg">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <p className="text-green-300 font-medium">No Active Alarms</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAlarms.map((alarm) => {
            const config = severityConfig[alarm.severity];
            const Icon = config.icon;
            return (
              <motion.div
                key={alarm.id}
                className={`p-4 rounded-lg border border-gray-700 ${config.bg}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-6 h-6 mt-1 ${config.color}`} />
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className={`font-bold ${config.color}`}>{alarm.type}</h3>
                      <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {alarm.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{alarm.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(alarm.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
       {resolvedAlarms.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-400 mt-6 mb-3">Resolved Alarms</h3>
          <div className="space-y-2">
            {resolvedAlarms.map(alarm => (
              <div key={alarm.id} className="p-3 rounded-lg bg-gray-800/50 text-gray-500 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{alarm.type} - {alarm.description}</span>
                </div>
                <span className="text-xs">{new Date(alarm.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AlarmsPanel;
