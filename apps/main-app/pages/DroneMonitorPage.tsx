import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Drone, BatteryCharging, PowerOff, Wrench, RefreshCw } from 'lucide-react';

import { initialDrones, DroneData, generateLogsheet, statusConfig } from '../features/drone-monitor/mockData';
import StatCard from '../components/drone-monitor/StatCard';
import DroneList from '../components/drone-monitor/DroneList';
import BatteryChart from '../components/drone-monitor/BatteryChart';
import LogModal from '../components/drone-monitor/LogModal';

const DroneMonitorPage = () => {
  const [drones, setDrones] = useState<DroneData[]>(initialDrones);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => {
    const total = drones.length;
    const active = drones.filter(d => d.status === 'active').length;
    const charging = drones.filter(d => d.status === 'charging').length;
    const offline = drones.filter(d => d.status === 'offline' || d.status === 'maintenance').length;
    return { total, active, charging, offline };
  }, [drones]);

  const refreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDrones(drones => drones.map(d => {
        if (d.status === 'maintenance') return d;
        const batteryChange = Math.floor(Math.random() * 10) - 4;
        const newBattery = Math.max(0, Math.min(100, d.battery + batteryChange));
        let newStatus: DroneData['status'] = d.status;

        if (d.status === 'charging') {
          if (newBattery > 95) newStatus = 'active';
          else newStatus = 'charging';
        } else {
          if (newBattery < 10) newStatus = 'offline';
          else if (newBattery < 30) newStatus = 'charging';
          else newStatus = 'active';
        }
        
        return {
          ...d,
          battery: newBattery,
          lastCheck: new Date().toISOString(),
          status: newStatus,
          flightTime: d.flightTime + (Math.random() * 0.5),
        };
      }));
      setIsRefreshing(false);
    }, 750);
  };

  const statCards = [
    { icon: Drone, title: "Total Drones", value: stats.total.toString(), color: 'blue' as 'blue' | 'green' | 'yellow' | 'red' },
    { icon: statusConfig.active.icon, title: "Active", value: stats.active.toString(), color: 'green' as 'blue' | 'green' | 'yellow' | 'red' },
    { icon: statusConfig.charging.icon, title: "Charging", value: stats.charging.toString(), color: 'yellow' as 'blue' | 'green' | 'yellow' | 'red' },
    { icon: statusConfig.offline.icon, title: "Offline/Maint.", value: stats.offline.toString(), color: 'red' as 'blue' | 'green' | 'yellow' | 'red' },
  ];

  return (
    <>
      <Helmet>
        <title>Drone Command Center | Azora</title>
        <meta name="description" content="Monitor and manage your entire autonomous drone fleet in real-time. View live statuses, battery levels, and operational logs." />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-950 min-h-screen text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-between items-center gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Drone className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Drone Command Center</h1>
              <p className="text-blue-300/80">Real-Time Fleet Operations</p>
            </div>
          </div>
          <motion.button
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <StatCard key={card.title} {...card} index={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DroneList drones={drones} onSelectLog={(d) => setSelectedLog(generateLogsheet(d))} />
          </div>
          <div className="lg:col-span-1">
            <BatteryChart drones={drones} />
          </div>
        </div>
      </div>
      {/* Close the main container div */}

      <AnimatePresence>
        {selectedLog && (
          <LogModal logContent={selectedLog} onClose={() => setSelectedLog(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default DroneMonitorPage;
