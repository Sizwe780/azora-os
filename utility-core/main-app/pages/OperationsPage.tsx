import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, Clock, TrendingUp, Server, Database, Shield, Cpu, BrainCircuit } from 'lucide-react';
import { getMockOperationsData, OperationsData, SystemHealth } from '../features/operations/mockOperations';

const systemIcons: { [key in keyof SystemHealth]: React.ElementType } = {
    api: Server,
    database: Database,
    security: Shield,
    monitoring: Activity,
    ai_models: BrainCircuit,
    quantum_microservice: Cpu,
};

const SystemHealthCard = ({ system, status }: { system: string, status: boolean }) => {
    const Icon = systemIcons[system] || Server;
    const color = status ? 'green' : 'red';
    return (
        <div className={`bg-gray-900/50 border border-gray-700/50 rounded-2xl p-4 flex items-center justify-between hover:border-${color}-500/50 transition-colors`}>
            <div className="flex items-center gap-3">
                <Icon className={`w-6 h-6 text-gray-400`} />
                <p className="font-semibold text-white capitalize">{system.replace('_', ' ')}</p>
            </div>
            <div className={`flex items-center gap-2 text-sm font-bold text-${color}-400`}>
                {status ? <CheckCircle size={16} /> : <XCircle size={16} />}
                <span>{status ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
        </div>
    );
};

const MetricCard = ({ icon: Icon, title, value, unit, color, progress }) => (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
            <Icon className={`w-5 h-5 text-${color}-400`} />
            <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <p className={`text-4xl font-bold text-white`}>
            {value}
            {unit && <span className={`text-2xl text-${color}-400`}>{unit}</span>}
        </p>
        {progress !== undefined && (
            <div className="mt-3 bg-gray-700 rounded-full h-2">
                <motion.div
                    className={`bg-${color}-500 h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
        )}
    </div>
);

export default function OperationsPage() {
  const [data, setData] = useState<OperationsData | null>(null);

  const fetchOperations = useCallback(async () => {
    const result = await getMockOperationsData();
    setData(result);
  }, []);

  useEffect(() => {
    fetchOperations();
    const interval = setInterval(fetchOperations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchOperations]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const allSystemsGreen = Object.values(data.systemHealth).every(status => status);
  const onlineSystems = Object.values(data.systemHealth).filter(status => status).length;
  const totalSystems = Object.keys(data.systemHealth).length;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <Activity className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Operations Dashboard</h1>
            <p className="text-cyan-300">Real-time system health and performance metrics.</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className={`p-6 rounded-2xl border ${allSystemsGreen ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}
      >
        <div className="flex items-center gap-4">
            {allSystemsGreen ? <CheckCircle className="w-8 h-8 text-green-400" /> : <XCircle className="w-8 h-8 text-red-400" />}
            <div>
                <h2 className={`text-xl font-bold ${allSystemsGreen ? 'text-green-300' : 'text-red-300'}`}>
                    {allSystemsGreen ? 'All Systems Operational' : 'System Degradation Detected'}
                </h2>
                <p className={`text-sm ${allSystemsGreen ? 'text-green-400/80' : 'text-red-400/80'}`}>
                    {onlineSystems} of {totalSystems} systems online.
                </p>
            </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className="lg:col-span-1 space-y-4"
        >
            <h2 className="text-2xl font-bold text-white">System Health</h2>
            {Object.entries(data.systemHealth).map(([system, status]) => (
                <SystemHealthCard key={system} system={system} status={status} />
            ))}
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
            <MetricCard icon={TrendingUp} title="Automation Level" value={data.automation.toFixed(1)} unit="%" color="blue" progress={data.automation} />
            <MetricCard icon={Activity} title="System Uptime" value={data.uptime.toFixed(3)} unit="%" color="green" progress={data.uptime} />
            <MetricCard icon={Clock} title="Avg. Response Time" value={data.responseTime} unit="ms" color="purple" progress={undefined} />
            <MetricCard icon={XCircle} title="Error Rate" value={data.errorRate.toFixed(4)} unit="%" color="red" progress={undefined} />
        </motion.div>
      </div>
    </div>
  );
}
