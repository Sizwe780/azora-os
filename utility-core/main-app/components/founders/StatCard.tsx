import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'cyan' | 'purple' | 'green' | 'yellow';
}

const colorMap = {
    cyan: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-300',
        shadow: 'shadow-cyan-500/10'
    },
    purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-300',
        shadow: 'shadow-purple-500/10'
    },
    green: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-300',
        shadow: 'shadow-green-500/10'
    },
    yellow: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-300',
        shadow: 'shadow-yellow-500/10'
    },
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
    const classes = colorMap[color];

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className={`bg-gray-950/70 border border-cyan-500/20 rounded-2xl p-5 flex items-center space-x-4 backdrop-blur-lg shadow-2xl shadow-cyan-500/5 hover:bg-gray-900/80 transition-colors duration-300`}
        >
            <div className={`p-3 rounded-full border ${classes.bg} ${classes.border}`}>
                <Icon className={`w-7 h-7 ${classes.text}`} />
            </div>
            <div>
                <p className="text-sm text-cyan-200/80">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;
