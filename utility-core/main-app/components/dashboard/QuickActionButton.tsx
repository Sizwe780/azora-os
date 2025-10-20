import { motion } from 'framer-motion';
import { QuickActionData } from '../../features/dashboard/mockDashboardData';

const QuickActionButton = ({ label, path, icon: Icon, index }: QuickActionData & { index: number }) => (
  <motion.a
    href={path}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
    className="flex flex-col items-center justify-center gap-2 text-center py-4 bg-gray-900/50 rounded-xl border border-white/10 hover:bg-gray-800/60 hover:border-cyan-500/50 transition-all duration-300 group"
  >
    <Icon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
    <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{label}</span>
  </motion.a>
);

export default QuickActionButton;
