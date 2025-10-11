import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, color }) => (
    <motion.div 
        className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-4 backdrop-blur-sm`}
        whileHover={{ scale: 1.05, backgroundColor: `rgba(var(--${color}-rgb), 0.1)` }}
        transition={{ type: 'spring', stiffness: 300 }}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className={`text-sm text-${color}-300`}>{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
            <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
                <Icon className={`w-6 h-6 text-${color}-400`} />
            </div>
        </div>
    </motion.div>
);
