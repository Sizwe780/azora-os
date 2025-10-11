import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change, color }) => {
  const isPositive = change.startsWith('+');
  const iconColor = `text-${color}-400`;
  const borderColor = `border-${color}-500/30`;

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="bg-gray-950/50 border border-white/10 rounded-xl p-6 flex items-start justify-between backdrop-blur-sm"
    >
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {change && (
          <p className={`text-sm mt-1 flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1"/> : <TrendingDown className="w-4 h-4 mr-1"/>}
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-gray-800/60 border ${borderColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </motion.div>
  );
};

export default StatCard;
