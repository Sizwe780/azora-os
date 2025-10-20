import { motion } from 'framer-motion';
import { StatCardData } from '../../features/dashboard/mockDashboardData';

const StatCard = ({ icon: Icon, label, value, change, changeType, color, index }: StatCardData & { index: number }) => {
  const changeColor = changeType === 'increase' ? 'text-green-400' : changeType === 'decrease' ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-${color}-500/20 border border-${color}-500/30`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-semibold ${changeColor}`}>{change}</span>
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-sm text-white/60">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
