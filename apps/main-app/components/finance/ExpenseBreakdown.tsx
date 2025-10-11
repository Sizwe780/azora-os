import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  name: string;
  value: number;
  total: number;
  color: string;
  formatCurrency: (amount: number) => string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ name, value, total, color, formatCurrency }) => {
  const percentage = (value / total) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-300">{name}</span>
        <span className="text-sm font-medium text-white">{formatCurrency(value)}</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
        <motion.div 
          className="h-2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

const ExpenseBreakdown: React.FC<{ data: any; total: number; formatCurrency: any }> = ({ data, total, formatCurrency }) => {
  return (
    <div className="space-y-4">
      {data.map(item => (
        <ProgressBar key={item.name} name={item.name} value={item.value} total={total} color={item.color} formatCurrency={formatCurrency} />
      ))}
    </div>
  );
};

export default ExpenseBreakdown;
