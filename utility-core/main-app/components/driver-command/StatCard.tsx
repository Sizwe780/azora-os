import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  color: 'green' | 'cyan' | 'yellow' | 'purple';
  index: number;
}

const colorClasses = {
    green: { border: 'border-green-500/30', text: 'text-green-400' },
    cyan: { border: 'border-cyan-500/30', text: 'text-cyan-400' },
    yellow: { border: 'border-yellow-500/30', text: 'text-yellow-400' },
    purple: { border: 'border-purple-500/30', text: 'text-purple-400' },
}

const StatCard = ({ icon: Icon, title, value, color, index }: StatCardProps) => {
    const classes = colorClasses[color];
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
            className={`bg-gray-900/50 backdrop-blur-xl border ${classes.border} rounded-2xl p-5 text-center flex flex-col justify-center items-center`}
        >
            <div className="p-3 bg-gray-800/40 rounded-full mb-3">
                <Icon className={`w-7 h-7 ${classes.text}`} />
            </div>
            <p className={`text-3xl font-bold text-white`}>{value}</p>
            <p className="text-sm text-gray-400">{title}</p>
        </motion.div>
    );
};

export default StatCard;
