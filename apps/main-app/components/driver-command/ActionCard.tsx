import { motion } from 'framer-motion';
import { CoPilotAction } from '../../features/driver-command/mockData';
import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  action: CoPilotAction & { icon: LucideIcon };
  index: number;
  onClick: (path: string) => void;
}

const colorClasses = {
    blue: { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/20', gradientFrom: 'from-blue-600', gradientTo: 'to-indigo-500' },
    teal: { border: 'border-teal-500/30', text: 'text-teal-400', bg: 'bg-teal-500/20', gradientFrom: 'from-teal-600', gradientTo: 'to-teal-500' },
    emerald: { border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/20', gradientFrom: 'from-emerald-600', gradientTo: 'to-emerald-500' },
}

const ActionCard = ({ action, index, onClick }: ActionCardProps) => {
  const { icon: Icon, title, description, buttonText, color, path } = action;
  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
      className={`bg-gray-900/50 backdrop-blur-xl border ${classes.border} rounded-2xl p-6 flex flex-col shadow-lg ${classes.text}/10`}
    >
      <div className={`p-3 self-start rounded-xl ${classes.bg} border ${classes.border} mb-4`}>
        <Icon className={`w-7 h-7 ${classes.text}`} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 flex-grow">{description}</p>
      <motion.button
        onClick={() => onClick(path)}
        whileHover={{ scale: 1.03, y: -2, boxShadow: `0 4px 15px rgba(0,0,0,0.2)` }}
        whileTap={{ scale: 0.97 }}
        className={`w-full py-2.5 bg-gradient-to-r ${classes.gradientFrom} ${classes.gradientTo} text-white rounded-lg font-semibold transition-all`}
      >
        {buttonText}
      </motion.button>
    </motion.div>
  );
};

export default ActionCard;
