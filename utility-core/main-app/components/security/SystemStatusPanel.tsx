import React from 'react';
import { Database, Server, Cpu, Timer } from 'lucide-react';
import { SystemHealth, BackupStatus } from '../../features/security/mockSecurity';
import { formatDistanceToNow } from 'date-fns';

interface SystemStatusPanelProps {
  health: SystemHealth;
  backup: BackupStatus;
}

const HealthMetric: React.FC<{ icon: React.ElementType, label: string, value: string | number, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="text-center">
    <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({ health, backup }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Health */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Server /> System Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HealthMetric icon={Timer} label="Uptime" value={`${health.uptime}%`} color="text-green-400" />
          <HealthMetric icon={Database} label="Memory" value={`${health.memoryUsage}%`} color="text-blue-400" />
          <HealthMetric icon={Cpu} label="CPU" value={`${health.cpuUsage}%`} color="text-purple-400" />
          <HealthMetric icon={Timer} label="Response" value={`${health.responseTime}ms`} color="text-cyan-400" />
        </div>
      </div>

      {/* Backup Status */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Database /> Backup System</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Last Backup:</span> <span className="text-white font-medium">{formatDistanceToNow(new Date(backup.lastBackup), { addSuffix: true })}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Next Backup:</span> <span className="text-white font-medium">{formatDistanceToNow(new Date(backup.nextBackup), { addSuffix: true })}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Redundancy:</span> <span className="font-bold text-green-400">{backup.redundancy}x</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Total Size:</span> <span className="text-white font-medium">{backup.size}</span></div>
          <div>
            <span className="text-gray-400">Locations:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {backup.locations.map((loc) => (
                <span key={loc} className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full">{loc}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPanel;
