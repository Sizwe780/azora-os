import { motion } from 'framer-motion';
import { mockUserData } from '../../features/dashboard/mockDashboardData';
import { Bell, Settings, CheckCircle } from 'lucide-react';

const DashboardHeader = () => {
  const { name, role, avatarUrl, systemStatus, systemStatusColor } = mockUserData;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border-2 border-white/20 flex-shrink-0"
        >
            <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
        </motion.div>
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Welcome back, {name}</h1>
            <p className="text-gray-400">{role}</p>
            <div className="flex items-center gap-2 mt-1">
                <CheckCircle className={`w-4 h-4 ${systemStatusColor}`} />
                <span className={`text-sm ${systemStatusColor}`}>{systemStatus}</span>
            </div>
        </div>
      </div>
      <div className="flex items-center gap-3 self-end sm:self-center">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="p-2.5 rounded-full bg-gray-900/50 border border-white/10 hover:bg-gray-800/60 transition-colors">
          <Bell className="w-5 h-5 text-gray-300" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="p-2.5 rounded-full bg-gray-900/50 border border-white/10 hover:bg-gray-800/60 transition-colors">
          <Settings className="w-5 h-5 text-gray-300" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
