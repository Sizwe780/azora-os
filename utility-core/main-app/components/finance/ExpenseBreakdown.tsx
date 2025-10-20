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
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-cyan-200/80 group-hover:text-cyan-100 transition-colors">{name}</span>
        <span className="text-sm font-medium text-white">{formatCurrency(value)}</span>
      </div>
      <div className="w-full bg-cyan-500/10 rounded-full h-2.5 overflow-hidden border border-cyan-500/20">
        <motion.div 
          className="h-full rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${color}99, ${color}ff)`,
            boxShadow: `0 0 10px ${color}99`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        />
      </div>
    </div>
  );
};

const ExpenseBreakdown: React.FC<{ data: any; total: number; formatCurrency: any }> = ({ data, total, formatCurrency }) => {
  return (
    <div className="space-y-5">
      {data.map(item => (
        <ProgressBar key={item.name} name={item.name} value={item.value} total={total} color={item.color} formatCurrency={formatCurrency} />
      ))}
    </div>
  );
};

export default ExpenseBreakdown;
