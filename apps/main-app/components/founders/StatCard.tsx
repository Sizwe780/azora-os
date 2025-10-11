import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'cyan' | 'purple' | 'green' | 'yellow';
}

const colorMap = {
    cyan: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-400',
    },
    purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
    },
    green: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-400',
    },
    yellow: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
    },
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
    const classes = colorMap[color];

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="bg-gray-900/50 border border-white/10 rounded-xl p-5 flex items-center space-x-4 backdrop-blur-lg"
        >
            <div className={`p-3 rounded-full border ${classes.bg} ${classes.border}`}>
                <Icon className={`w-7 h-7 ${classes.text}`} />
            </div>
            <div>
                <p className="text-sm text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;
