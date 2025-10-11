import { motion } from 'framer-motion';
import { ServiceModuleData } from '../../features/dashboard/mockDashboardData';
import { CheckCircle, AlertTriangle, Tool } from 'lucide-react';

const statusConfig = {
  operational: {
    icon: CheckCircle,
    color: 'green',
    label: 'Operational',
  },
  degraded: {
    icon: AlertTriangle,
    color: 'yellow',
    label: 'Degraded',
  },
  maintenance: {
    icon: Tool,
    color: 'blue',
    label: 'Maintenance',
  },
};

const ServiceModuleCard = ({ icon: Icon, name, description, path, status, tags, index }: ServiceModuleData & { index: number }) => {
  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <motion.a
      href={path}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
      className="block group bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-gray-800/60 transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <Icon className="w-7 h-7 text-cyan-400" />
        </div>
        <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full font-semibold bg-${currentStatus.color}-500/20 text-${currentStatus.color}-400 border border-${currentStatus.color}-500/30`}>
          <StatusIcon className="w-3 h-3" />
          <span>{currentStatus.label}</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{name}</h3>
      <p className="text-sm text-white/60 mb-4 h-10">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-300">{tag}</span>
        ))}
      </div>
    </motion.a>
  );
};

export default ServiceModuleCard;
