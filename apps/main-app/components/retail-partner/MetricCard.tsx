import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    className={`bg-gray-900/50 border border-${color}-500/30 rounded-2xl p-6 text-center`}
    whileHover={{ scale: 1.05, backgroundColor: `rgba(var(--${color}-500-rgb), 0.1)` }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Icon className={`text-4xl text-${color}-400 mx-auto mb-3`} />
    <p className={`text-4xl font-bold text-${color}-300`}>{value}</p>
    <p className="text-sm text-gray-400 mt-1">{label}</p>
  </motion.div>
);

export default MetricCard;
