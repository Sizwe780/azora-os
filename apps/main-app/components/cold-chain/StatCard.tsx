import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  metric?: string;
  color: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, metric, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`bg-gray-900/50 border rounded-2xl p-4 backdrop-blur-lg`}
    style={{ borderColor: `${color}4D` }} // 30% opacity
  >
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm`} style={{ color }}>{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-xl`} style={{ backgroundColor: `${color}26` }}>
        <Icon className={`w-6 h-6`} style={{ color }} />
      </div>
    </div>
    {metric && <p className="text-xs text-gray-400 mt-1">{metric}</p>}
  </motion.div>
);

export default StatCard;
