import React from 'react';
import { Landmark, Scale, CheckCircle, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface BalanceSheetOverviewProps {
  assets: number;
  liabilities: number;
  equity: number;
  formatCurrency: (amount: number) => string;
}

const InfoBox: React.FC<{ icon: LucideIcon; title: string; value: string; color: string }> = ({ icon: Icon, title, value, color }) => (
  <motion.div 
    className="bg-cyan-500/10 p-6 rounded-lg border border-cyan-500/20 text-center"
    whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 211, 238, 0.15)' }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="flex justify-center items-center mb-4">
      <div className="p-3 bg-cyan-500/10 rounded-full border border-cyan-500/30">
        <Icon className={`w-8 h-8 ${color}`}/>
      </div>
    </div>
    <p className="text-sm text-cyan-200/80">{title}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
  </motion.div>
);

const BalanceSheetOverview: React.FC<BalanceSheetOverviewProps> = ({ assets, liabilities, equity, formatCurrency }) => {
  const items = [
    { icon: Landmark, title: "Total Assets", value: formatCurrency(assets), color: "text-blue-300" },
    { icon: Scale, title: "Total Liabilities", value: formatCurrency(liabilities), color: "text-red-300" },
    { icon: CheckCircle, title: "Net Equity", value: formatCurrency(equity), color: "text-green-300" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <InfoBox key={index} {...item} />
      ))}
    </div>
  );
};

export default BalanceSheetOverview;
