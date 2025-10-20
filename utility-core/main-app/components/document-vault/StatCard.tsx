import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: 'green' | 'blue';
  index: number;
}

const colorClasses = {
    green: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-400',
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
    },
}

const StatCard = ({ icon: Icon, label, value, color, index }: StatCardProps) => {
    const classes = colorClasses[color];
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center gap-5"
        >
            <div className={`p-4 rounded-xl ${classes.bg} ${classes.border}`}>
                <Icon className={`w-8 h-8 ${classes.text}`} />
            </div>
            <div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-gray-400">{label}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;
