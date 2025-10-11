import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  index: number;
}

const colorClasses = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
}

const StatCard = ({ icon: Icon, title, value, color, index }: StatCardProps) => {
    const classes = colorClasses[color];
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
            className={`bg-gray-900/50 backdrop-blur-xl border ${classes.border} rounded-2xl p-5 flex items-center gap-5`}
        >
            <div className={`p-3 ${classes.bg} rounded-xl border ${classes.border}`}>
            <Icon className={`w-7 h-7 ${classes.text}`} />
            </div>
            <div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{title}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;
