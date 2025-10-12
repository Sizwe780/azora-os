import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  change: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change, color }) => {
  const isPositive = change.startsWith('+');
  const iconColor = `text-${color}-400`;
  const borderColor = `border-${color}-500/30`;
  const bgColor = `bg-${color}-500/10`;

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className={`bg-gray-950/70 border border-cyan-500/20 rounded-2xl p-6 flex items-start justify-between backdrop-blur-lg shadow-2xl shadow-cyan-500/5 hover:bg-gray-900/80 transition-colors duration-300`}
    >
      <div>
        <p className="text-sm text-cyan-200/80 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {change && (
          <p className={`text-sm mt-2 flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1"/> : <TrendingDown className="w-4 h-4 mr-1"/>}
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${bgColor} border ${borderColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </motion.div>
  );
};

export default StatCard;
