import { motion } from 'framer-motion';
import { DroneData, statusConfig } from '../../features/drone-monitor/mockData';
import { FileText } from 'lucide-react';

interface DroneListProps {
  drones: DroneData[];
  onSelectLog: (drone: DroneData) => void;
}

const colorClasses = {
    green: { text: 'text-green-400', bg: 'bg-green-500' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500' },
    red: { text: 'text-red-400', bg: 'bg-red-500' },
    gray: { text: 'text-gray-400', bg: 'bg-gray-500' },
};

const DroneList = ({ drones, onSelectLog }: DroneListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-4">Fleet Status</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b-2 border-gray-700/50">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-400">ID</th>
              <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-400">Battery</th>
              <th className="p-4 text-sm font-semibold text-gray-400">Location</th>
              <th className="p-4 text-sm font-semibold text-gray-400">Pilot</th>
              <th className="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drones.map(d => {
              const config = statusConfig[d.status] || statusConfig.offline;
              const colors = colorClasses[config.color as keyof typeof colorClasses] || colorClasses.gray;
              return (
                <motion.tr
                  key={d.id}
                  className="border-b border-gray-800/70 hover:bg-gray-800/40 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="p-4 font-mono text-sm text-white">{d.id}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-2 text-sm font-medium ${colors.text}`}>
                      <config.icon className="w-5 h-5" />
                      <span>{config.label}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div className={`${colors.bg} h-2 rounded-full`} style={{ width: `${d.battery}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-300 w-10 text-right">{d.battery}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{d.location}</td>
                  <td className="p-4 text-sm text-gray-300">{d.driver}</td>
                  <td className="p-4 text-right">
                    <motion.button
                      onClick={() => onSelectLog(d)}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-800/60 border border-gray-600/80 rounded-md text-gray-300 hover:text-white transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Log</span>
                    </motion.button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DroneList;
